// ==================================
// NETLIFY FUNCTION: Save seating assignments (admin)
// ==================================

const { requireAdminAuth, saveSeatingAssignments } = require('./lib/seating-db');

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

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const assignments = body.assignments;
  if (!Array.isArray(assignments)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'assignments array is required' })
    };
  }

  try {
    const result = await saveSeatingAssignments(assignments);

    if (!result.ok) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: result.error,
          overCapacity: result.overCapacity || undefined
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('save-seating error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to save seating',
        ...(process.env.NETLIFY_DEV && { details: error.message })
      })
    };
  }
};
