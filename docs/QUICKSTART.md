# Quick Start Guide

Get your wedding website live in 5 minutes!

## ⚡ Fast Track to Deployment

### Step 1: Enable GitHub Pages (2 minutes)

1. Go to your repository: https://github.com/sevendeadly/summer_Dream
2. Click **Settings** (top right)
3. Click **Pages** (left sidebar)
4. Under **Source**:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

**Your site will be live at:** `https://sevendeadly.github.io/summer_Dream/`

Wait 2-3 minutes for deployment to complete.

### Step 2: Customize Essential Info (10 minutes)

#### Update `info.html` - Wedding Details
```html
<!-- Replace these placeholders: -->
[Venue Name]          → Your actual venue name
[Venue Address]       → Actual address
[City, State, ZIP]    → City, state, zip code
[Hotel Name 1]        → Hotel name
[Hotel Address]       → Hotel address
[Phone Number]        → Hotel phone
[WEDDING CODE]        → Hotel booking code
```

#### Update `gift.html` - Payment Details
```html
<!-- Replace these placeholders: -->
[Account Holder Name] → Your name
[IBAN Number]         → Your IBAN
[BIC/SWIFT Code]      → Your BIC/SWIFT
[Your Wero ID/Phone Number] → Your Wero ID
```

#### Update `script.js` - Payment Links
```javascript
// Line 8-12, update these:
const PAYMENT_LINKS = {
    paypal: 'https://paypal.me/YourPayPalID',
    wise: 'https://wise.com/pay/me/YourWiseID', 
    wero: 'wero://pay?to=YOUR-PHONE-NUMBER',
};
```

### Step 3: Push Your Changes

```bash
git add .
git commit -m "Add wedding details"
git push origin main
```

Your site will automatically update in 1-2 minutes!

### Step 4: Create QR Code (2 minutes)

1. Go to: https://www.qr-code-generator.com/
2. Paste your URL: `https://sevendeadly.github.io/summer_Dream/`
3. Download QR code
4. Add to wedding invitations!

---

## 🎨 Optional: Change Color Theme

In `styles.css` (line 8-50):

**Default: Romantic Blush & Gold** ✅
```css
:root {
    --primary-color: #d4a5a5;
    --secondary-color: #c9a86a;
    ...
}
```

**Option 2: Garden Sage & Terracotta**
Uncomment the second palette block.

**Option 3: Ocean Blue & Coral**
Uncomment the third palette block.

Only one palette should be uncommented at a time!

---

## 📝 Optional: Notion RSVP Integration

For automatic RSVP collection, see **[NOTION_INTEGRATION.md](NOTION_INTEGRATION.md)**

**Quick Alternative:** Use Google Forms
1. Create a Google Form
2. Get embed link
3. Replace form in `rsvp.html`
4. Responses go to Google Sheets automatically!

---

## 🔧 Testing Locally

Before pushing changes:

```bash
# Start local server
python -m http.server 8000

# Or with Node.js
npx serve

# Visit: http://localhost:8000
```

---

## ✅ Checklist Before Going Live

- [ ] Enable GitHub Pages
- [ ] Update venue details in `info.html`
- [ ] Add payment details in `gift.html` and `script.js`
- [ ] Test all pages on mobile and desktop
- [ ] Generate QR code
- [ ] Share with guests!

---

## 📞 Need Help?

- **Deployment Issues**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Notion Setup**: See [NOTION_INTEGRATION.md](NOTION_INTEGRATION.md)
- **Full Documentation**: See [README.md](README.md)

---
## Sign-Off

**Project:** summer_Dream Wedding Website  
**Version:** 2.0 (MVC + Modern Styling)  
**Date:** December 10, 2025  
**Status:** ✅ **READY FOR PRODUCTION**

All integration tasks completed successfully.  
MVC architecture verified and compliant.  
CSS merged and enhanced.  
All features working as expected.

---

*Share your beautiful website with family and friends!*
