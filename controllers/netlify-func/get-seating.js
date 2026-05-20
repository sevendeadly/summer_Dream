// ==================================
// NETLIFY FUNCTION: Get full seating chart (admin)
// File: controllers/netlify-func/get-seating.js
//
// Admin-only GET endpoint that returns the full seating chart for the
// dashboard's Seating tab. Authenticated via X-Admin-Secret (base64-aware,
// same pattern as get-rsvps.js / delete-rsvp.js).
//
// Response shape: { tables: [...], guests: [{ id, displayName, tableId }] }
// ==================================

const {
  requireAdminAuth,
  getSeatingChart,
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
  console.log(`[${requestId}] 📥 Get seating chart request received`);

  if (event.httpMethod !== 'GET') {
    console.warn(`[${requestId}] ⚠️ Invalid HTTP method: ${event.httpMethod}`);
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  const auth = requireAdminAuth(event, requestId);
  if (!auth.ok) {
    return { statusCode: auth.statusCode, headers: { 'Content-Type': 'application/json' }, body: auth.body };
  }
  console.log(`[${requestId}] ✅ Admin authenticated`);

  try {
    const chart = await getSeatingChart();
    const durationMs = Date.now() - startedAt;
    console.log(
      `[${requestId}] ✅ Returned ${chart.tables.length} tables / ${chart.guests.length} guests (${durationMs}ms)`
    );
    return jsonResponse(200, chart);
  } catch (error) {
    console.error(`[${requestId}] ❌ get-seating failed:`, error.message);
    console.error(`[${requestId}] Stack:`, error.stack);
    return jsonResponse(500, {
      error: 'Failed to load seating chart',
      ...(process.env.NETLIFY_DEV && { details: error.message, errorType: error.name })
    });
  }
};
