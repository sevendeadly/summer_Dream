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
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body);

    // Validate RSVP data
    const validation = validateRSVPData(data);
    if (!validation.isValid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          errors: validation.errors
        }),
      };
    }

    // Create RSVP object
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

    // Store in Netlify Blob Storage
    const store = getStore('rsvps');
    await store.set(rsvpId, JSON.stringify(rsvp));

    console.log(`✅ RSVP stored: ${rsvpId} - ${rsvp.name} (${rsvp.email})`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        id: rsvpId,
        message: 'RSVP received! Admin will send confirmation soon.'
      }),
    };
  } catch (error) {
    console.error('❌ Error storing RSVP:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to store RSVP. Please try again.'
      }),
    };
  }
};
