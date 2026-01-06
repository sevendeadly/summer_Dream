# Production Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the wedding website for production deployment. Follow these steps in order to ensure everything is configured correctly.

---

## Prerequisites

Before starting, ensure you have:

- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **Git** installed ([Download](https://git-scm.com/))
- ✅ **Netlify account** ([Sign up](https://app.netlify.com/signup))
- ✅ **SendGrid account** ([Sign up](https://signup.sendgrid.com/))
- ✅ **Text editor** (VS Code recommended)

---

## Step 1: Clone and Install

### 1.1 Clone Repository

```bash
git clone <your-repo-url>
cd summer_Dream
```

### 1.2 Install Dependencies

```bash
npm install
```

This installs:
- `@netlify/blobs` - For data storage
- `@sendgrid/mail` - For email delivery

---

## Step 2: Configure Environment Variables

### 2.1 Create `.env` File

Copy the example file:

```bash
cp .env.example .env
```

### 2.2 Set Up SendGrid

1. **Create SendGrid Account**
   - Go to [sendgrid.com](https://signup.sendgrid.com/)
   - Sign up for a free account (100 emails/day free)

2. **Create API Key**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name it "Wedding Website"
   - Select "Full Access" (or "Mail Send" only)
   - Copy the API key (you won't see it again!)

3. **Verify Sender Email**
   - Go to Settings → Sender Authentication
   - Verify your "From" email address
   - This is the email that will send confirmations

4. **Update `.env` File**
   ```bash
   SENDGRID_API_KEY=SG.your_api_key_here
   SENDGRID_FROM_EMAIL=your-verified-email@domain.com
   ```

### 2.3 Set Up Admin Secret

Generate a secure random string for admin authentication:

```bash
# Option 1: Use openssl (Mac/Linux)
openssl rand -base64 32

# Option 2: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Use online generator
# Visit: https://www.random.org/strings/
```

Add to `.env`:
```bash
ADMIN_SECRET=your_secure_random_string_here
```

**Important:** Keep this secret safe! Anyone with this secret can access the admin dashboard.

---

## Step 3: Customize Configuration

### 3.1 Update Wedding Details

Edit `models/config.js`:

```javascript
// Update wedding date and time
export const WEDDING_DATE = new Date('2026-06-12T15:30:00').getTime();
// Format: YYYY-MM-DDTHH:MM:SS (24-hour format)

// Update payment links
export const PAYMENT_LINKS = {
    paypal: 'https://www.paypal.com/paypalme/yourid',
    wise: 'https://wise.com/pay/me/yourid',
    wero: 'your-wero-id-or-phone',
};

// Update album links (after wedding)
export const ALBUM_LINKS = {
    ceremony: 'https://your-album-url.com',
    reception: 'https://your-album-url.com',
    couple: 'https://your-album-url.com',
    guests: 'https://your-album-url.com',
};
```

### 3.2 Update Content

Edit HTML files in `views/`:

- **`index.html`** - Home page, names, welcome message
- **`info.html`** - Venue details, schedule, dress code, FAQ
- **`gift.html`** - Bank details, payment instructions
- **`rsvp.html`** - RSVP form instructions (if needed)

### 3.3 Choose Theme

Edit `models/config.js` to customize theme palettes, or use the theme switcher on the website.

---

## Step 4: Test Locally

### 4.1 Install Netlify CLI

```bash
npm install -g netlify-cli
```

### 4.2 Login to Netlify

```bash
netlify login
```

This opens your browser to authenticate.

### 4.3 Run Local Development Server

```bash
netlify dev
```

This:
- Starts a local server (usually `http://localhost:8888`)
- Loads environment variables from `.env`
- Simulates Netlify Functions locally
- Provides hot-reload for development

### 4.4 Test Features

1. **Test RSVP Form**
   - Go to `/views/rsvp.html`
   - Fill out and submit the form
   - Check Netlify Blobs for stored data

2. **Test Admin Dashboard**
   - Go to `/views/admin_dashboard.html`
   - Login with your `ADMIN_SECRET`
   - Verify RSVPs are displayed
   - Test approve/decline functionality

3. **Test Email Sending**
   - Approve a test RSVP in admin dashboard
   - Check your email inbox
   - Verify email was received

---

## Step 5: Deploy to Netlify

### 5.1 Initialize Netlify Site

```bash
netlify init
```

Follow the prompts:
- Create & configure a new site
- Choose your team
- Build command: (leave empty, we're using static files)
- Publish directory: `.` (current directory)

### 5.2 Set Environment Variables in Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site
3. Go to **Site Settings** → **Environment Variables**
4. Add each variable from your `.env` file:
   - `SENDGRID_API_KEY`
   - `SENDGRID_FROM_EMAIL`
   - `ADMIN_SECRET`

### 5.3 Deploy

```bash
netlify deploy --prod
```

Or connect your GitHub repository for automatic deployments:
1. Go to Netlify Dashboard → **Site Settings** → **Build & Deploy**
2. Click **Link to Git provider**
3. Select your repository
4. Netlify will auto-deploy on every push

---

## Step 6: Verify Production Deployment

### 6.1 Test Production Site

1. Visit your Netlify site URL
2. Test all pages load correctly
3. Test RSVP form submission
4. Test admin dashboard login
5. Test email sending

### 6.2 Check Function Logs

1. Go to Netlify Dashboard → **Functions**
2. Click on a function name
3. View logs to ensure no errors

### 6.3 Verify Environment Variables

1. Go to Netlify Dashboard → **Site Settings** → **Environment Variables**
2. Verify all variables are set
3. Check that values are correct (not showing as `***` if you need to verify)

---

## Step 7: Post-Deployment Checklist

- [ ] All pages load correctly
- [ ] RSVP form submits successfully
- [ ] Admin dashboard accessible
- [ ] Admin can login with secret
- [ ] RSVPs appear in admin dashboard
- [ ] Approve/decline functionality works
- [ ] Emails are sent successfully
- [ ] Email templates display correctly
- [ ] Theme switching works
- [ ] Language switching works (if enabled)
- [ ] Mobile responsive design works
- [ ] All payment links work
- [ ] Countdown timer displays correctly

---

## Troubleshooting

### RSVP Submissions Fail

**Symptoms:** Form submission returns error

**Solutions:**
1. Check Netlify function logs for errors
2. Verify Netlify Blobs is enabled (should be automatic)
3. Check environment variables are set
4. Verify function is deployed correctly

### Emails Not Sending

**Symptoms:** No emails received after approving RSVP

**Solutions:**
1. Check SendGrid API key is correct
2. Verify sender email is verified in SendGrid
3. Check SendGrid account status (not suspended)
4. Review function logs for SendGrid errors
5. Check SendGrid activity feed for delivery status

### Admin Dashboard Not Loading

**Symptoms:** Dashboard shows error or doesn't load RSVPs

**Solutions:**
1. Verify `ADMIN_SECRET` is set in Netlify
2. Check browser console for errors
3. Verify admin secret matches between `.env` and Netlify
4. Check `get-rsvps` function logs

### Functions Return 502 Errors

**Symptoms:** Functions return 502 Bad Gateway

**Solutions:**
1. Check function code for syntax errors
2. Verify all dependencies are in `package.json`
3. Check function logs for runtime errors
4. Ensure Node.js version is compatible (18+)

---

## Security Best Practices

### 1. Admin Secret

- ✅ Use a long, random string (32+ characters)
- ✅ Never commit to Git
- ✅ Store only in environment variables
- ✅ Change if compromised
- ✅ Don't share in plain text

### 2. API Keys

- ✅ Never commit API keys to Git
- ✅ Use environment variables only
- ✅ Rotate keys periodically
- ✅ Use least privilege (minimum required access)

### 3. Email Security

- ✅ Verify sender email in SendGrid
- ✅ Use SPF/DKIM records for your domain
- ✅ Monitor SendGrid for suspicious activity
- ✅ Don't send sensitive data in emails

### 4. Data Protection

- ✅ All user input is validated
- ✅ HTML escaping prevents XSS
- ✅ HTTPS enforced by Netlify
- ✅ Admin authentication required

---

## Maintenance

### Regular Tasks

1. **Monitor RSVPs**
   - Check admin dashboard regularly
   - Respond to RSVPs promptly
   - Send confirmation emails

2. **Check Email Deliverability**
   - Monitor SendGrid dashboard
   - Check bounce rates
   - Verify sender reputation

3. **Update Content**
   - Update wedding details if needed
   - Add album links after wedding
   - Update FAQ as questions arise

### After the Wedding

1. **Update Album Links**
   - Upload photos to your preferred service
   - Update links in `models/config.js`
   - Redeploy to make albums visible

2. **Archive Data**
   - Export RSVP data from Netlify Blobs
   - Save for your records
   - Consider backing up to another service

---

## Support Resources

- **Netlify Docs:** [docs.netlify.com](https://docs.netlify.com/)
- **SendGrid Docs:** [docs.sendgrid.com](https://docs.sendgrid.com/)
- **Project Documentation:** See `docs/` directory
- **Architecture Guide:** `docs/ARCHITECTURE.md`
- **Email System Guide:** `docs/EMAIL_SYSTEM.md`

---

## Next Steps

After setup is complete:

1. ✅ Test all functionality
2. ✅ Share website with guests
3. ✅ Generate QR code for invitations
4. ✅ Monitor RSVPs in admin dashboard
5. ✅ Send confirmation emails promptly

**Congratulations! Your wedding website is ready! 🎉**
