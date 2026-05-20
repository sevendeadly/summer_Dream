// ==================================
// NETLIFY FUNCTION: Save seating assignments (admin)
// File: controllers/netlify-func/save-seating.js
//
// Admin-only POST endpoint that persists table assignments.
//
// Body: { assignments: [{ id: number, tableId: string|null }] }
//
// Behaviour:
//  - Validates inputs and capacity (≤ 8 except Prestataires) inside the lib.
//  - Lib wraps the simulate + capacity check + bulk UPDATE in a single
//    pg pool transaction (BEGIN / COMMIT / ROLLBACK).
//  - On over-capacity returns 400 with { error, overCapacity: [...] } so the
//    admin UI can surface offending tables.
// ==================================

const {
  requireAdminAuth,
  saveSeatingAssignments,
  generateRequestId
} = require('./lib/seating-db');

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
  console.log(`[${requestId}] 💾 Save seating request received`);

  if (event.httpMethod !== 'POST') {
    console.warn(`[${requestId}] ⚠️ Invalid HTTP method: ${event.httpMethod}`);
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  const auth = requireAdminAuth(event, requestId);
  if (!auth.ok) {
    return { statusCode: auth.statusCode, headers: { 'Content-Type': 'application/json' }, body: auth.body };
  }
  console.log(`[${requestId}] ✅ Admin authenticated`);

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (parseError) {
    console.error(`[${requestId}] ❌ Invalid JSON body:`, parseError.message);
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const assignments = body.assignments;
  if (!Array.isArray(assignments)) {
    console.warn(`[${requestId}] ⚠️ assignments missing or not an array`);
    return jsonResponse(400, { error: 'assignments array is required' });
  }

  console.log(`[${requestId}] 📝 Applying ${assignments.length} assignment(s)`);

  try {
    const result = await saveSeatingAssignments(assignments);
    const durationMs = Date.now() - startedAt;

    if (!result.ok) {
      if (result.overCapacity) {
        console.warn(
          `[${requestId}] ⚠️ Over-capacity rejection on ${result.overCapacity.length} table(s) (${durationMs}ms)`
        );
      } else {
        console.warn(`[${requestId}] ⚠️ Save rejected: ${result.error} (${durationMs}ms)`);
      }
      return jsonResponse(400, {
        error: result.error,
        ...(result.overCapacity ? { overCapacity: result.overCapacity } : {})
      });
    }

    console.log(
      `[${requestId}] ✅ Committed ${result.updated} update(s) in ${durationMs}ms`
    );
    return jsonResponse(200, { success: true, updated: result.updated });
  } catch (error) {
    console.error(`[${requestId}] ❌ save-seating failed:`, error.message);
    console.error(`[${requestId}] Stack:`, error.stack);
    return jsonResponse(500, {
      error: 'Failed to save seating',
      ...(process.env.NETLIFY_DEV && { details: error.message, errorType: error.name })
    });
  }
};
