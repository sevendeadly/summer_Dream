// ==================================
// NETLIFY FUNCTION: GET RSVPS FROM NOTION
// File: netlify/functions/get-rsvps.js
// ==================================

const { Client } = require('@notionhq/client');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const DATABASE_ID = process.env.NOTION_DATABASE_ID;
  const ADMIN_SECRET = process.env.ADMIN_SECRET;

  // Check authorization
  const secret = event.headers['x-admin-secret'];
  if (secret !== ADMIN_SECRET) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  const notion = new Client({ auth: NOTION_API_KEY });

  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [{ property: 'Submitted At', direction: 'descending' }]
    });

    const rsvps = response.results.map(page => ({
      id: page.id,
      name: page.properties.Name.title[0]?.text.content || '',
      email: page.properties.Email.email || '',
      phone: page.properties.Phone.phone_number || '',
      attending: page.properties.Attending.select?.name || '',
      guests: page.properties.Guests.number || 1,
      dietary: page.properties.Dietary.rich_text[0]?.text.content || '',
      message: page.properties.Message.rich_text[0]?.text.content || '',
      status: page.properties.Status?.select?.name || 'pending',
      submittedAt: page.properties['Submitted At'].date?.start || ''
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ results: rsvps })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};