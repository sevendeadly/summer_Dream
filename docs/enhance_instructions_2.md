# Wedding Website Enhancement Guide
## Email Confirmation System + Modern UI Implementation

---

## 📧 PART 1: EMAIL CONFIRMATION SYSTEM

### Overview
This system allows you to:
1. Receive RSVP submissions in Notion
2. Review submissions in an admin dashboard
3. Manually approve and send beautiful confirmation emails to guests

### Architecture
```
Guest submits RSVP → Saves to Notion → You review in Admin Dashboard → 
→ Click "Approve" → Confirmation email sent automatically
```

---

## 🚀 Step-by-Step Implementation

### **Step 1: Install Dependencies**

Create a `package.json` in your project root:

```json
{
  "name": "wedding-website",
  "version": "1.0.0",
  "description": "J-D & A-N Wedding Website",
  "dependencies": {
    "@notionhq/client": "^2.2.15",
    "nodemailer": "^6.9.8"
  },
  "devDependencies": {}
}
```

Install dependencies:
```bash
npm install
```

---

### **Step 2: Set Up Email Service**

You need an email service. **Recommended options:**

#### Option A: Gmail (Easiest for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Wedding Website"
   - Copy the 16-character password

3. **Environment Variables**:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ADMIN_EMAIL=your-email@gmail.com
   ```

#### Option B: SendGrid (Better for Production)

1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Create an API key
3. Environment variables:
   ```
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=your-sendgrid-api-key
   ADMIN_EMAIL=your-email@gmail.com
   ```

#### Option C: Mailgun, AWS SES, or Resend

Similar setup - just update the SMTP credentials.

---

### **Step 3: Create Netlify Functions**

Create folder structure:
```
your-repo/
├── netlify/
│   └── functions/
│       ├── submit-rsvp.js
│       ├── send-confirmation.js
│       └── get-rsvps.js (optional)
├── admin/
│   └── dashboard.html
├── views/
├── models/
├── controllers/
└── netlify.toml
```

#### A. `netlify.toml` (project root)
```toml
[build]
  functions = "netlify/functions"
  publish = "views"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/admin"
  to = "/admin/dashboard.html"
  status = 200
