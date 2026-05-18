// ==================================
// NETLIFY FUNCTION: Public seat lookup
// Returns ONE guest + table only (never full chart)
// ==================================

const { lookupGuest, isSeatingEnabled } = require('./lib/seating-db');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  if (!isSeatingEnabled()) {
    return {
      statusCode: 503,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Seating lookup is currently unavailable' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_e) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const name = body.name;
  const displayName = body.displayName;

  if (!name && !displayName) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Name is required' })
    };
  }

  try {
    const result = await lookupGuest({ name, displayName });

    if (result.invalid) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Name is required' })
      };
    }

    if (result.ambiguous) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          ambiguous: true,
          options: result.options
        })
      };
    }

    if (result.unassigned) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'No table assigned yet',
          displayName: result.displayName
        })
      };
    }

    if (!result.found) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Guest not found' })
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        displayName: result.displayName,
        tableLabel: result.tableLabel
      })
    };
  } catch (error) {
    console.error('lookup-seat error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Failed to look up seating',
        ...(process.env.NETLIFY_DEV && { details: error.message })
      })
    };
  }
};
