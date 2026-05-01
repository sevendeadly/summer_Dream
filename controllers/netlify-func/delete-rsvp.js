const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[${requestId}] 🗑️ Delete RSVP request received`);

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  let secret = event.headers['x-admin-secret'];

  if (!ADMIN_SECRET) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  const originalSecret = secret;
  try {
    if (secret) {
      const isBase64 = /^[A-Za-z0-9+/=]+$/.test(secret) && secret.length > 10;
      if (isBase64) {
        secret = Buffer.from(secret, 'base64').toString('utf-8');
      }
    }
  } catch (decodeError) {
    console.warn(`[${requestId}] Failed to decode admin secret:`, decodeError.message);
    secret = originalSecret;
  }

  if (secret !== ADMIN_SECRET) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const rsvpId = data.rsvpId;
    if (!rsvpId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'rsvpId is required' })
      };
    }

    let store;
    try {
      store = getStore('rsvps');
    } catch (autoDetectError) {
      if (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN) {
        store = getStore({
          name: 'rsvps',
          siteID: process.env.NETLIFY_SITE_ID,
          token: process.env.NETLIFY_AUTH_TOKEN
        });
      } else {
        throw autoDetectError;
      }
    }

    const existingData = await store.get(rsvpId);
    if (!existingData) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'RSVP not found' })
      };
    }

    await store.delete(rsvpId);
    console.log(`[${requestId}] ✅ Deleted RSVP: ${rsvpId}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'RSVP deleted successfully' })
    };
  } catch (error) {
    console.error(`[${requestId}] ❌ Delete RSVP failed:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to delete RSVP',
        details: error.message
      })
    };
  }
};
