# Notion Integration Setup Guide

This guide explains how to set up Notion integration for your RSVP form using a serverless function to keep your API key secure.

## 🔐 Why Use a Serverless Function?

Your Notion API key must be kept secret and should **never** be exposed in client-side JavaScript. A serverless function acts as a secure middleman between your website and Notion.

## 🚀 Deployment Options

### Option 1: Netlify Functions (Recommended for Beginners)

Netlify offers free hosting with built-in serverless functions.

#### Step 1: Sign up for Netlify
1. Go to [netlify.com](https://www.netlify.com/)
2. Sign up with your GitHub account (free)

#### Step 2: Create Netlify Function

Create a new folder structure:
```
summer_Dream/
├── netlify/
│   └── functions/
│       └── submit-rsvp.js
├── netlify.toml
├── index.html
├── (other files...)
```

#### Step 3: Create `netlify/functions/submit-rsvp.js`

```javascript
const { Client } = require('@notionhq/client');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // Get Notion credentials from environment variables
  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  });
  const databaseId = process.env.NOTION_DATABASE_ID;

  try {
    const data = JSON.parse(event.body);

    // Create a new page in the Notion database
    await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: data.name,
              },
            },
          ],
        },
        Email: {
          email: data.email,
        },
        Phone: {
          phone_number: data.phone || '',
        },
        Attending: {
          select: {
            name: data.attending,
          },
        },
        Guests: {
          number: parseInt(data.guests) || 1,
        },
        Dietary: {
          rich_text: [
            {
              text: {
                content: data.dietary || '',
              },
            },
          ],
        },
        Message: {
          rich_text: [
            {
              text: {
                content: data.message || '',
              },
            },
          ],
        },
        'Submitted At': {
          date: {
            start: data.submittedAt,
          },
        },
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error submitting to Notion:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
```

#### Step 4: Create `netlify.toml`

```toml
[build]
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"
```

#### Step 5: Create `package.json`

```json
{
  "name": "wedding-website",
  "version": "1.0.0",
  "description": "Summer & Dream Wedding Website",
  "dependencies": {
    "@notionhq/client": "^2.2.3"
  }
}
```

#### Step 6: Deploy to Netlify

1. Push your code to GitHub
2. In Netlify dashboard, click **Add new site** → **Import an existing project**
3. Connect your GitHub repository
4. Netlify will auto-detect settings
5. Click **Deploy site**

#### Step 7: Add Environment Variables

1. In Netlify dashboard, go to **Site settings** → **Environment variables**
2. Add two variables:
   - `NOTION_API_KEY`: Your Notion integration token
   - `NOTION_DATABASE_ID`: Your Notion database ID
3. Click **Save**
4. Redeploy your site

#### Step 8: Update `script.js`

Replace the `submitToNotion` function:

```javascript
async function submitToNotion(data) {
    const response = await fetch('/.netlify/functions/submit-rsvp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    
    return await response.json();
}
```

#### Step 9: Update Notion Configuration

In `script.js`, update the config:

```javascript
const NOTION_CONFIG = {
    apiKey: 'configured', // Set to 'configured' to enable form submission
    databaseId: 'configured',
};
```

---

### Option 2: Vercel Serverless Functions

Similar to Netlify but uses Vercel's platform.

#### Setup Structure:
```
summer_Dream/
├── api/
│   └── submit-rsvp.js
├── (other files...)
```

#### Create `api/submit-rsvp.js`:

```javascript
const { Client } = require('@notionhq/client');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  });
  const databaseId = process.env.NOTION_DATABASE_ID;

  try {
    const data = req.body;

    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: { title: [{ text: { content: data.name } }] },
        Email: { email: data.email },
        Phone: { phone_number: data.phone || '' },
        Attending: { select: { name: data.attending } },
        Guests: { number: parseInt(data.guests) || 1 },
        Dietary: { rich_text: [{ text: { content: data.dietary || '' } }] },
        Message: { rich_text: [{ text: { content: data.message || '' } }] },
        'Submitted At': { date: { start: data.submittedAt } },
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
```

#### Deploy to Vercel:
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Add environment variables in Vercel dashboard

#### Update `script.js`:
```javascript
async function submitToNotion(data) {
    const response = await fetch('/api/submit-rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return await response.json();
}
```

---

### Option 3: Simple Alternative - Google Forms

If Notion integration seems too complex, use Google Forms:

1. Create a Google Form with fields:
   - Name (Short answer)
   - Email (Short answer)
   - Phone (Short answer)
   - Attending (Multiple choice: Yes/No)
   - Number of Guests (Dropdown: 1-4)
   - Dietary Restrictions (Paragraph)
   - Message (Paragraph)

2. Get the form's embed link

3. Replace RSVP form in `rsvp.html`:
```html
<iframe 
  src="YOUR_GOOGLE_FORM_EMBED_LINK" 
  width="100%" 
  height="1200" 
  frameborder="0" 
  marginheight="0" 
  marginwidth="0">
  Loading…
</iframe>
```

Responses go directly to Google Sheets - free and simple!

---

## 📊 Notion Database Setup

Create a database in Notion with these exact property names:

| Property Name | Type | Options |
|--------------|------|---------|
| Name | Title | - |
| Email | Email | - |
| Phone | Phone | - |
| Attending | Select | Options: "yes", "no" |
| Guests | Number | - |
| Dietary | Text | - |
| Message | Text | - |
| Submitted At | Date | - |

## 🔑 Getting Your Notion Credentials

### API Key:
1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **+ New integration**
3. Name: "Wedding RSVP"
4. Select your workspace
5. Click **Submit**
6. Copy the **Internal Integration Token** (starts with `secret_`)

### Database ID:
1. Open your database in Notion
2. Click **Share** → Invite your integration
3. Copy the database URL: `https://notion.so/xxxxxx?v=yyyy`
4. The database ID is the `xxxxxx` part (32 characters)

## ✅ Testing

1. Test the form locally
2. Check Notion database for new entries
3. Verify all fields are populated correctly

## 🆘 Troubleshooting

**Error: "Notion API key not configured"**
- Make sure environment variables are set in Netlify/Vercel
- Redeploy after adding variables

**Error: "Database not found"**
- Ensure integration has access to the database
- Check that database ID is correct

**Form submits but no data in Notion**
- Check serverless function logs in Netlify/Vercel
- Verify property names match exactly (case-sensitive)

---

## 💡 Pro Tip: Email Notifications

Set up email notifications in Notion:
1. Create a Notion automation
2. Trigger: "When page added to database"
3. Action: "Send email notification"
4. You'll get instant RSVP alerts!

---

*For questions, check the serverless function logs in your hosting provider's dashboard.*
