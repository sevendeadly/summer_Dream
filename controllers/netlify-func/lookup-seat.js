// ==================================
// NETLIFY FUNCTION: Public seat lookup
// File: controllers/netlify-func/lookup-seat.js
//
// PURPOSE:
// Public endpoint that returns ONE guest + table label per request. The
// full chart is never exposed to the browser. Powers the QR-only
// `/seating` page; called from controllers/seating_lookup.js.
//
// FLOW:
//   POST { name }                          -> one match | ambiguous | 404
//   POST { displayName } (after ambiguity) -> exact match | 404
//
// SECURITY / OPS:
//  - Honors SEATING_ENABLED=false (503).
//  - CORS preflight allowed (Origin: *).
//  - Structured logs with request id; guest names redacted (PII safe).
// ==================================

const {
  lookupGuest,
  isSeatingEnabled,
  generateRequestId,
  redactName
} = require('./lib/seating-db');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };
}

exports.handler = async (event) => {
  const requestId = generateRequestId();
  const startedAt = Date.now();
  console.log(`[${requestId}] 🔎 Seat lookup request received`);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    console.warn(`[${requestId}] ⚠️ Invalid HTTP method: ${event.httpMethod}`);
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  if (!isSeatingEnabled()) {
    console.warn(`[${requestId}] ⚠️ Seating lookup disabled by SEATING_ENABLED`);
    return jsonResponse(503, { error: 'Seating lookup is currently unavailable' });
  }

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (parseError) {
    console.error(`[${requestId}] ❌ Invalid JSON body:`, parseError.message);
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const name = typeof body.name === 'string' ? body.name : undefined;
  const displayName = typeof body.displayName === 'string' ? body.displayName : undefined;

  if (!name && !displayName) {
    console.warn(`[${requestId}] ⚠️ Missing name/displayName in request`);
    return jsonResponse(400, { error: 'Name is required' });
  }

  const queryLabel = displayName ? 'displayName' : 'name';
  const queryValue = displayName || name || '';
  console.log(
    `[${requestId}] 🔎 Lookup by ${queryLabel}=${redactName(queryValue)} (len=${queryValue.length})`
  );

  try {
    const result = await lookupGuest({ name, displayName });
    const durationMs = Date.now() - startedAt;

    if (result.invalid) {
      console.warn(`[${requestId}] ⚠️ Normalized name was empty after sanitization`);
      return jsonResponse(400, { error: 'Name is required' });
    }

    if (result.ambiguous) {
      console.log(
        `[${requestId}] 🔀 Ambiguous match: ${result.options.length} options (${durationMs}ms)`
      );
      return jsonResponse(200, {
        ambiguous: true,
        options: result.options
      });
    }

    if (result.unassigned) {
      console.log(
        `[${requestId}] 🪑 Guest matched but unassigned: ${redactName(result.displayName)} (${durationMs}ms)`
      );
      return jsonResponse(404, {
        error: 'No table assigned yet',
        displayName: result.displayName
      });
    }

    if (!result.found) {
      console.log(`[${requestId}] 🚫 Guest not found (${durationMs}ms)`);
      return jsonResponse(404, { error: 'Guest not found' });
    }

    console.log(
      `[${requestId}] ✅ Match for ${redactName(result.displayName)} → ${result.tableLabel} (${durationMs}ms)`
    );
    return jsonResponse(200, {
      displayName: result.displayName,
      tableLabel: result.tableLabel
    });
  } catch (error) {
    console.error(`[${requestId}] ❌ lookup-seat failed:`, error.message);
    console.error(`[${requestId}] Stack:`, error.stack);
    return jsonResponse(500, {
      error: 'Failed to look up seating',
      ...(process.env.NETLIFY_DEV && { details: error.message, errorType: error.name })
    });
  }
};
