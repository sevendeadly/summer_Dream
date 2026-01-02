// ==================================
// NETLIFY FUNCTION: Get RSVPs from Storage
// File: controllers/netlify-func/get-rsvps.js
// Retrieves RSVPs from Netlify Blob Storage
// ==================================

const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[${requestId}] 📥 Get RSVPs request received`);

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    console.warn(`[${requestId}] ⚠️ Invalid HTTP method: ${event.httpMethod}`);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Check authorization
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  let secret = event.headers['x-admin-secret'];

  if (!ADMIN_SECRET) {
    console.error(`[${requestId}] ❌ ADMIN_SECRET not configured`);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  // Decode base64-encoded secret (handles non-ASCII characters)
  // Node.js doesn't have atob - use Buffer instead
  const originalSecret = secret;
  try {
    if (secret) {
      // Check if it looks like base64 (optional - for backward compatibility)
      const isBase64 = /^[A-Za-z0-9+/=]+$/.test(secret) && secret.length > 10;
      
      if (isBase64) {
        // Decode base64 using Node.js Buffer
        const decoded = Buffer.from(secret, 'base64').toString('utf-8');
        secret = decoded;
        console.log(`[${requestId}] ✅ Decoded base64 secret (length: ${secret.length})`);
      } else {
        // Not base64, use as-is (backward compatibility)
        console.log(`[${requestId}] ℹ️ Secret doesn't appear to be base64, using as-is`);
      }
    }
  } catch (decodeError) {
    // If decoding fails, try using the secret as-is (backward compatibility)
    console.warn(`[${requestId}] ⚠️ Failed to decode secret, trying as-is:`, decodeError.message);
    secret = originalSecret; // Fall back to original
  }

  if (secret !== ADMIN_SECRET) {
    console.warn(`[${requestId}] ⚠️ Unauthorized access attempt to get-rsvps`);
    console.warn(`[${requestId}] Received secret: ${secret ? '[hidden]' : 'none'}`);
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized - invalid admin secret' })
    };
  }

  console.log(`[${requestId}] ✅ Admin authenticated`);

  try {
    console.log(`[${requestId}] 💾 Initializing blob store...`);
    
    let store;
    try {
      // In production, Netlify automatically provides the execution context
      // Try auto-detection first (works in production Netlify)
      store = getStore('rsvps');
      console.log(`[${requestId}] ✅ Blob store initialized (auto-detect - production mode)`);
    } catch (autoDetectError) {
      // If auto-detection fails, try with explicit env vars (for local dev)
      if (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN) {
        store = getStore({
          name: 'rsvps',
          siteID: process.env.NETLIFY_SITE_ID,
          token: process.env.NETLIFY_AUTH_TOKEN
        });
        console.log(`[${requestId}] ✅ Blob store initialized with env vars (local dev mode)`);
      } else {
        // Re-throw the original error if no fallback available
        throw autoDetectError;
      }
    }
    
    // Get all RSVP entries from blob storage
    console.log(`[${requestId}] 📋 Listing all RSVPs...`);
    const { blobs } = await store.list();
    console.log(`[${requestId}] Found ${blobs.length} RSVP entries`);
    
    const rsvps = [];
    let pending = 0;
    let approved = 0;
    let declined = 0;

    // Fetch each RSVP
    for (const blob of blobs) {
      try {
        const rsvpData = await store.get(blob.key);
        if (rsvpData) {
          const rsvp = JSON.parse(rsvpData);
          rsvps.push(rsvp);

          // Count by status
          if (rsvp.status === 'pending') pending++;
          else if (rsvp.status === 'approved') approved++;
          else if (rsvp.status === 'declined') declined++;
        }
      } catch (parseError) {
        console.error(`[${requestId}] ⚠️ Error parsing RSVP ${blob.key}:`, parseError.message);
        // Continue with other RSVPs
      }
    }

    // Sort by submission date (newest first)
    rsvps.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    console.log(`[${requestId}] ✅ Retrieved ${rsvps.length} RSVPs (${pending} pending, ${approved} approved, ${declined} declined)`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        results: rsvps,
        total: rsvps.length,
        pending: pending,
        approved: approved,
        declined: declined
      })
    };
  } catch (error) {
    console.error(`[${requestId}] ❌ ========== ERROR OCCURRED ==========`);
    console.error(`[${requestId}] Error name:`, error.name);
    console.error(`[${requestId}] Error message:`, error.message);
    console.error(`[${requestId}] Stack trace:`, error.stack);
    console.error(`[${requestId}] =======================================`);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to retrieve RSVPs',
        details: error.message,
        ...(process.env.NETLIFY_DEV && { errorType: error.name })
      })
    };
  }
};