```

#### B. Copy the Functions

Copy these 3 files into `netlify/functions/`:
1. `submit-rsvp.js` (from the first artifact I created)
2. `send-confirmation.js` (from the second artifact)
3. `get-rsvps.js` (create this next)

#### C. Create `get-rsvps.js`
```javascript
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
```

---

### **Step 4: Update Notion Database**

Add these columns to your Notion RSVP database:

| Column Name | Type | Options |
|-------------|------|---------|
| Name | Title | - |
| Email | Email | - |
| Phone | Phone | - |
| Attending | Select | Options: "yes", "no" |
| Guests | Number | - |
| Dietary | Text | - |
| Message | Text | - |
| Submitted At | Date | - |
| **Status** | **Select** | **Options: "Pending Review", "Approved", "Declined"** |

---

### **Step 5: Deploy to Netlify**

#### A. Push to GitHub
```bash
git add .
git commit -m "Add email system and admin dashboard"
git push origin main
```

#### B. Connect to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repo
4. Netlify auto-detects settings
5. Click "Deploy site"

#### C. Set Environment Variables

In Netlify dashboard:
1. Go to **Site settings** → **Environment variables**
2. Add these variables:

```
NOTION_API_KEY=secret_xxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=your-email@gmail.com
ADMIN_SECRET=choose-a-strong-password-here
```

3. Save and redeploy

---

### **Step 6: Set Up Admin Dashboard**

#### A. Create `admin/dashboard.html`

Copy the admin dashboard HTML from the artifact I created into:
```
your-repo/admin/dashboard.html
```

#### B. Update the JavaScript

In the `dashboard.html` file, find the `loadRSVPs()` function and replace the mock data with:

```javascript
async function loadRSVPs() {
    try {
        const response = await fetch('/.netlify/functions/get-rsvps', {
            headers: {
                'X-Admin-Secret': adminSecret
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load RSVPs');
        }
        
        const data = await response.json();
        allRSVPs = data.results;
        
        updateStats();
        displayRSVPs(allRSVPs);
    } catch (error) {
        console.error('Error loading RSVPs:', error);
        alert('Failed to load RSVPs. Check your admin secret.');
    }
}
```

#### C. Access the Dashboard

After deployment, visit:
```
https://your-site.netlify.app/admin
```

Login with your `ADMIN_SECRET` password.

---

### **Step 7: Update RSVP Controller**

In `controllers/rsvp.js`, update the `submitToNotion()` function:

```javascript
async submitToNotion(data) {
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

---

## 📧 Email Workflow

### How It Works:

1. **Guest submits RSVP** → Saved to Notion with status "Pending Review"
2. **You receive email notification** with guest details
3. **Review in Admin Dashboard** at `/admin`
4. **Click "Approve & Email"** button
5. **Confirmation email sent automatically** to guest
6. **Status updated to "Approved"** in Notion

### Email Templates

The system sends different emails based on attendance:

**Attending = Yes:**
- Subject: "✨ Your RSVP is Confirmed - We Can't Wait to See You!"
- Includes: Wedding details, schedule, venue info
- Beautiful gradient design matching your theme

**Attending = No:**
- Subject: "Thank You for Letting Us Know"
- Warm message acknowledging they can't attend
- Invitation to view photos after the wedding

---

## 🎨 PART 2: MODERN UI IMPROVEMENTS

### Key Enhancements Based on 2024-2025 Trends

#### 1. **Typography & Fonts**
- Primary: Cormorant Garamond (elegant serif)
- Secondary: Montserrat (clean sans-serif)
- Better hierarchy and readability

#### 2. **Animations**
- Smooth fade-in effects on scroll
- Hover animations on cards
- Parallax background patterns
- Button ripple effects

#### 3. **Modern Card Design**
- Rounded corners (20px radius)
- Subtle shadows with depth
- Hover lift effects
- Border accent on top

#### 4. **Enhanced Navigation**
- Sticky navigation with blur effect
- Underline animation on hover
- Active state indicators

#### 5. **Improved Hero Section**
- Full-height viewport
- Animated background pattern
- Better countdown timer design
- Staggered fade-in animations

#### 6. **Responsive Improvements**
- Mobile-first approach
- Better spacing on all devices
- Fluid typography with clamp()

---

## 🚀 Implementing the New CSS

### **Step 1: Backup Current CSS**
```bash
cp assets/css/styles.css assets/css/styles-backup.css
```

### **Step 2: Replace with Modern CSS**

Replace the contents of `assets/css/styles.css` with the modern CSS from the artifact.

### **Step 3: Test Locally**
```bash
python -m http.server 8000
# Visit http://localhost:8000/views/
```

### **Step 4: Deploy**
```bash
git add assets/css/styles.css
git commit -m "Update to modern wedding website design"
git push origin main
```

---

## 🎨 UI Customization Guide

### Change Colors Easily

The new CSS uses CSS variables. Update these in the `:root` section:

```css
:root {
    --primary-color: #d4a5a5;      /* Main theme color */
    --secondary-color: #c9a86a;    /* Accent color */
    --accent-color: #ffffff;        /* Background accent */
    --text-dark: #2c2c2c;          /* Main text */
    --text-light: #666666;         /* Secondary text */
    --background: #faf8f5;         /* Page background */
}
```

### Add Custom Animations

Example - Fade in on scroll:
```css
.fade-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s ease;
}

.fade-on-scroll.visible {
    opacity: 1;
    transform: translateY(0);
}
```

Add JavaScript:
```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
});

document.querySelectorAll('.fade-on-scroll').forEach((el) => {
    observer.observe(el);
});
```

---

## 🐛 Troubleshooting

### Email Issues

**Problem:** Emails not sending
- Check environment variables are set correctly
- Verify SMTP credentials
- Check Netlify function logs
- Test with a simple tool like Mailtrap first

**Problem:** Emails going to spam
- Use a verified email domain
- Set up SPF and DKIM records
- Use SendGrid or similar service
- Don't use words like "click here" excessively

### Admin Dashboard Issues

**Problem:** Can't login
- Verify `ADMIN_SECRET` environment variable
- Check browser console for errors
- Clear browser cache

**Problem:** RSVPs not loading
- Check Notion API key has database access
- Verify database ID is correct
- Check network tab in browser dev tools

### CSS Issues

**Problem:** Styles not loading
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Check CSS file path in HTML
- Verify deployment completed

---

## 📊 Testing Checklist

### Email System
- [ ] RSVP submission creates Notion entry
- [ ] Admin receives notification email
- [ ] Can access admin dashboard
- [ ] Can approve RSVPs
- [ ] Confirmation emails send successfully
- [ ] Email templates render correctly
- [ ] Both "attending" and "not attending" emails work

### UI/UX
- [ ] All animations work smoothly
- [ ] Responsive on mobile, tablet, desktop
- [ ] Navigation sticky behavior works
- [ ] Countdown timer updates correctly
- [ ] All hover effects work
- [ ] Forms are styled consistently
- [ ] Page loads fast (< 3 seconds)
- [ ] Images optimized and load quickly

---

## 🚀 Optional Enhancements

### 1. **Auto-Reminder Emails**

Send reminder emails 1 week before wedding:

Create `netlify/functions/send-reminders.js` and use Netlify's scheduled functions:

```javascript
// Runs weekly
exports.handler = async (event, context) => {
    const weddingDate = new Date('2026-06-12');
    const today = new Date();
    const daysUntil = Math.floor((weddingDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntil === 7) {
        // Send reminders to all approved RSVPs
    }
};
```

### 2. **SMS Notifications**

Use Twilio to send SMS confirmations:

```bash
npm install twilio
```

Add to confirmation function.

### 3. **Guest Photo Upload**

Allow guests to upload photos during the event:
- Use Cloudinary or AWS S3
- Create upload page
- Display in gallery

### 4. **Live RSVP Counter**

Show real-time attendance count on homepage using Notion API.

### 5. **Multilingual Support**

Add language switcher for international guests.

---

## 💰 Cost Breakdown

All services used have free tiers:

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| **Netlify Hosting** | 300 build mins/month | $19/month |
| **Notion** | Unlimited pages | Free forever |
| **Gmail SMTP** | Unlimited | Free |
| **SendGrid** | 100 emails/day | $15/month for 40k |
| **GitHub** | Unlimited repos | Free |

**Total for wedding website:** $0 (using free tiers)

---

## 📞 Support & Resources

### Documentation
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Notion API](https://developers.notion.com/)
- [Nodemailer](https://nodemailer.com/about/)

### Common Issues
- Check Netlify function logs: Site settings → Functions → View logs
- Test functions locally: `netlify dev`
- Notion API playground: https://developers.notion.com/

### Contact
If you run into issues:
1. Check the troubleshooting section above
2. Review Netlify function logs
3. Check browser console for JavaScript errors
4. Verify environment variables

---

## 🎉 Final Checklist

Before going live:

**Email System:**
- [ ] All environment variables set in Netlify
- [ ] Test RSVP submission end-to-end
- [ ] Test approval and email sending
- [ ] Verify emails look good on mobile
- [ ] Set up email signatures and branding

**Website:**
- [ ] Replace all placeholder text
- [ ] Add venue details and addresses
- [ ] Update payment links
- [ ] Add wedding date and times
- [ ] Test all pages on mobile
- [ ] Generate QR code
- [ ] Share with test users

**Admin:**
- [ ] Save admin password securely
- [ ] Test admin dashboard thoroughly
- [ ] Set up email filters for notifications
- [ ] Create RSVP review schedule

---

## 🎊 Congratulations!

Your wedding website now has:
- ✅ Professional email confirmation system
- ✅ Modern, beautiful UI matching 2024-2025 trends
- ✅ Admin dashboard for easy RSVP management
- ✅ Automated workflows
- ✅ Mobile-responsive design
- ✅ Free hosting and services

**Your guests will love it!** 💕

---

*Made with ❤️ for J-D & A-N's Special Day*
*June 12, 2026*