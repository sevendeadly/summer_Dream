// ===========================
// NETLIFY FUNCTION: RSVP Submission
// File: controllers/netlify-func/submit-rsvp.js
// Stores RSVPs in Netlify Blob Storage
// ===========================

const { getStore } = require('@netlify/blobs');

// Validate RSVP data
function validateRSVPData(data) {
  const errors = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!data.email || data.email.trim() === '') {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email is invalid');
  }

  if (!data.attending || !['yes', 'no'].includes(data.attending)) {
    errors.push('Attendance selection is required');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Generate unique ID for RSVP
function generateId() {
  return `rsvp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

exports.handler = async (event, context) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[${requestId}] 📥 RSVP submission request received`);
  console.log(`[${requestId}] Method: ${event.httpMethod}`);
  console.log(`[${requestId}] Headers:`, JSON.stringify(event.headers, null, 2));

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.warn(`[${requestId}] ⚠️ Invalid HTTP method: ${event.httpMethod}`);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // Log request body (sanitized for privacy)
  let requestBody = null;
  try {
    requestBody = event.body ? JSON.parse(event.body) : null;
    const sanitizedBody = requestBody ? {
      ...requestBody,
      email: requestBody.email ? `${requestBody.email.substring(0, 3)}***` : undefined,
      phone: requestBody.phone ? '***' : undefined
    } : null;
    console.log(`[${requestId}] 📋 Request body received:`, JSON.stringify(sanitizedBody, null, 2));
  } catch (parseError) {
    console.error(`[${requestId}] ❌ Failed to parse request body:`, parseError.message);
    console.error(`[${requestId}] Raw body:`, event.body?.substring(0, 200));
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: 'Invalid JSON in request body',
        details: parseError.message
      }),
    };
  }

  try {
    const data = requestBody;

    // Validate RSVP data
    console.log(`[${requestId}] 🔍 Validating RSVP data...`);
    const validation = validateRSVPData(data);
    if (!validation.isValid) {
      console.warn(`[${requestId}] ⚠️ Validation failed:`, validation.errors);
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          errors: validation.errors
        }),
      };
    }
    console.log(`[${requestId}] ✅ Validation passed`);

    // Create RSVP object
    console.log(`[${requestId}] 📝 Creating RSVP object...`);
    const rsvpId = generateId();
    const rsvp = {
      id: rsvpId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: (data.phone || '').trim(),
      attending: data.attending,
      guests: parseInt(data.guests) || 1,
      dietary: (data.dietary || '').trim(),
      message: (data.message || '').trim(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
      approvedAt: null
    };
    console.log(`[${requestId}] ✅ RSVP object created:`, {
      id: rsvpId,
      name: rsvp.name,
      email: `${rsvp.email.substring(0, 3)}***`,
      attending: rsvp.attending,
      guests: rsvp.guests
    });

    // Store in Netlify Blob Storage
    console.log(`[${requestId}] 💾 Initializing blob store...`);
    let store;
    try {
      // In production, Netlify automatically provides the execution context
      // Try auto-detection first (works in production Netlify)
      try {
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
    } catch (storeInitError) {
      console.error(`[${requestId}] ❌ Failed to initialize blob store:`, storeInitError.message);
      console.error(`[${requestId}] Stack trace:`, storeInitError.stack);
      console.error(`[${requestId}] Environment check:`, {
        NETLIFY_SITE_ID: !!process.env.NETLIFY_SITE_ID,
        NETLIFY_AUTH_TOKEN: !!process.env.NETLIFY_AUTH_TOKEN,
        NETLIFY_BLOBS_CONTEXT: !!process.env.NETLIFY_BLOBS_CONTEXT,
        hasContext: !!context,
        contextSiteId: context?.site?.id
      });
      throw new Error(`Blob store initialization failed: ${storeInitError.message}`);
    }
    
    console.log(`[${requestId}] 💾 Storing RSVP in blob storage...`);
    try {
      await store.set(rsvpId, JSON.stringify(rsvp));
      console.log(`[${requestId}] ✅ RSVP stored successfully: ${rsvpId} - ${rsvp.name} (${rsvp.email})`);
    } catch (storeError) {
      console.error(`[${requestId}] ❌ Failed to store RSVP:`, storeError.message);
      console.error(`[${requestId}] Stack trace:`, storeError.stack);
      console.error(`[${requestId}] Error name:`, storeError.name);
      console.error(`[${requestId}] Error details:`, {
        message: storeError.message,
        code: storeError.code,
        statusCode: storeError.statusCode
      });
      throw new Error(`Failed to store RSVP in blob storage: ${storeError.message}`);
    }
    const store = getStore(storeOptions); */
    const store = getStore('rsvps');
    
    await store.set(rsvpId, JSON.stringify(rsvp));

    console.log(`✅ RSVP stored: ${rsvpId} - ${rsvp.name} (${rsvp.email})`);

    console.log(`[${requestId}] ✅ RSVP submission completed successfully`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        id: rsvpId,
        message: 'RSVP received! Admin will send confirmation soon.'
      }),
    };
  } catch (error) {
    // Enhanced error logging
    console.error(`[${requestId}] ❌ ========== ERROR OCCURRED ==========`);
    console.error(`[${requestId}] Error name:`, error.name);
    console.error(`[${requestId}] Error message:`, error.message);
    console.error(`[${requestId}] Error stack:`, error.stack);
    console.error(`[${requestId}] Error details:`, {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      cause: error.cause
    });
    
    // Check for specific error types
    if (error.name === 'MissingBlobsEnvironmentError') {
      console.error(`[${requestId}] 🔴 BLOB STORAGE CONFIGURATION ERROR`);
      console.error(`[${requestId}] This is a configuration issue with Netlify Blobs`);
      console.error(`[${requestId}] Context info:`, {
        hasContext: !!context,
        contextKeys: context ? Object.keys(context) : [],
        siteId: context?.site?.id,
        envVars: Object.keys(process.env).filter(k => k.includes('NETLIFY') || k.includes('BLOB'))
      });
    }
    
    console.error(`[${requestId}] =======================================`);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to store RSVP. Please try again.',
        // Include error details in development (remove in production if needed)
        ...(process.env.NETLIFY_DEV && {
          details: error.message,
          errorType: error.name
        })
      }),
    };
  }
};
