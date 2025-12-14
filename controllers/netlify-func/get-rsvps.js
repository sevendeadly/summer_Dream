// ==================================
// NETLIFY FUNCTION: Get RSVPs from Storage
// File: controllers/netlify-func/get-rsvps.js
// Retrieves RSVPs from Netlify Blob Storage
// ==================================

const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Check authorization
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  const secret = event.headers['x-admin-secret'];

  if (secret !== ADMIN_SECRET) {
    console.warn('⚠️ Unauthorized access attempt to get-rsvps');
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized - invalid admin secret' })
    };
  }

  try {
    const store = getStore('rsvps');
    
    // Get all RSVP entries from blob storage
    const { blobs } = await store.list();
    
    const rsvps = [];
    let pending = 0;
    let approved = 0;
    let declined = 0;

    // Fetch each RSVP
    for (const blob of blobs) {
      const rsvpData = await store.get(blob.key);
      if (rsvpData) {
        const rsvp = JSON.parse(rsvpData);
        rsvps.push(rsvp);

        // Count by status
        if (rsvp.status === 'pending') pending++;
        else if (rsvp.status === 'approved') approved++;
        else if (rsvp.status === 'declined') declined++;
      }
    }

    // Sort by submission date (newest first)
    rsvps.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    console.log(`✅ Retrieved ${rsvps.length} RSVPs (${pending} pending, ${approved} approved, ${declined} declined)`);

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
    console.error('❌ Error retrieving RSVPs:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to retrieve RSVPs',
        details: error.message
      })
    };
  }
};