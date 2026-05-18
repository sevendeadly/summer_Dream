// ==================================
// NETLIFY FUNCTION: Get full seating chart (admin)
// ==================================

const { requireAdminAuth, getSeatingChart } = require('./lib/seating-db');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const auth = requireAdminAuth(event);
  if (!auth.ok) {
    return { statusCode: auth.statusCode, body: auth.body };
  }

  try {
    const chart = await getSeatingChart();
    return {
      statusCode: 200,
      body: JSON.stringify(chart)
    };
  } catch (error) {
    console.error('get-seating error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to load seating chart',
        ...(process.env.NETLIFY_DEV && { details: error.message })
      })
    };
  }
};
