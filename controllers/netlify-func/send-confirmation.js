// ===========================
// NETLIFY FUNCTION: Send Confirmation Email (Brevo)
// File: controllers/netlify-func/send-confirmation.js
// 
// PURPOSE:
// This serverless function handles sending email confirmations to guests when
// an admin approves or declines their RSVP. It integrates with Brevo for
// email delivery and Netlify Blobs for data storage.
//
// WORKFLOW:
// 1. Admin clicks "Approve" or "Decline" in admin dashboard
// 2. Admin dashboard calls this function with rsvpId and status
// 3. Function authenticates admin using X-Admin-Secret header
// 4. Function retrieves RSVP data from Netlify Blobs
// 5. Function determines which email template to use:
//    - Approved: Accepted template (with optional admin message)
//    - Declined + guest wanted to attend: Admin-declined template (with reason)
//    - Declined + guest didn't want to attend: User-declined template
// 6. Function sends email via Brevo
// 7. Function updates RSVP status in storage
// 8. Function returns success/error response
//
// SECURITY:
// - Admin authentication via X-Admin-Secret header
// - Base64 encoding support for non-ASCII secrets
// - HTML escaping in email templates to prevent XSS
// - Environment variables for sensitive data (API keys, secrets)
// ===========================

const { BrevoClient } = require('@getbrevo/brevo');
const { getStore } = require('@netlify/blobs');

/**
 * Netlify Function Handler
 * 
 * This is the main entry point for the serverless function. It's called by
 * Netlify when an HTTP request is made to the function endpoint.
 * 
 * @param {Object} event - HTTP request event object
 *   - event.httpMethod: HTTP method (GET, POST, etc.)
 *   - event.body: Request body (JSON string)
 *   - event.headers: Request headers object
 * @param {Object} context - Netlify execution context
 *   - context.site: Site information (in production)
 *   - context.site.id: Netlify site ID
 *   - context.site.apiToken: API token for Netlify services
 * 
 * @returns {Object} HTTP response
 *   - statusCode: HTTP status code (200, 400, 401, 404, 500)
 *   - body: JSON string with response data
 */
