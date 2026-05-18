# RSVP Storage & Management System

**Complete guide to the RSVP system using Netlify storage (replacing Notion).**

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Environment Variables](#environment-variables)
4. [Netlify Function: Submit RSVP](#netlify-function-submit-rsvp)
5. [Netlify Function: Get RSVPs](#netlify-function-get-rsvps)
6. [Admin Dashboard](#admin-dashboard)
7. [Email Confirmations](#email-confirmations)
8. [Deployment](#deployment)

---

## 🎯 System Overview

The RSVP system now stores data using **Netlify Blob Storage** (or alternative JSON file storage) instead of Notion. This allows:

- ✅ **Multiple databases** - No API restrictions
- ✅ **Brevo email integration** - Automated confirmations
- ✅ **Admin dashboard** - Review & approve RSVPs
- ✅ **Secure backend** - API keys protected via environment variables
- ✅ **Email confirmations** - Send to approved guests

### Key Features

1. **Guest RSVP Form** - Guests submit attendance via web form
2. **Serverless Processing** - Netlify function validates & stores data
3. **Admin Review** - Dashboard for approving/declining RSVPs
4. **Email Workflow** - Automated confirmations via Brevo
5. **Data Storage** - Persistent storage via Netlify Blob or JSON backup

---

## 🏗️ Architecture

```bash
┌─────────────────┐
│  RSVP Form UI   │
│  (views/rsvp.html)
└────────┬────────┘
         │ POST: formData
         ↓
┌─────────────────────────┐
│ Netlify Function        │
│ /submit-rsvp            │
│ (validate + store)      │
└────────┬────────────────┘
         │
         ↓
┌──────────────────────┐
│ Netlify Blob Storage │  ← Main storage
│ (or JSON file)       │
└────────┬─────────────┘
         │
         ↓
┌─────────────────────┐
│  Admin Dashboard    │
│  (views/admin_...)  │
│  - Review RSVPs     │
│  - Approve/Decline  │
└────────┬────────────┘
         │ POST: approval
         ↓
┌──────────────────────────┐
│ Netlify Function         │
│ /send-confirmation       │
│ (Brevo email)            │
└──────────────────────────┘
         │
         ↓
┌─────────────────────┐
│ Guest Email         │
│ (Confirmation)      │
└─────────────────────┘
```

---

## 🔧 Environment Variables

Set these in **Netlify Dashboard** → **Site Settings** → **Environment Variables**:

```bash
# Brevo Email Configuration
BREVO_API_KEY=xkeysib-xxxxx...               # API key from Brevo
BREVO_FROM_EMAIL=noreply@yourwedding.com     # Verified sender email

# Admin Configuration
ADMIN_EMAIL=your-email@example.com         # Where admin notifications go
ADMIN_SECRET=strong-random-password        # Admin dashboard auth

# Netlify Blob Storage (if using)
# (Auto-configured, no manual setup needed)
```

### Local Development (`.env` file)

Create `.env` in project root:

```bash
BREVO_API_KEY=xkeysib-xxxxx...
BREVO_FROM_EMAIL=noreply@yourwedding.com
ADMIN_EMAIL=your-email@example.com
ADMIN_SECRET=your-secret-here
```

⚠️ **Never commit `.env` to Git** - Add to `.gitignore`

---

## 📤 Netlify Function: Submit RSVP

**Location:** `controllers/netlify-func/submit-rsvp.js`

### Request Format

```bash
POST /.netlify/functions/submit-rsvp
Content-Type: application/json

{
  "name": "Guest Name",
  "email": "guest@example.com",
  "phone": "+1 (555) 123-4567",
  "attending": "yes",  // "yes" or "no"
  "guests": "2",
  "dietary": "Vegetarian",
  "message": "Looking forward to it!"
}
```

### Response Format

**Success:**

```json
{
  "success": true,
  "id": "rsvp_1234567890",
  "message": "RSVP received. Admin will send confirmation soon."
}
```

**Error:**

```json
{
  "success": false,
  "error": "Email is required"
}
```

### Storage Method

RSVPs are stored as JSON objects in **Netlify Blob Storage** with structure:

```json
{
  "id": "rsvp_1234567890",
  "name": "Guest Name",
  "email": "guest@example.com",
  "phone": "+1 (555) 123-4567",
  "attending": "yes",
  "guests": 2,
  "dietary": "Vegetarian",
  "message": "Looking forward to it!",
  "status": "pending",
  "submittedAt": "2026-01-15T10:30:00Z",
  "approvedAt": null
}
```

---

## 📥 Netlify Function: Get RSVPs

**Location:** `controllers/netlify-func/get-rsvps.js`

### Request Format

```bash
GET /.netlify/functions/get-rsvps
X-Admin-Secret: your-admin-secret
```

### Response Format

```json
{
  "results": [
    {
      "id": "rsvp_1234567890",
      "name": "Guest Name",
      "email": "guest@example.com",
      "phone": "+1 (555) 123-4567",
      "attending": "yes",
      "guests": 2,
      "dietary": "Vegetarian",
      "message": "Looking forward!",
      "status": "pending",
      "submittedAt": "2026-01-15T10:30:00Z"
    }
  ],
  "total": 42,
  "pending": 15,
  "approved": 25,
  "declined": 2
}
```

### Error Handling

**Unauthorized:**

```bash
Status: 401
{
  "error": "Unauthorized - invalid admin secret"
}
```

---

## 👨‍💼 Admin Dashboard

**Location:** `views/admin_dashboard.html`

### Features

- **RSVP List** - View all submissions with status
- **Search** - Filter by name, email, or message
- **Sort** - By name, date, attendance, or status
- **Approve** - Send confirmation email to guest
- **Decline** - Notify guest of decline
- **Export** - Download RSVPs as CSV

### Authentication Flow

1. Admin enters secret password on dashboard
2. Password stored in `localStorage` as `adminSecret`
3. All API calls include header: `X-Admin-Secret`
4. Server validates secret against `ADMIN_SECRET` environment variable

### Usage

1. Visit: `https://yoursite.com/views/admin_dashboard.html`
2. Enter admin secret
3. Review pending RSVPs
4. Click "Approve" to send confirmation email
5. Guest receives confirmation with wedding details

---

## 📧 Email Confirmations

**Location:** `controllers/netlify-func/send-confirmation.js`

### Confirmation Email Template

When admin approves an RSVP, Brevo sends:

**If Attending (yes):**

```
Subject: Your RSVP has been confirmed! 💍

Dear [Guest Name],

Thank you for confirming your attendance!

Date: Friday, June 12, 2026 (religious ceremony begins 4:00 PM)
Location: [Venue address per views/info.html]

We look forward to celebrating with you!

Warm regards,
Audrey & Josue-Daniel
```

**If Not Attending (no):**

```
Subject: Thank you for letting us know

Dear [Guest Name],

Thank you for responding to our invitation.
We understand and wish you all the best.

Warm regards,
Audrey & Josue-Daniel
```

### Configuration

Email settings in `send-confirmation.js`:

```javascript
const SibApiV3Sdk = require('@getbrevo/brevo');

exports.handler = async (event, context) => {
  const api = new SibApiV3Sdk.TransactionalEmailsApi();
  api.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

  const message = new SibApiV3Sdk.SendSmtpEmail();
  message.sender = { email: process.env.BREVO_FROM_EMAIL };
  message.to = [{ email: data.email }];
  message.subject = data.attending === 'yes'
    ? 'Your RSVP has been confirmed! 💍'
    : 'Thank you for letting us know';
  message.htmlContent = emailTemplate;

  await api.sendTransacEmail(message);
  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
```

---

## 🚀 Deployment

### Step 1: Configure Netlify

1. Go to [netlify.com](https://www.netlify.com/)
2. Connect your GitHub repository
3. Set **Build Settings**:
   - Build command: `npm install`
   - Functions directory: `controllers/netlify-func`
   - Publish directory: `views`

4. Set **Environment Variables**:
   - `BREVO_API_KEY` - Get from Brevo dashboard
   - `BREVO_FROM_EMAIL` - Your verified sender email
   - `ADMIN_EMAIL` - Your email
   - `ADMIN_SECRET` - Strong password

### Step 2: Get Brevo API Key

1. Go to [brevo.com](https://www.brevo.com/) → Sign up (free)
2. Dashboard → Settings → SMTP & API → API Keys → Create API Key
3. Copy key (starts with `xkeysib-`)
4. Add to Netlify environment variables

### Step 3: Verify Sender Email

1. Brevo Dashboard → Senders, Domains & Dedicated IPs
2. Add sender email: `noreply@yourwedding.com`
3. Verify email (click confirmation link)
4. Use this email in `BREVO_FROM_EMAIL` environment variable

### Step 4: Deploy

1. Push code to GitHub
2. Netlify auto-deploys
3. Check deployment status at Netlify Dashboard
4. Visit your live URL and test RSVP form

### Step 5: Test Workflow

1. **Fill RSVP form** - Submit test RSVP
2. **Check admin dashboard** - Verify RSVP appears as "pending"
3. **Approve RSVP** - Click approve button
4. **Check email** - Verify confirmation email received
5. **Verify success** - RSVP status changes to "approved"

---

## 📊 Storage Options

### Option 1: Netlify Blob Storage (Recommended)

**Pros:**

- Built-in to Netlify
- No external service
- Free tier: 10GB included
- Automatic backups

**Usage:**

```javascript
import { getStore } from "@netlify/blobs";

const store = getStore("rsvps");
await store.set(`rsvp_${id}`, JSON.stringify(rsvp));
```

### Option 2: JSON File Storage

**Pros:**

- Simple implementation
- Version controlled in Git
- Easy to backup

**Location:** `data/rsvps.json`

**Usage:**

```javascript
const fs = require('fs');
const path = require('path');

const rsvpsFile = path.join(__dirname, '../../data/rsvps.json');
const rsvps = JSON.parse(fs.readFileSync(rsvpsFile));
rsvps.push(newRsvp);
fs.writeFileSync(rsvpsFile, JSON.stringify(rsvps, null, 2));
```

### Option 3: External Database (Future)

**Alternatives:**

- Supabase (PostgreSQL) - Free tier
- Firebase Realtime DB - Free tier
- MongoDB Atlas - Free tier
- PlanetScale (MySQL) - Free tier

---

## 🔒 Security Considerations

1. **API Keys** - Never in client code, only environment variables
2. **Admin Secret** - Use strong password (20+ characters, mixed case)
3. **HTTPS** - Netlify provides free SSL
4. **CORS** - Functions restrict requests to verified origins
5. **Validation** - All inputs validated server-side
6. **Data Privacy** - Implement data retention policy

---

## 🐛 Troubleshooting

### Issue: RSVP submission fails

**Check:**

1. Are environment variables set in Netlify?
2. Is Brevo API key valid?
3. Check Netlify function logs for errors

### Issue: Admin dashboard won't authenticate

**Check:**

1. Is `ADMIN_SECRET` set in Netlify?
2. Is browser localStorage enabled?
3. Try clearing localStorage and re-entering secret

### Issue: Email not received

**Check:**

1. Is Brevo API key correct?
2. Is sender email verified in Brevo?
3. Check Brevo transactional activity for bounces
4. Check spam folder

### Issue: RSVPs not showing in admin

**Check:**

1. Is `X-Admin-Secret` header being sent?
2. Is Netlify Blob Storage working?
3. Check function logs at Netlify Dashboard

---

## 📞 Support

For issues:

1. Check Netlify function logs
2. Check browser console (F12)
3. Check Brevo transactional activity
4. Review environment variables

---

**Last Updated:** April 18, 2026
