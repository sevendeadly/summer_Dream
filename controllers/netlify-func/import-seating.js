// ==================================
// NETLIFY FUNCTION: Import guest list / seed assignments (admin)
// File: controllers/netlify-func/import-seating.js
//
// Admin-only POST endpoint that bulk-loads the seating database.
//
// Modes:
//   mode: 'guests' (default) — INSERT names into seating_guests
//                              (ON CONFLICT (display_name) DO NOTHING).
//   mode: 'seed'             — UPSERT pre-placed assignments from a seed JSON.
//   mode: 'both'             — Run guests then seed.
//
// Data sources (in order):
//   1. `body.names` / `body.assignments` if supplied by the caller.
//      The admin client fetches `/data/guest-list.json` from the static site
//      and passes it through, which avoids needing the file on the function fs.
//   2. Fallback: `data/guest-list.json` / `data/seating-seed.json` read from
//      disk. This only works in production if those files are added to
//      `[functions] included_files` in netlify.toml.
// ==================================

const fs = require('fs');
const path = require('path');
const {
  requireAdminAuth,
  importGuestNames,
  applySeedAssignments,
  generateRequestId
} = require('./lib/seating-db');

// Candidate locations for repo data files. Netlify Functions can run from
// several working directories depending on bundler (esbuild vs zip-it-and-ship-it)
// and whether `included_files` is configured — try all known layouts.
function candidatePaths(relativePath) {
  return [
    path.join(process.cwd(), relativePath),
    path.join(__dirname, '..', '..', '..', relativePath),
    path.join(__dirname, '..', '..', relativePath),
    path.join(__dirname, '..', relativePath),
    path.join(__dirname, relativePath)
  ];
}

function readJsonFile(relativePath, requestId) {
  const tried = [];
  for (const candidate of candidatePaths(relativePath)) {
    try {
      const raw = fs.readFileSync(candidate, 'utf-8');
      console.log(`[${requestId}] 📄 Loaded ${relativePath} from ${candidate}`);
      return JSON.parse(raw);
    } catch (err) {
      tried.push(`${candidate} (${err.code || err.message})`);
    }
  }
  const error = new Error(
    `Could not read ${relativePath} from any known location. Tried: ${tried.join(' | ')}`
  );
  error.code = 'SEATING_DATA_FILE_MISSING';
  throw error;
}

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload)
  };
}

exports.handler = async (event) => {
  const requestId = generateRequestId();
  const startedAt = Date.now();
  console.log(`[${requestId}] 📥 Import seating request received`);

  if (event.httpMethod !== 'POST') {
    console.warn(`[${requestId}] ⚠️ Invalid HTTP method: ${event.httpMethod}`);
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  const auth = requireAdminAuth(event, requestId);
  if (!auth.ok) {
    return { statusCode: auth.statusCode, headers: { 'Content-Type': 'application/json' }, body: auth.body };
  }
  console.log(`[${requestId}] ✅ Admin authenticated`);

  let body = {};
  try {
    if (event.body) {
      body = JSON.parse(event.body);
    }
  } catch (parseError) {
    console.error(`[${requestId}] ❌ Invalid JSON body:`, parseError.message);
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const mode = body.mode || 'guests';
  console.log(`[${requestId}] 🛠️  Mode: ${mode}`);

  try {
    if (mode === 'guests') {
      let names = body.names;
      if (!names) {
        names = readJsonFile('data/guest-list.json', requestId);
      }
      if (!Array.isArray(names)) {
        console.warn(`[${requestId}] ⚠️ names was not an array (typeof=${typeof names})`);
        return jsonResponse(400, { error: 'names must be an array' });
      }
      const stats = await importGuestNames(names);
      console.log(
        `[${requestId}] ✅ Imported guests: +${stats.inserted} new, ${stats.skipped} skipped (${Date.now() - startedAt}ms)`
      );
      return jsonResponse(200, { success: true, ...stats });
    }

    if (mode === 'seed') {
      let assignments = body.assignments;
      if (!assignments) {
        const seed = readJsonFile('data/seating-seed.json', requestId);
        assignments = seed.assignments || [];
      }
      if (!Array.isArray(assignments)) {
        console.warn(`[${requestId}] ⚠️ seed.assignments was not an array`);
        return jsonResponse(400, { error: 'assignments must be an array' });
      }
      const stats = await applySeedAssignments(assignments);
      console.log(
        `[${requestId}] ✅ Applied seed: ${stats.updated} row(s) upserted (${Date.now() - startedAt}ms)`
      );
      return jsonResponse(200, { success: true, ...stats });
    }

    if (mode === 'both') {
      const names = body.names || readJsonFile('data/guest-list.json', requestId);
      if (!Array.isArray(names)) {
        return jsonResponse(400, { error: 'names must be an array' });
      }
      const guestStats = await importGuestNames(names);

      let seedAssignments = body.assignments;
      if (!seedAssignments) {
        try {
          const seed = readJsonFile('data/seating-seed.json', requestId);
          seedAssignments = Array.isArray(seed.assignments) ? seed.assignments : [];
        } catch (err) {
          if (err.code === 'SEATING_DATA_FILE_MISSING') {
            console.log(`[${requestId}] ℹ️  No seating-seed.json present — skipping seed step`);
            seedAssignments = [];
          } else {
            throw err;
          }
        }
      }

      const seedStats = await applySeedAssignments(seedAssignments);
      console.log(
        `[${requestId}] ✅ Both: guests +${guestStats.inserted}/${guestStats.skipped}, seed ${seedStats.updated} (${Date.now() - startedAt}ms)`
      );
      return jsonResponse(200, {
        success: true,
        guests: guestStats,
        seed: seedStats
      });
    }

    console.warn(`[${requestId}] ⚠️ Unknown mode: ${mode}`);
    return jsonResponse(400, { error: 'Invalid mode. Use guests, seed, or both.' });
  } catch (error) {
    console.error(`[${requestId}] ❌ import-seating failed:`, error.message);
    console.error(`[${requestId}] Stack:`, error.stack);
    const status = error.code === 'SEATING_DATA_FILE_MISSING' ? 500 : 500;
    return jsonResponse(status, {
      error: 'Failed to import seating data',
      ...(process.env.NETLIFY_DEV && { details: error.message, errorType: error.name })
    });
  }
};
