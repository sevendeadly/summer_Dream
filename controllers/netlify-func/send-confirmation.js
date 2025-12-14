// ===========================
// NETLIFY FUNCTION: Send Confirmation Email (SendGrid)
// File: controllers/netlify-func/send-confirmation.js
// Sends confirmation emails via SendGrid and updates RSVP status
// ===========================

const sgMail = require('@sendgrid/mail');
const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // Get environment variables
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@yourwedding.com';
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  
  if (!SENDGRID_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'SendGrid API key not configured' }),
    };
  }

  try {
    const data = JSON.parse(event.body);

    // Verify admin secret
    if (data.adminSecret !== ADMIN_SECRET) {
      console.warn('⚠️ Unauthorized confirmation attempt');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    // Initialize SendGrid
    sgMail.setApiKey(SENDGRID_API_KEY);

    // Email template based on attendance
    const emailTemplate = data.attending === 'yes' 
      ? getAcceptedTemplate(data)
      : getDeclinedTemplate(data);

    // Send email via SendGrid
    await sgMail.send({
      to: data.email,
      from: SENDGRID_FROM_EMAIL,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    // Update RSVP status in storage
    if (data.rsvpId) {
      const store = getStore('rsvps');
      const rsvpData = await store.get(data.rsvpId);
      
      if (rsvpData) {
        const rsvp = JSON.parse(rsvpData);
        rsvp.status = data.attending === 'yes' ? 'approved' : 'declined';
        rsvp.approvedAt = new Date().toISOString();
        
        await store.set(data.rsvpId, JSON.stringify(rsvp));
        console.log(`✅ RSVP ${data.rsvpId} updated to ${rsvp.status}`);
      }
    }

    console.log(`📧 Confirmation email sent to ${data.email}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Email sent and RSVP updated' }),
    };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
    };
  }
};

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
            <h2 style="color: #d4a5a5;">Dear ${data.name},</h2>
            
            <p>We're absolutely thrilled that you'll be joining us on our special day! Your RSVP has been confirmed.</p>
            
            <div class="details">
              <h3 style="color: #c9a86a; margin-top: 0;">Your RSVP Details</h3>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Number of Guests:</strong> ${data.guests}</p>
              ${data.dietary ? `<p><strong>Dietary Requirements:</strong> ${data.dietary}</p>` : ''}
              ${data.message ? `<p><strong>Your Message:</strong> "${data.message}"</p>` : ''}
            </div>
            
            <h3 style="color: #d4a5a5;">Wedding Details</h3>
            <p><strong>Date:</strong> Friday, June 12, 2026</p>
            <p><strong>Ceremony:</strong> 3:30 PM</p>
            <p><strong>Venue:</strong> [Venue Name & Address]</p>
            <p><strong>Dress Code:</strong> Semi-Formal / Cocktail Attire</p>
            
            <center>
              <a href="https://sevendeadly.github.io/summer_Dream/views/info.html" class="button">
                View Full Wedding Details
              </a>
            </center>
            
            <h3 style="color: #d4a5a5;">What to Expect</h3>
            <ul>
              <li>3:00 PM - Guest Arrival</li>
              <li>3:30 PM - Ceremony</li>
              <li>4:30 PM - Cocktail Hour</li>
              <li>5:30 PM - Reception & Dinner</li>
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

// Email template for declined RSVPs
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
            <h2 style="color: #d4a5a5;">Dear ${data.name},</h2>
            
            <p>Thank you so much for taking the time to let us know you won't be able to join us on June 12, 2026.</p>
            
            <p>We're sad you can't be there, but we completely understand. We'll be thinking of you on our special day! 💕</p>
            
            ${data.message ? `<p style="font-style: italic; background: #faf8f5; padding: 15px; border-radius: 5px;">Your message: "${data.message}"</p>` : ''}
            
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
