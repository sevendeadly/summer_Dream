# Complete Setup & Deployment Guide

**Master guide for setting up and deploying the Audrey & Josue-Daniel 2026 wedding website.**

---

## 📋 Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Configuration Files](#configuration-files)
3. [Environment Variables](#environment-variables)
4. [Netlify Functions Setup](#netlify-functions-setup)
5. [RSVP Storage System](#rsvp-storage-system)
6. [Email Service Configuration](#email-service-configuration)
7. [Deployment Process](#deployment-process)
8. [Admin Dashboard Setup](#admin-dashboard-setup)
9. [Testing Checklist](#testing-checklist)
10. [Post-Deployment](#post-deployment)

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js 18+ installed
- Git installed
- GitHub account
- Text editor (VS Code recommended)

### Step 1: Clone Repository

```bash
git clone https://github.com/sevendeadly/summer_Dream.git
cd summer_Dream
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- `@sendgrid/mail` - SendGrid email service
- Other project dependencies

### Step 3: Local Testing

Start a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node http-server
npx http-server

# Using Netlify CLI (recommended for functions)
netlify dev
```

Visit: `http://localhost:8000`

---

## 📁 Configuration Files

### File: `.env` (Development)

Create this file in your project root:

```bash
# SendGrid Email Configuration
SENDGRID_API_KEY=SG.xxxxx...
SENDGRID_FROM_EMAIL=noreply@yourwedding.com

# Admin Configuration
ADMIN_EMAIL=your-email@example.com
ADMIN_SECRET=your-secure-password-here
```

⚠️ **NEVER commit `.env` to Git** - Add to `.gitignore`

### File: `netlify.toml` (Deployment)

Located in project root:

```toml
[build]
  functions = "controllers/netlify-func"
  publish = "views"
  command = "npm install"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/admin"
  to = "/views/admin_dashboard.html"
  status = 200
```

### File: `package.json`

```json
{
  "name": "wedding-website",
  "version": "2.1.0",
  "description": "J-D & A-N Wedding Website",
  "dependencies": {
    "@sendgrid/mail": "^7.7.0"
  }
}
```

### File: `.gitignore`

```
# Environment variables
.env
.env.local
.env.*.local

# Dependencies
node_modules/
package-lock.json

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
npm-debug.log
yarn-debug.log
yarn-error.log

# OS
.DS_Store
Thumbs.db

# Build
dist/
build/
data/*.json
```

---

## 🔐 Environment Variables

### SendGrid API Key

1. Go to [sendgrid.com](https://sendgrid.com/) → Sign up (free tier)
2. Dashboard → Settings → API Keys → Create API Key
3. Copy key (starts with `SG.`)
4. Paste into `.env` as `SENDGRID_API_KEY`

### SendGrid Sender Email

1. Dashboard → Settings → Sender Authentication
2. Add verified sender email
3. Use this email in `SENDGRID_FROM_EMAIL`

### Admin Secret

Generate secure password:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or use online generator: [randomkeygen.com](https://www.randomkeygen.com/)

---

## 🛠️ Netlify Functions Setup

### Directory Structure

```
controllers/netlify-func/
├── submit-rsvp.js          # Receive RSVPs
├── send-confirmation.js    # Send emails
└── get-rsvps.js           # Admin retrieval
```

### Function 1: submit-rsvp.js

**Purpose:** Handle RSVP form submissions and store in Netlify Blob Storage

```javascript
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  // Validates data and stores in Netlify Blob Storage
  // Returns success/error response
};
```

**Triggers:** When guest submits RSVP form  
**Returns:** `{success: true, id: "rsvp_123"}`

### Function 2: send-confirmation.js

**Purpose:** Send confirmation emails via SendGrid

```javascript
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  // Verifies admin secret and sends email
};
```

**Requires:** Admin authentication  
**Triggers:** When admin clicks "Approve"

### Function 3: get-rsvps.js

**Purpose:** Retrieve RSVPs for admin dashboard

```javascript
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  // Returns all RSVP records from storage
};
```

**Requires:** Admin secret header `X-Admin-Secret`  
**Returns:** Array of RSVP records

---

## 📊 RSVP Storage System

### Storage Architecture

RSVPs are stored in **Netlify Blob Storage** with automatic backup to JSON file.

### Data Structure

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

### Retrieval

Admin dashboard fetches via: `GET /.netlify/functions/get-rsvps`

See `docs/RSVP_SYSTEM.md` for complete documentation.

---

## 📧 Email Service Configuration

### SendGrid Setup (Recommended)

1. Sign up at [sendgrid.com](https://sendgrid.com) (free tier: 100/day)
2. Create API key
3. Verify sender email
4. Add to environment variables

### Email Workflow

```
Admin clicks "Approve"
    ↓
POST to send-confirmation with admin secret
    ↓
Function verifies secret
    ↓
SendGrid sends email to guest
    ↓
Email confirmation delivered
```

### Email Templates

See `controllers/netlify-func/send-confirmation.js` for full HTML templates.

---

## 🚀 Deployment Process

### Step 1: Prepare Code

```bash
# Check for uncommitted changes
git status

# Add all changes
git add .

# Commit with meaningful message
git commit -m "Update: Remove Notion integration, use Netlify storage"

# Push to GitHub
git push origin main
```

### Step 2: Connect to Netlify

1. Go to [netlify.com](https://app.netlify.com)
2. Click "Add new site"
3. Select "Import an existing project"
4. Choose GitHub repository `summer_Dream`
5. Netlify auto-detects configuration
6. Click "Deploy site"

### Step 3: Set Environment Variables

1. Dashboard → Site settings → Build & Deploy → Environment
2. Add variables:

```
SENDGRID_API_KEY: SG.xxxxx...
SENDGRID_FROM_EMAIL: noreply@yourwedding.com
ADMIN_EMAIL: your-email@example.com
ADMIN_SECRET: your-secure-password
```

3. Trigger redeploy: "Deploys" → "Trigger deploy" → "Deploy site"

### Step 4: Verify Deployment

1. Check site is live: `https://your-site.netlify.app`
2. Test homepage loads
3. Test all pages accessible
4. Check admin dashboard: `/admin`

---

## 👨‍💼 Admin Dashboard Setup

### Access Dashboard

```
https://your-site.netlify.app/admin
or
https://your-site.netlify.app/views/admin_dashboard.html
```

### First Login

1. Click "Login to Admin Dashboard"
2. Enter your `ADMIN_SECRET`
3. Click "Login"
4. Password stored in browser localStorage

### Dashboard Features

- **View RSVPs** - List of all submissions with status
- **Search** - Filter by name, email, message
- **Sort** - By submission date, attendance, status
- **Approve** - Send confirmation email
- **Decline** - Send decline notification
- **Statistics** - Total, pending, approved counts

### Admin Authentication

Security flow:
1. Enter admin secret on form
2. Stored in `localStorage.adminSecret`
3. All API calls include header: `X-Admin-Secret`
4. Server validates against environment variable `ADMIN_SECRET`

---

## ✅ Testing Checklist

### Pre-Launch Testing

- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Mobile responsive (test on phone)
- [ ] Images display properly
- [ ] Countdown timer updates
- [ ] Theme switcher works
- [ ] All pages accessible

### RSVP Form Testing

- [ ] Form fields display correctly
- [ ] Form validation shows errors
- [ ] Submit button is functional
- [ ] Success message appears
- [ ] Data stored in backend

### Admin Dashboard Testing

- [ ] Login screen displays
- [ ] Admin secret authentication works
- [ ] RSVPs load from Notion
- [ ] Sorting works correctly
- [ ] Filtering works correctly
- [ ] Search functionality works
- [ ] Approve button sends email
- [ ] Decline button sends email
- [ ] Statistics update correctly

### Email Testing

- [ ] Confirmation email received
- [ ] Email displays correctly on mobile
- [ ] All guest details show in email
- [ ] Links clickable
- [ ] Sender displays correctly

---

## 📞 Post-Deployment

### Set Custom Domain

1. Dashboard → Site settings → Domain management
2. Add custom domain
3. Update DNS records (Netlify provides instructions)

### Enable HTTPS

- Netlify enables by default
- Verify URL shows 🔒 lock icon

### Set Up Analytics

1. Enable Netlify Analytics
2. Track visits and user behavior
3. Monitor form submissions

### Create Backup

```bash
# Backup Notion database
1. Open Notion database
2. Click "..." → Download as CSV
3. Save locally

# Backup website code
git push all changes to GitHub
```

### Share Access

**For Co-host/Partner:**
1. Share admin dashboard link
2. Give them admin secret securely
3. Show how to:
   - View RSVPs
   - Approve guests
   - Send emails

**For Best Man/Maid of Honor:**
1. Can view website
2. Optional: Guest contribution page

---

## 🔒 Security Reminders

✅ **DO:**
- Keep `.env` file local (never commit)
- Use strong admin secret (32+ characters)
- Rotate secrets periodically
- Keep Netlify updated
- Monitor function logs
- Backup RSVPs regularly

❌ **DON'T:**
- Share API keys via email
- Hardcode credentials in code
- Use simple passwords
- Commit `.env` file
- Expose secrets in logs
- Use production credentials locally

---

## 📚 Essential Documentation

| Document | Purpose |
|----------|---------|
| `docs/RSVP_SYSTEM.md` | RSVP storage and management |
| `docs/EMAIL_SYSTEM.md` | Email configuration details |
| `docs/DEPLOYMENT.md` | Deployment troubleshooting |
| `docs/SECURITY.md` | Security best practices |
| `.github/copilot-instructions.md` | Project architecture & patterns |

---

## ❓ Troubleshooting

### Build Fails on Netlify

**Solution:**
1. Check `netlify.toml` syntax
2. Verify `package.json` dependencies
3. Check Node version in build settings
4. Review build logs for errors

### Functions Not Responding

**Solution:**
1. Check functions deployed in Netlify Dashboard
2. Verify environment variables set correctly
3. Check function logs at Netlify
4. Test with curl/Postman

### Emails Not Sending

**Solution:**
1. Verify `SENDGRID_API_KEY` is correct
2. Check `SENDGRID_FROM_EMAIL` is verified
3. Review SendGrid Activity Feed
4. Check spam folder

### Admin Dashboard Not Loading

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Check browser console (F12) for errors
3. Verify `ADMIN_SECRET` is set
4. Try incognito mode

---

## 🎉 You're Live!

Your wedding website is now:
- ✅ Deployed and accessible
- ✅ Receiving RSVPs
- ✅ Sending confirmation emails
- ✅ Managed via admin dashboard
- ✅ Secure and professional

**Next Steps:**
1. Share website with guests
2. Monitor RSVP responses
3. Approve guests and send confirmations
4. Customize email templates as needed
5. Keep Netlify and dependencies updated

---

*Made with ❤️ for J-D & A-N's Special Day*

**Last Updated:** December 14, 2025
