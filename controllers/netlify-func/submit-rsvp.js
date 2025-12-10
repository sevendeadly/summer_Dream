// ===========================
// NETLIFY FUNCTION: RSVP Submission with Email
// File: netlify/functions/submit-rsvp.js
// ===========================

const { Client } = require('@notionhq/client');
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // Get environment variables
  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const DATABASE_ID = process.env.NOTION_DATABASE_ID;
  const EMAIL_HOST = process.env.EMAIL_HOST; // e.g., smtp.gmail.com
  const EMAIL_PORT = process.env.EMAIL_PORT; // e.g., 587
  const EMAIL_USER = process.env.EMAIL_USER; // Your email
  const EMAIL_PASS = process.env.EMAIL_PASS; // Your email password/app password
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL; // Your admin email

  // Validate environment variables
  if (!NOTION_API_KEY || !DATABASE_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Server configuration missing' 
      }),
    };
  }

  const notion = new Client({ auth: NOTION_API_KEY });

  try {
    const data = JSON.parse(event.body);

    // Create Notion entry
    const notionResponse = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        Name: { title: [{ text: { content: data.name } }] },
        Email: { email: data.email },
        Phone: { phone_number: data.phone || '' },
        Attending: { select: { name: data.attending } },
        Guests: { number: parseInt(data.guests) || 1 },
        Dietary: { rich_text: [{ text: { content: data.dietary || '' } }] },
        Message: { rich_text: [{ text: { content: data.message || '' } }] },
        'Submitted At': { date: { start: data.submittedAt } },
        Status: { select: { name: 'Pending Review' } }, // Add this column in Notion
      },
    });

    // Send notification to admin
    if (EMAIL_HOST && EMAIL_USER && EMAIL_PASS && ADMIN_EMAIL) {
      const transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: false,
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: EMAIL_USER,
        to: ADMIN_EMAIL,
        subject: `New RSVP: ${data.name}`,
        html: `
          <h2>New RSVP Submission</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
          <p><strong>Attending:</strong> ${data.attending}</p>
          <p><strong>Guests:</strong> ${data.guests}</p>
          <p><strong>Dietary:</strong> ${data.dietary || 'None'}</p>
          <p><strong>Message:</strong> ${data.message || 'No message'}</p>
          <hr>
          <p>View in Notion: <a href="https://notion.so/${DATABASE_ID}">Open Database</a></p>
          <p>Notion Page ID: ${notionResponse.id}</p>
        `,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        pageId: notionResponse.id 
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
    };
  }
};
