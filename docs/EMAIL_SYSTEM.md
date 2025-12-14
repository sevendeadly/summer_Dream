# Email Confirmation System Setup & Implementation

**Complete guide to setting up and using the email confirmation system for RSVPs.**

---

## 📧 System Overview

The email confirmation system allows you to:

1. **Receive RSVPs** - Guests submit RSVP through the form
2. **Store in Notion** - All submissions saved to your Notion database
3. **Review & Approve** - Access admin dashboard to review submissions
4. **Send Confirmations** - Send beautiful HTML emails to approved guests
5. **Track Status** - Monitor attendance and approvals

### Architecture

```
Guest RSVP Form (views/rsvp.html)
         ↓
   Netlify Function
   (submit-rsvp.js)
         ↓
   Notion Database
         ↓
   Admin Dashboard
   (views/admin_dashboard.html)
         ↓
   Netlify Function
   (send-confirmation.js)
         ↓
   Guest Email
```

---

## 🚀 Step 1: Dependencies & Configuration

### 1.1 Install Dependencies

```bash
npm install @notionhq/client nodemailer
```

This installs:
- **@notionhq/client** - Notion API client
- **nodemailer** - Email sending library

### 1.2 Verify Package.json

Your `package.json` should have:

```json
{
  "name": "wedding-website",
  "version": "2.1.0",
  "dependencies": {
    "@notionhq/client": "^2.2.15",
    "nodemailer": "^6.9.8"
  }
}
```

---

## 🔐 Step 2: Environment Variables

### 2.1 Create `.env` file

```bash
# Notion Configuration
NOTION_API_KEY=secret_your_api_key_here
NOTION_DATABASE_ID=your_database_id_here

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
ADMIN_EMAIL=your-email@gmail.com

# Security
ADMIN_SECRET=your-secure-admin-password-here
```

### 2.2 Get Notion API Key

