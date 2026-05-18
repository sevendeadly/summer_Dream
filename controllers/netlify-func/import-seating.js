// ==================================
// NETLIFY FUNCTION: Import guest list / seed (admin)
// ==================================

const fs = require('fs');
const path = require('path');
const {
  requireAdminAuth,
  importGuestNames,
  applySeedAssignments
} = require('./lib/seating-db');

function readJsonFile(relativePath) {
  const filePath = path.join(process.cwd(), relativePath);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const auth = requireAdminAuth(event);
  if (!auth.ok) {
    return { statusCode: auth.statusCode, body: auth.body };
  }

  let body = {};
  try {
    if (event.body) {
      body = JSON.parse(event.body);
    }
  } catch (_e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const mode = body.mode || 'guests';

  try {
    if (mode === 'guests') {
      let names = body.names;
      if (!names) {
        names = readJsonFile('data/guest-list.json');
      }
      if (!Array.isArray(names)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'names must be an array' })
        };
      }
      const stats = await importGuestNames(names);
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, ...stats })
      };
    }

    if (mode === 'seed') {
      let assignments = body.assignments;
      if (!assignments) {
        const seed = readJsonFile('data/seating-seed.json');
        assignments = seed.assignments || [];
      }
      const stats = await applySeedAssignments(assignments);
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, ...stats })
      };
    }

    if (mode === 'both') {
      const names = body.names || readJsonFile('data/guest-list.json');
      const guestStats = await importGuestNames(names);
      const seed = readJsonFile('data/seating-seed.json');
      const seedStats = await applySeedAssignments(seed.assignments || []);
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          guests: guestStats,
          seed: seedStats
        })
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid mode. Use guests, seed, or both.' })
    };
  } catch (error) {
    console.error('import-seating error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to import seating data',
        ...(process.env.NETLIFY_DEV && { details: error.message })
      })
    };
  }
};
