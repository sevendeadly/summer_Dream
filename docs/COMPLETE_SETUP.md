# Complete Setup & Deployment Guide

**Master guide for setting up and deploying the Summer & Dream wedding website.**

---

## 📋 Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Configuration Files](#configuration-files)
3. [Environment Variables](#environment-variables)
4. [Netlify Functions Setup](#netlify-functions-setup)
5. [Notion Database Setup](#notion-database-setup)
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
- `@notionhq/client` - Notion API
- `nodemailer` - Email sending
- Any other project dependencies

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
# Notion Configuration
NOTION_API_KEY=secret_your_key_here
NOTION_DATABASE_ID=your_database_id_here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=your-email@gmail.com

# Security
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

[[redirects]]
  from = "/*.html"
  to = "/index.html"
  status = 200
```

### File: `package.json`

```json
{
  "name": "wedding-website",
  "version": "2.1.0",
  "description": "J-D & A-N Wedding Website",
  "dependencies": {
    "@notionhq/client": "^2.2.15",
    "nodemailer": "^6.9.8"
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
```

---

## 🔐 Environment Variables

### Notion API Key

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create new integration "Wedding Website"
3. Copy "Internal Integration Secret"
4. Format: `secret_xxxxxxxxxxxxx`

### Notion Database ID

1. Open RSVP database in Notion
2. URL: `https://www.notion.so/workspace/[DATABASE_ID]?v=[VIEW_ID]`
3. Share database with your integration

### Gmail SMTP Configuration

1. Enable 2-Factor Authentication
2. Generate App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use 16-character password

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

**Purpose:** Handle RSVP form submissions

```javascript
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  // ... implementation
};
```

**Triggers:** When guest submits RSVP form  
**Returns:** Confirmation or error message

### Function 2: send-confirmation.js

**Purpose:** Send confirmation emails

```javascript
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  // ... implementation
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
  // ... implementation
};
```

**Requires:** Admin secret header  
**Returns:** All RSVP records

---

## 📊 Notion Database Setup

### Create Database Structure

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| Name | Title | ✅ | Guest name |
| Email | Email | ✅ | Contact email |
| Phone | Phone | ⚠️ | Optional |
| Attending | Select | ✅ | "yes" or "no" |
| Guests | Number | ✅ | Party size |
| Dietary | Text | ⚠️ | Restrictions |
| Message | Text | ⚠️ | Guest message |
| Submitted At | Date | ✅ | Auto-populated |
| Status | Select | ✅ | "Pending Review", "Approved", "Declined" |

### Select Options

**Attending:**
- yes
- no

**Status:**
- Pending Review
- Approved
- Declined

### Initial Setup Steps

1. Create new database in Notion
2. Name it "Wedding RSVPs"
3. Add columns as shown above
4. Get database ID from URL
5. Share with integration

---

## 📧 Email Service Configuration

### Option 1: Gmail (Recommended for testing)

**Setup:**
1. Enable 2-Factor Authentication
2. Generate App Password
3. Settings: `EMAIL_PASS` = 16-character password

**Advantages:**
- Free unlimited emails
- Easy setup
- Good for testing

**Limitations:**
- May hit rate limits
- Emails may go to spam
- Personal account looks unprofessional

### Option 2: SendGrid (Recommended for production)

**Setup:**
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API key
3. Settings: `EMAIL_USER` = "apikey", `EMAIL_PASS` = your API key

**Advantages:**
- Professional emails
- Better deliverability
- Analytics and tracking
- Free tier: 100 emails/day

**Limitations:**
- Requires signup
- Pro tier: ~$15/month after free tier

### Option 3: Other Services

Mailgun, AWS SES, Resend - Similar setup pattern

---

## 🚀 Deployment Process

### Step 1: Prepare Code

```bash
# Check for uncommitted changes
git status

# Add all changes
git add .

# Commit with meaningful message
git commit -m "Add email confirmation system and admin dashboard"

# Push to GitHub
git push origin integrate-to-notion
```

### Step 2: Connect to Netlify

1. Go to [netlify.com](https://app.netlify.com)
2. Click "Add new site"
3. Select "Import an existing project"
4. Choose GitHub repository `summer_Dream`
5. Netlify auto-detects configuration
6. Click "Deploy site"

### Step 3: Set Environment Variables

1. Dashboard → Site settings → Environment
2. Add variables one by one:

```
NOTION_API_KEY: secret_xxxx...
NOTION_DATABASE_ID: xxxx...
EMAIL_HOST: smtp.gmail.com
EMAIL_PORT: 587
EMAIL_USER: your-email@gmail.com
EMAIL_PASS: your-app-password
ADMIN_EMAIL: your-email@gmail.com
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
```

### First Login

1. Enter your `ADMIN_SECRET`
2. Click "Login"
3. Password stored in localStorage

### Dashboard Features

**Statistics**
- Total RSVPs received
- Guests attending
- Pending approvals

**Actions**
- View full guest details
- Approve RSVP (sends confirmation email)
- Decline RSVP (sends decline email)
- Search and filter RSVPs

**Admin Controller** (`controllers/admin.js`)

Handles:
- Authentication
- RSVP retrieval from Notion
- Approval/decline logic
- Email sending via Netlify function

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
- [ ] Form validation works
- [ ] Submit button functional
- [ ] Success message appears
- [ ] Data appears in Notion
- [ ] Email notification sent (if enabled)

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
- Backup Notion regularly

❌ **DON'T:**
- Share API keys via email
- Hardcode credentials in code
- Use simple passwords
- Commit `.env` file
- Expose secrets in logs
- Use production credentials locally

---

## 📚 Documentation Files

- `docs/EMAIL_SYSTEM.md` - Email confirmation setup
- `docs/DEPLOYMENT.md` - Deployment guide
- `docs/NOTION_INTEGRATION.md` - Notion API setup
- `docs/SECURITY.md` - Security best practices
- `docs/QUICKSTART.md` - Quick start guide
- `CHANGELOG.md` - Version history

---

## ❓ Troubleshooting

### Build Fails on Netlify

**Solution:**
1. Check `netlify.toml` syntax
2. Verify `package.json` has all dependencies
3. Check Node version in build settings
4. Review build logs for errors

### Functions Not Responding

**Solution:**
1. Check functions deployed in Netlify
2. Verify environment variables set
3. Check function logs
4. Test with curl command

### Emails Not Sending

**Solution:**
1. Verify email credentials
2. Check email service account settings
3. Review function logs
4. Try with test email
5. Check spam folder

### Admin Dashboard Not Loading

**Solution:**
1. Clear cache (Ctrl+Shift+Delete)
2. Check browser console (F12)
3. Verify Notion API key
4. Check admin secret
5. Verify database ID

---

## 🎉 You're Live!

Congratulations! Your wedding website is now:
- ✅ Deployed and accessible
- ✅ Receiving RSVPs
- ✅ Sending confirmation emails
- ✅ Managed via admin dashboard
- ✅ Secure and professional

**Next Steps:**
1. Share website with guests
2. Monitor RSVP responses
3. Approve guests and send confirmations
4. Customize email templates
5. Gather additional information if needed

---

*Made with ❤️ for J-D & A-N's Special Day*

**Questions?** Check the docs folder or create an issue on GitHub.