1. Go to [Notion Developers](https://www.notion.so/my-integrations)
2. Click "Create new integration"
3. Name it "Wedding Website"
4. Copy the **Internal Integration Secret**
5. Paste into `NOTION_API_KEY`

### 2.3 Get Notion Database ID

1. Open your RSVP database in Notion
2. Copy the URL: `https://www.notion.so/workspace/[DATABASE_ID]?v=[VIEW_ID]`
3. Extract the `DATABASE_ID` part (long string)
4. Share the database with your integration (click "Share" → select integration)

### 2.4 Set Up Gmail SMTP

1. Go to [Google Account](https://myaccount.google.com/)
2. Enable **2-Factor Authentication**
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Other (Custom name)"
5. Name it "Wedding Website"
6. Copy the **16-character password**
7. Paste into `EMAIL_PASS`

### Alternative Email Services

**SendGrid:**
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```



---

## 📦 Step 3: Notion Database Setup

### 3.1 Create RSVP Database Structure

Create a new Notion database with these columns:

| Column | Type | Options |
|--------|------|---------|
| **Name** | Title | - |
| **Email** | Email | - |
| **Phone** | Phone Number | - |
| **Attending** | Select | "yes", "no" |
| **Guests** | Number | - |
| **Dietary** | Text | - |
| **Message** | Text | - |
| **Submitted At** | Date | - |
| **Status** | Select | "Pending Review", "Approved", "Declined" |

### 3.2 Record Format Example

```
Name: John Doe
Email: john@example.com
Phone: +1 (555) 123-4567
Attending: yes
Guests: 2
Dietary: Vegetarian
Message: Looking forward to the celebration!
Submitted At: 2026-06-01
Status: Pending Review
```

---

## 🛠️ Step 4: Netlify Functions

### 4.1 Function Structure

Three functions handle the email system:

```
controllers/netlify-func/
├── submit-rsvp.js           # Receive RSVP submissions
├── send-confirmation.js     # Send confirmation emails
└── get-rsvps.js            # Retrieve RSVPs for admin
```

### 4.2 Function Endpoints

**Submit RSVP**
```
POST /.netlify/functions/submit-rsvp
Body: { name, email, phone, attending, guests, dietary, message }
Response: { success, message }
```

**Send Confirmation**
```
POST /.netlify/functions/send-confirmation
Headers: { X-Admin-Secret }
Body: { rsvpId, status }
Response: { success, message }
```

**Get RSVPs**
```
GET /.netlify/functions/get-rsvps
Headers: { X-Admin-Secret }
Response: { results: [rsvp...] }
```

### 4.3 Deployment Configuration

File: `netlify.toml`

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

---

## 🚀 Step 5: Deploy to Netlify

### 5.1 Connect Repository

1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Select GitHub repository `summer_Dream`
4. Netlify auto-detects configuration
5. Click "Deploy site"

### 5.2 Set Environment Variables

1. In Netlify Dashboard → Site settings
2. Go to "Environment variables"
3. Add each variable from your `.env`:

```
NOTION_API_KEY: secret_abc123...
NOTION_DATABASE_ID: abc123def456...
EMAIL_HOST: smtp.gmail.com
EMAIL_PORT: 587
EMAIL_USER: your-email@gmail.com
EMAIL_PASS: your-app-password
ADMIN_EMAIL: your-email@gmail.com
ADMIN_SECRET: your-secure-password
```

4. Trigger redeploy for changes to take effect

### 5.3 Test Deployment

```bash
# Test RSVP submission
curl -X POST https://your-site.netlify.app/.netlify/functions/submit-rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Guest",
    "email": "test@example.com",
    "phone": "+1 (555) 123-4567",
    "attending": "yes",
    "guests": "1",
    "dietary": "None",
    "message": "Test message"
  }'
```

---

## 👨‍💼 Step 6: Admin Dashboard Setup

### 6.1 Access Admin Dashboard

```
https://your-site.netlify.app/admin
```

### 6.2 Initial Login

1. Enter your `ADMIN_SECRET`
2. Click "Login"
3. Dashboard loads all pending RSVPs

### 6.3 Dashboard Features

**Statistics Panel**
- Total RSVPs received
- Guests attending
- Pending approvals

**Filter & Search**
- Filter by attending status (yes/no)
- Filter by approval status
- Search by name or email

**RSVP Actions**
- **View Details** - See full guest information
- **Approve** - Send confirmation email (marks as "Approved")
- **Decline** - Send decline email (marks as "Declined")
- **Refresh** - Reload RSVPs from Notion

**Sorting**
- Click column headers to sort
- Name, email, status, etc.

---

## 📧 Step 7: Email Templates

### 7.1 Confirmation Email

When approved, guests receive:

```
Subject: We're excited to celebrate with you! 💕

Dear [Guest Name],

Thank you for confirming your attendance! We're thrilled you'll be 
joining us on June 12, 2026.

Guest Details:
- Party Size: [Number] person/people
- Dietary Restrictions: [Dietary info or "None"]

[Additional wedding details...]

Looking forward to celebrating with you!

Best wishes,
J-D & A-N
```

### 7.2 Email Customization

Edit `controllers/netlify-func/send-confirmation.js`:

```javascript
// Find the emailContent section and modify HTML template
const emailContent = `
    <h2>Thank you for your RSVP!</h2>
    <p>Dear ${guestName},</p>
    <p>Your custom message here...</p>
    <!-- Customize as needed -->
`;
```

### 7.3 HTML Email Best Practices

- **Mobile-responsive** - Test on all devices
- **Plain text fallback** - For email clients that don't support HTML
- **Proper spacing** - Use tables for layout
- **Brand colors** - Match website theme
- **Call-to-action** - Include relevant links

---

## 🔒 Step 8: Security Best Practices

### 8.1 API Key Protection

✅ **DO:**
- Store keys in environment variables
- Use serverless functions for API calls
- Rotate keys periodically
- Use read-only access where possible

❌ **DON'T:**
- Hardcode keys in JavaScript
- Commit `.env` files
- Share keys via email
- Use same key for multiple services

### 8.2 Admin Secret

Your `ADMIN_SECRET` is:
- ✅ Stored in Netlify environment variables
- ✅ Transmitted via HTTPS only
- ✅ Required for all admin functions
- ⚠️ Change it if compromised

Generate a strong admin secret:
```bash
# Generate secure password
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 8.3 Data Privacy

- GDPR compliant - Store minimal guest data
- Notify guests about data storage
- Delete data after wedding (optional)
- Secure RSVP form - No unencrypted submission
- Email verification - Confirm guest email

---

## 🐛 Step 9: Troubleshooting

### Issue: "Notion API Key Invalid"

**Solution:**
1. Verify key format: `secret_` prefix required
2. Check integration is shared with database
3. Ensure database ID is correct
4. Regenerate key if necessary

### Issue: "Email Not Sending"

**Solution:**
1. Check email credentials in Netlify
2. Verify SMTP server and port settings
3. Check email account settings (2FA enabled)
4. Review Netlify function logs
5. Test with different email service

### Issue: "Admin Dashboard Not Loading"

**Solution:**
1. Clear browser cache and localStorage
2. Verify admin secret is correct
3. Check browser console for errors
4. Verify `.netlify/functions` are deployed
5. Check Netlify build logs

### Issue: "RSVP Not Appearing in Notion"

**Solution:**
1. Verify database structure matches expectations
2. Check function logs for errors
3. Ensure database is shared with integration
4. Test with curl command
5. Verify Notion database ID

---

## 📊 Step 10: Monitoring & Analytics

### 10.1 Track Responses

**In Admin Dashboard:**
- View real-time RSVP count
- Monitor acceptance rate
- Track dietary restrictions
- See submission timeline

### 10.2 Export Data

**From Notion:**
1. Select all RSVPs
2. Click "..." menu
3. Choose "Download as CSV"
4. Import to spreadsheet

### 10.3 Netlify Analytics

**Monitor Functions:**
1. Netlify Dashboard → Functions tab
2. View function logs
3. Monitor execution time
4. Check error rates

---

## ✅ Complete Checklist

Before going live:

- [ ] Notion API key obtained and verified
- [ ] Notion database created with correct structure
- [ ] Database shared with integration
- [ ] Gmail 2FA enabled (or email service set up)
- [ ] Environment variables set in Netlify
- [ ] Functions deployed successfully
- [ ] Admin dashboard accessible at `/admin`
- [ ] Test RSVP submission end-to-end
- [ ] Test email sending
- [ ] Verify emails look good on mobile
- [ ] Test admin dashboard functionality
- [ ] Admin secret saved securely
- [ ] Test decline functionality
- [ ] Backup Notion database
- [ ] Share dashboard access with partner (if needed)

---

## 📞 Getting Help

### Common Resources
- [Netlify Docs](https://docs.netlify.com/)
- [Notion API](https://developers.notion.com/)
- [Nodemailer](https://nodemailer.com/)

### Debug Steps
1. Check Netlify function logs: Dashboard → Functions → View logs
2. Check browser console: F12 → Console tab
3. Verify environment variables in Netlify
4. Test API endpoints with curl or Postman
5. Review error messages carefully

### Contact Support
- Netlify Support: https://app.netlify.com/support
- Notion Support: https://notion.so/help
- GitHub Issues: Create issue in repository

---

## 🎉 You're All Set!

Your wedding website now has a complete email confirmation system. Your guests can RSVP with one click, and you can manage responses beautifully!

**Next Steps:**
1. Customize email templates to match your brand
2. Share admin dashboard link with your partner
3. Test the system thoroughly
4. Train anyone who'll help manage RSVPs
5. Set a reminder to review RSVPs regularly

---

*Made with ❤️ for your special day*

**Questions?** Check the troubleshooting section or review the enhance_instructions_2.md documentation.