exports.handler = async (event, context) => {
  // Generate unique request ID for logging and debugging
  // This helps track requests across multiple log entries
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[${requestId}] 📧 Send confirmation request received`);

  // Security: Only allow POST requests
  // GET requests could expose sensitive information or allow CSRF attacks
  if (event.httpMethod !== 'POST') {
    console.warn(`[${requestId}] ⚠️ Invalid HTTP method: ${event.httpMethod}`);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // ============================================
  // ENVIRONMENT VARIABLES
  // ============================================
  // These are set in Netlify Dashboard → Site Settings → Environment Variables
  // Never hardcode these values in the code!
  
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'noreply@yourwedding.com';
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  
  console.log(`[${requestId}] Environment check:`, {
    hasBrevoKey: !!BREVO_API_KEY,
    fromEmail: BREVO_FROM_EMAIL,
    hasAdminSecret: !!ADMIN_SECRET
  });
  
  if (!BREVO_API_KEY) {
    console.error(`[${requestId}] ❌ Brevo API key not configured`);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Brevo API key not configured' }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    console.log(`[${requestId}] Request data:`, {
      rsvpId: data.rsvpId,
      status: data.status,
      resendOnly: !!data.resendOnly,
      declineReason: data.declineReason ? '[provided]' : 'none',
      adminMessage: data.adminMessage ? '[provided]' : 'none'
    });

    // ============================================
    // ADMIN AUTHENTICATION
    // ============================================
    // The admin secret is sent in the X-Admin-Secret header by the admin dashboard.
    // This prevents unauthorized access to the email sending functionality.
    
    let secret = event.headers['x-admin-secret'];
    
    // Base64 decoding support:
    // The admin dashboard encodes the secret in base64 to handle non-ASCII characters.
    // We decode it here to compare with the plain text ADMIN_SECRET.
    // Node.js doesn't have atob() like browsers, so we use Buffer instead.
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

    // ============================================
    // NETLIFY BLOBS STORAGE INITIALIZATION
    // ============================================
    // Netlify Blobs is a key-value storage service provided by Netlify.
    // We use it to store RSVP data persistently.
    //
    // Initialization strategy:
    // 1. First, try auto-detection (works in production Netlify)
    //    - Netlify automatically provides execution context
    //    - No configuration needed
    // 2. If that fails, try explicit env vars (for local development)
    //    - Requires NETLIFY_SITE_ID and NETLIFY_AUTH_TOKEN
    //    - Set these in .env file for local testing
    
    console.log(`[${requestId}] 💾 Fetching RSVP from storage...`);
    let store;
    try {
      // Attempt 1: Auto-detection (production mode)
      // In production, Netlify automatically provides the execution context
      // This is the simplest and most secure method
      store = getStore('rsvps');
      console.log(`[${requestId}] ✅ Blob store initialized (auto-detect - production mode)`);
    } catch (autoDetectError) {
      // Attempt 2: Explicit configuration (local development mode)
      // If auto-detection fails, we might be in local development
      // In that case, we need to provide site ID and auth token explicitly
      if (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN) {
        store = getStore({
          name: 'rsvps',
          siteID: process.env.NETLIFY_SITE_ID,
          token: process.env.NETLIFY_AUTH_TOKEN
        });
        console.log(`[${requestId}] ✅ Blob store initialized with env vars (local dev mode)`);
      } else {
        // If both methods fail, we can't proceed
        // Re-throw the error so it's caught by the outer try-catch
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

    const brevoClient = new BrevoClient({
      apiKey: BREVO_API_KEY
    });
    console.log(` ✅ Brevo client initialized`);

    // Resend approved confirmation only: do not change RSVP status or blob data
    if (data.resendOnly === true) {
      if (data.status !== 'Approved') {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'resendOnly requires status Approved' })
        };
      }
      if (rsvp.status !== 'approved') {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Can only resend for RSVPs already approved' })
        };
      }

      const adminMessage = data.adminMessage || '';
      const emailTemplate = getAcceptedTemplate(rsvp, adminMessage);

      await brevoClient.transactionalEmails.sendTransacEmail({
        sender: { email: BREVO_FROM_EMAIL },
        to: [{ email: rsvp.email, name: rsvp.name || '' }],
        subject: emailTemplate.subject,
        htmlContent: emailTemplate.html
      });

      console.log(`[${requestId}] 📧 Resent approval email to ${rsvp.email} (no blob update)`);
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Approval email resent', resendOnly: true })
      };
    }

    // Determine new status based on action (approve or decline)
    // If status is 'Approved' in request, set to approved, else declined
    const newStatus = data.status === 'Approved' ? 'approved' : 'declined';
    rsvp.status = newStatus;
    rsvp.approvedAt = new Date().toISOString();

    // Store decline reason if provided
    const declineReason = data.declineReason || '';

    // ============================================
    // EMAIL TEMPLATE SELECTION LOGIC
    // ============================================
    // The email template depends on two factors:
    // 1. The admin's action (approved or declined)
    // 2. The guest's original attendance response
    //
    // Three scenarios:
    // 1. Admin approves → Send accepted template (celebratory, with wedding details)
    // 2. Admin declines + guest wanted to attend → Send admin-declined template
    //    (apologetic, with optional reason from admin)
    // 3. Admin declines + guest didn't want to attend → Send user-declined template
    //    (thank you message, confirming their original choice)
    //
    // This distinction is important for the guest experience:
    // - Scenario 2 requires a more sensitive approach (admin is declining their request)
    // - Scenario 3 is just confirming what the guest already decided

    let emailTemplate;
    if (newStatus === 'approved') {
      // Admin approved the RSVP
      const adminMessage = data.adminMessage || ''; // Optional personal message from admin
      emailTemplate = getAcceptedTemplate(rsvp, adminMessage);
    } else if (rsvp.attending === 'yes') {
      // Admin declined, but guest originally wanted to attend
      // This requires a more sensitive email template
      emailTemplate = getAdminDeclinedTemplate(rsvp, declineReason);
    } else {
      // Admin declined, and guest originally didn't want to attend
      // This is just confirming their original choice
      emailTemplate = getDeclinedTemplate(rsvp);
    }

    // Send email via Brevo
    await brevoClient.transactionalEmails.sendTransacEmail({
      sender: { email: BREVO_FROM_EMAIL },
      to: [{ email: rsvp.email, name: rsvp.name || '' }],
      subject: emailTemplate.subject,
      htmlContent: emailTemplate.html
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
    
    // Check for Brevo SDK/API-specific errors
    if (error.response) {
      console.error(`[${requestId}] Brevo error response:`, {
        statusCode: error.response.statusCode,
        body: error.response.body
      });
    } else if (error.statusCode || error.status || error.body) {
      console.error(`[${requestId}] Brevo error details:`, {
        statusCode: error.statusCode || error.status,
        body: error.body
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

/**
 * HTML Escaping Helper Function
 * 
 * SECURITY: This function prevents XSS (Cross-Site Scripting) attacks by escaping
 * HTML special characters. Any user-provided content (names, messages, reasons)
 * must be escaped before being inserted into HTML templates.
 * 
 * Example:
 *   Input:  "<script>alert('XSS')</script>"
 *   Output: "&lt;script&gt;alert(&#039;XSS&#039;)&lt;/script&gt;"
 * 
 * Characters escaped:
 *   & → &amp;   (ampersand)
 *   < → &lt;    (less than)
 *   > → &gt;    (greater than)
 *   " → &quot;  (double quote)
 *   ' → &#039;  (single quote)
 * 
 * @param {string} text - Text to escape
 * @returns {string} Escaped text safe for HTML insertion
 */
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
function getAcceptedTemplate(data, adminMessage = '') {
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
          .admin-message { background: #f0f8ff; border-left: 4px solid #d4a5a5; 
                          padding: 20px; margin: 20px 0; border-radius: 4px; }
          .limitation-notice { background: #fff5f5; border-left: 4px solid #c9a86a; 
                              padding: 20px; margin: 20px 0; border-radius: 4px; }
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
            
            ${adminMessage ? `
            <div class="admin-message">
              <h3 style="color: #c9a86a; margin-top: 0;">A Personal Note:</h3>
              <p style="margin-bottom: 0;">${escapeHtml(adminMessage).replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}
            
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
              <li>4:00 PM — Guest Arrival</li>
              <li>4:30 PM — Welcome Drinks</li>
              <li>6:00 PM — Religious Ceremony Begins</li>
              <li>7:30 PM — Reception &amp; Dinner</li>
              <li>11:00 PM — Last Dance</li>
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
