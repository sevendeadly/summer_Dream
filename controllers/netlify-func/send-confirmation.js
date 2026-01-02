// ===========================
// NETLIFY FUNCTION: Send Confirmation Email (SendGrid)
// File: controllers/netlify-func/send-confirmation.js
// Sends confirmation emails via SendGrid and updates RSVP status
// ===========================

const sgMail = require('@sendgrid/mail');
const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[${requestId}] 📧 Send confirmation request received`);

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.warn(`[${requestId}] ⚠️ Invalid HTTP method: ${event.httpMethod}`);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // Get environment variables
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@yourwedding.com';
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  
  console.log(`[${requestId}] Environment check:`, {
    hasSendGridKey: !!SENDGRID_API_KEY,
    fromEmail: SENDGRID_FROM_EMAIL,
    hasAdminSecret: !!ADMIN_SECRET
  });
  
  if (!SENDGRID_API_KEY) {
    console.error(`[${requestId}] ❌ SendGrid API key not configured`);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'SendGrid API key not configured' }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    console.log(`[${requestId}] Request data:`, {
      rsvpId: data.rsvpId,
      status: data.status,
      declineReason: data.declineReason ? '[provided]' : 'none'
    });

    // Verify admin secret from header
    let secret = event.headers['x-admin-secret'];
    
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
      console.warn(`[${requestId}] ⚠️ Unauthorized confirmation attempt`);
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }
    console.log(`[${requestId}] ✅ Admin authenticated`);

    // Validate rsvpId
    if (!data.rsvpId) {
      console.warn(`[${requestId}] ⚠️ Missing rsvpId in request`);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'rsvpId is required' }),
      };
    }

    // Get RSVP data from storage
    console.log(`[${requestId}] 💾 Fetching RSVP from storage...`);
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

    const rsvpData = await store.get(data.rsvpId);
    
    if (!rsvpData) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'RSVP not found' }),
      };
    }

    const rsvp = JSON.parse(rsvpData);

    // Determine new status based on action (approve or decline)
    // If status is 'Approved' in request, set to approved, else declined
    const newStatus = data.status === 'Approved' ? 'approved' : 'declined';
    rsvp.status = newStatus;
    rsvp.approvedAt = new Date().toISOString();
    
    // Store decline reason if provided
    const declineReason = data.declineReason || '';

    // Initialize SendGrid
    sgMail.setApiKey(SENDGRID_API_KEY);

    // Email template selection logic:
    // - If approved: send accepted template
    // - If declined AND user wanted to attend: send admin-declined template (with reason)
    // - If declined AND user didn't want to attend: send user-declined template (confirmation of their choice)
    let emailTemplate;
    if (newStatus === 'approved') {
      emailTemplate = getAcceptedTemplate(rsvp);
    } else if (rsvp.attending === 'yes') {
      // User wanted to attend but admin declined
      emailTemplate = getAdminDeclinedTemplate(rsvp, declineReason);
    } else {
      // User didn't want to attend, admin confirming their choice
      emailTemplate = getDeclinedTemplate(rsvp);
    }

    // Send email via SendGrid
    await sgMail.send({
      to: rsvp.email,
      from: SENDGRID_FROM_EMAIL,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    // Update RSVP status in storage
    await store.set(data.rsvpId, JSON.stringify(rsvp));
    console.log(`✅ RSVP ${data.rsvpId} updated to ${rsvp.status}`);

    console.log(`📧 Confirmation email sent to ${rsvp.email}`);

    console.log(`[${requestId}] ✅ Confirmation process completed successfully`);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Email sent and RSVP updated' }),
    };
  } catch (error) {
    console.error(`[${requestId}] ❌ ========== ERROR OCCURRED ==========`);
    console.error(`[${requestId}] Error name:`, error.name);
    console.error(`[${requestId}] Error message:`, error.message);
    console.error(`[${requestId}] Stack trace:`, error.stack);
    
    // Check for SendGrid-specific errors
    if (error.response) {
      console.error(`[${requestId}] SendGrid error response:`, {
        statusCode: error.response.statusCode,
        body: error.response.body
      });
    }
    
    console.error(`[${requestId}] =======================================`);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: error.message,
        ...(process.env.NETLIFY_DEV && { errorType: error.name })
      }),
    };
  }
};

// Helper function to escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Email template for accepted RSVPs
function getAcceptedTemplate(data) {
  return {
    subject: '✨ Your RSVP is Confirmed - We Can\'t Wait to See You!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d4a5a5 0%, #c9a86a 100%); 
                   color: white; padding: 40px 20px; text-align: center; }
          .content { background: #ffffff; padding: 30px; }
          .details { background: #faf8f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
          .button { display: inline-block; background: #d4a5a5; color: white; 
                   padding: 12px 30px; text-decoration: none; border-radius: 5px; 
                   margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 2.5em;">💕</h1>
            <h2 style="margin: 10px 0 0 0;">J-D & A-N</h2>
            <p style="margin: 10px 0 0 0;">June 12, 2026</p>
          </div>
          
          <div class="content">
            <h2 style="color: #d4a5a5;">Dear ${escapeHtml(data.name)},</h2>
            
            <p>We're absolutely thrilled that you'll be joining us on our special day! Your RSVP has been confirmed.</p>
            
            <div class="details">
              <h3 style="color: #c9a86a; margin-top: 0;">Your RSVP Details</h3>
              <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
              <p><strong>Number of Guests:</strong> ${escapeHtml(data.guests)}</p>
              ${data.dietary ? `<p><strong>Dietary Requirements:</strong> ${escapeHtml(data.dietary)}</p>` : ''}
              ${data.message ? `<p><strong>Your Message:</strong> "${escapeHtml(data.message)}"</p>` : ''}
            </div>
            
            <h3 style="color: #d4a5a5;">Wedding Details</h3>
            <p><strong>Date:</strong> Friday, June 12, 2026</p>
            <p><strong>Ceremony:</strong> 3:30 PM</p>
            <p><strong>Venue:</strong> <p><strong>Gardenia Receptions</strong></p>
                    <p>74 Rue de Dampont</p>
                    <p>Us, Ile-de-France</p></p>
            <p><strong>Dress Code:</strong> Semi-Formal / Cocktail Attire</p>
            
            <center>
              <a href="https://summerdreams.netlify.app/views/info" class="button">
                View Full Wedding Details
              </a>
            </center>
            
            <h3 style="color: #d4a5a5;">What to Expect</h3>
            <ul>
              <li>2:00 PM - Guest Arrival</li>
              <li>2:30 PM - Welcome Drinks</li>
              <li>3:30 PM - Religious Ceremony Begins</li>
              <li>4:30 PM - Cocktail Hour</li>
              <li>7:30 PM - Reception & Dinner</li>
              <li>10:00 PM - Last Dance</li>
            </ul>
            
            <p style="margin-top: 30px;">If you have any questions or need to update your RSVP, please reply to this email or visit our website.</p>
            
            <p style="margin-top: 30px;"><em>With love and excitement,</em><br>
            <strong>J-D & A-N</strong></p>
          </div>
          
          <div class="footer">
            <p>This email was sent because you submitted an RSVP for our wedding.</p>
            <p>© 2026 J-D & A-N Wedding</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

// Email template for declined RSVPs (when user didn't want to attend)
function getDeclinedTemplate(data) {
  return {
    subject: 'Thank You for Letting Us Know',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d4a5a5 0%, #c9a86a 100%); 
                   color: white; padding: 40px 20px; text-align: center; }
          .content { background: #ffffff; padding: 30px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 2.5em;">💕</h1>
            <h2 style="margin: 10px 0 0 0;">J-D & A-N</h2>
          </div>
          
          <div class="content">
            <h2 style="color: #d4a5a5;">Dear ${escapeHtml(data.name)},</h2>
            
            <p>Thank you so much for taking the time to let us know you won't be able to join us on June 12, 2026.</p>
            
            <p>We're sad you can't be there, but we completely understand. We'll be thinking of you on our special day! 💕</p>
            
            ${data.message ? `<p style="font-style: italic; background: #faf8f5; padding: 15px; border-radius: 5px;">Your message: "${escapeHtml(data.message)}"</p>` : ''}
            
            <p style="margin-top: 30px;">After the wedding, we'll share photos and memories on our website. We'd love for you to check them out!</p>
            
            <p style="margin-top: 30px;"><em>With love,</em><br>
            <strong>J-D & A-N</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2026 J-D & A-N Wedding</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

// Email template for when admin declines a user who wanted to attend
function getAdminDeclinedTemplate(data, reason) {
  return {
    subject: 'Update on Your RSVP Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d4a5a5 0%, #c9a86a 100%); 
                   color: white; padding: 40px 20px; text-align: center; }
          .content { background: #ffffff; padding: 30px; }
          .reason-box { background: #fff5f5; border-left: 4px solid #d4a5a5; 
                       padding: 20px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 2.5em;">💕</h1>
            <h2 style="margin: 10px 0 0 0;">J-D & A-N</h2>
          </div>
          
          <div class="content">
            <h2 style="color: #d4a5a5;">Dear ${escapeHtml(data.name)},</h2>
            
            <p>Thank you so much for your interest in joining us on our special day, June 12, 2026.</p>
            
            <p>We truly appreciate you taking the time to submit your RSVP. However, after careful consideration, we're unable to accommodate your request at this time.</p>
            
            ${reason ? `
            <div class="reason-box">
              <h3 style="color: #c9a86a; margin-top: 0;">Reason:</h3>
              <p style="margin-bottom: 0;">${escapeHtml(reason).replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}
            
            <p>We understand this may be disappointing, and we sincerely apologize for any inconvenience this may cause.</p>
            
            <p>We hope you understand, and we'd still love to celebrate with you in other ways. After the wedding, we'll share photos and memories on our website, and we'd be delighted if you'd check them out!</p>
            
            <p style="margin-top: 30px;">If you have any questions or concerns, please don't hesitate to reach out to us.</p>
            
            <p style="margin-top: 30px;"><em>With love and understanding,</em><br>
            <strong>J-D & A-N</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2026 J-D & A-N Wedding</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}
