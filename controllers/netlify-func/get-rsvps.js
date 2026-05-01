// ==================================
// NETLIFY FUNCTION: Get RSVPs from Storage
// File: controllers/netlify-func/get-rsvps.js
// Retrieves RSVPs from Netlify Blob Storage
// ==================================

const { getStore } = require('@netlify/blobs');

const GET_CONCURRENCY = 8;
const GET_MAX_RETRIES = 3;
const GET_RETRY_BASE_MS = 150;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Collect every blob key using explicit pagination (belt-and-suspenders on Netlify).
 * The default `list()` also aggregates pages, but iterating with `paginate: true`
 * makes behavior obvious and easier to log.
 */
async function listAllBlobKeys(store, requestId) {
  const keys = [];
  const seen = new Set();

  for await (const entry of store.list({ paginate: true })) {
    for (const blob of entry.blobs || []) {
      if (blob?.key && !seen.has(blob.key)) {
        seen.add(blob.key);
        keys.push(blob.key);
      }
    }
  }

  console.log(`[${requestId}] 📋 Listed ${keys.length} unique blob keys (paginated)`);
  return keys;
}

async function getBlobTextWithRetry(store, key, requestId) {
  let lastError;
  for (let attempt = 1; attempt <= GET_MAX_RETRIES; attempt++) {
    try {
      return await store.get(key);
    } catch (err) {
      lastError = err;
      const wait = GET_RETRY_BASE_MS * Math.pow(2, attempt - 1);
      console.warn(
        `[${requestId}] ⚠️ store.get("${key}") failed (attempt ${attempt}/${GET_MAX_RETRIES}): ${err.message}. Retrying in ${wait}ms`
      );
      await sleep(wait);
    }
  }
  throw lastError;
}

/**
 * Run async work in limited parallel batches (avoids thundering herd on Blobs API).
 */
async function mapInBatches(items, batchSize, mapper) {
  const out = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchOut = await Promise.all(batch.map(mapper));
    out.push(...batchOut);
  }
  return out;
}

exports.handler = async (event, context) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startedAt = Date.now();
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
  const originalSecret = secret;
  try {
    if (secret) {
      const isBase64 = /^[A-Za-z0-9+/=]+$/.test(secret) && secret.length > 10;

      if (isBase64) {
        const decoded = Buffer.from(secret, 'base64').toString('utf-8');
        secret = decoded;
        console.log(`[${requestId}] ✅ Decoded base64 secret (length: ${secret.length})`);
      } else {
        console.log(`[${requestId}] ℹ️ Secret doesn't appear to be base64, using as-is`);
      }
    }
  } catch (decodeError) {
    console.warn(`[${requestId}] ⚠️ Failed to decode secret, trying as-is:`, decodeError.message);
    secret = originalSecret;
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
      store = getStore('rsvps');
      console.log(`[${requestId}] ✅ Blob store initialized (auto-detect - production mode)`);
    } catch (autoDetectError) {
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

    const keys = await listAllBlobKeys(store, requestId);
    const readStartedAt = Date.now();

    const failedKeys = [];

    const readResults = await mapInBatches(keys, GET_CONCURRENCY, async (key) => {
      try {
        const rsvpData = await getBlobTextWithRetry(store, key, requestId);
        if (!rsvpData) {
          return { key, rsvp: null, error: null };
        }
        try {
          return { key, rsvp: JSON.parse(rsvpData), error: null };
        } catch (parseError) {
          console.error(`[${requestId}] ⚠️ Error parsing RSVP ${key}:`, parseError.message);
          return { key, rsvp: null, error: 'parse' };
        }
      } catch (err) {
        console.error(`[${requestId}] ❌ Failed to read RSVP blob ${key} after retries:`, err.message);
        failedKeys.push({ key, message: err.message });
        return { key, rsvp: null, error: 'get' };
      }
    });

    console.log(`[${requestId}] ⚡ Blob reads finished in ${Date.now() - readStartedAt}ms`);

    const rsvps = [];
    let pending = 0;
    let approved = 0;
    let declined = 0;

    for (const row of readResults) {
      if (!row.rsvp) continue;
      rsvps.push(row.rsvp);
      if (row.rsvp.status === 'pending') pending++;
      else if (row.rsvp.status === 'approved') approved++;
      else if (row.rsvp.status === 'declined') declined++;
    }

    // Sort by submission date (newest first)
    rsvps.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    const durationMs = Date.now() - startedAt;
    console.log(
      `[${requestId}] ✅ Retrieved ${rsvps.length}/${keys.length} RSVPs (${pending} pending, ${approved} approved, ${declined} declined) in ${durationMs}ms`
    );

    if (failedKeys.length > 0) {
      console.error(`[${requestId}] ⚠️ ${failedKeys.length} blob(s) could not be loaded:`, failedKeys);
    }

    const payload = {
      results: rsvps,
      total: rsvps.length,
      pending,
      approved,
      declined,
      listedBlobCount: keys.length
    };

    if (failedKeys.length > 0) {
      payload.failedBlobLoads = failedKeys;
    }

    return {
      statusCode: 200,
      body: JSON.stringify(payload)
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
