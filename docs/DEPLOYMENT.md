# Wedding Website Deployment Guide

This guide will walk you through deploying your wedding website to GitHub Pages for **FREE** hosting.

## ✅ Prerequisites

- GitHub account (free)
- Git installed on your computer
- Your wedding website files (already in this repository!)

## 🚀 Quick Deployment Steps

### Step 1: Push Your Code to GitHub

If you haven't already pushed this code to GitHub:

```bash
# Navigate to your project directory
cd summer_Dream

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial wedding website commit"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR-USERNAME/summer_Dream.git

# Push to GitHub
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to your GitHub repository: `https://github.com/YOUR-USERNAME/summer_Dream`
2. Click on **Settings** (top right)
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select:
   - Branch: `main` (or `master`)
   - Folder: `/ (root)`
5. Click **Save**
6. Wait 2-3 minutes for deployment

### Step 3: Access Your Website

Your website will be live at:
```
https://YOUR-USERNAME.github.io/summer_Dream/
```

For example, if your GitHub username is `sevendeadly`, your website will be at:
```
https://sevendeadly.github.io/summer_Dream/
```

## 🎨 Customization Before Deployment

### 1. Update Website Content

Edit the HTML files to add your personal information:

#### `info.html` - Update with your venue details:
- Venue name and address
- Schedule times
- Hotel information
- Contact details

#### `gift.html` - Add your payment information:
- PayPal link
- Wise link
- Bank account details (IBAN, BIC/SWIFT)
- Wero ID

#### `script.js` - Configure payment links:
```javascript
const PAYMENT_LINKS = {
    paypal: 'https://paypal.me/YourPayPalID', // Your PayPal.me link
    wise: 'https://wise.com/pay/me/YourWiseID', // Your Wise link
    wero: 'wero://pay?to=YOUR-PHONE-NUMBER', // Your Wero payment link
};
```

### 2. Choose Your Color Palette

Edit `styles.css` to switch between 3 color themes:

- **Palette 1** (Default): Romantic Blush & Gold ✅
- **Palette 2**: Garden Sage & Terracotta
- **Palette 3**: Ocean Blue & Coral

To change palette, uncomment the desired palette in `styles.css` (around line 8-30).

### 3. Set Up Notion Integration (Optional)

To receive RSVP submissions in Notion:

1. Create a Notion account at [notion.so](https://notion.so)
2. Create a new database with these columns:
   - Name (Title)
   - Email (Email)
   - Phone (Phone)
   - Attending (Select: Yes/No)
   - Guests (Number)
   - Dietary (Text)
   - Message (Text)
   - Submitted At (Date)

3. Create a Notion Integration:
   - Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
   - Click **+ New integration**
   - Name it "Wedding RSVP"
   - Copy the **Internal Integration Token**

4. Share your database with the integration:
   - Open your database in Notion
   - Click **Share** (top right)
   - Invite your integration

5. Get your Database ID:
   - Open your database in Notion
   - Copy the URL: `https://notion.so/xxxxxxxxxx?v=yyyy`
   - The Database ID is `xxxxxxxxxx` (32 characters)

6. **For production**: Create a serverless function to handle Notion API calls securely
   - See `NOTION_INTEGRATION.md` for detailed instructions

## 📱 Generate QR Code

After deployment, create a QR code for easy sharing:

### Option 1: Free Online QR Code Generators
1. Visit [qr-code-generator.com](https://www.qr-code-generator.com/)
2. Enter your GitHub Pages URL
3. Customize design (optional)
4. Download QR code image
5. Add to your wedding invitations!

### Option 2: Using QR Code API
```html
<!-- Add this to your invitation or print materials -->
<img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://YOUR-USERNAME.github.io/summer_Dream/" 
     alt="Wedding Website QR Code">
```

## 🔧 Updating Your Website

After making changes:

```bash
# Make your changes to the files
# Then:

git add .
git commit -m "Update wedding details"
git push origin main
```

Your website will automatically update in 1-2 minutes!

## 🌐 Custom Domain (Optional)

Want to use your own domain (e.g., `summerdream2026.com`)?

1. Purchase a domain from:
   - Namecheap (~$10/year)
   - Google Domains (~$12/year)
   - GoDaddy (~$15/year)

2. In your GitHub repository Settings → Pages:
   - Enter your custom domain
   - Save

3. In your domain provider's DNS settings, add:
   ```
   Type: CNAME
   Name: www
   Value: YOUR-USERNAME.github.io
   ```

4. Wait 24-48 hours for DNS propagation

Detailed guide: [GitHub Custom Domain Docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

## 💡 Tips & Best Practices

### Performance
- GitHub Pages is **free** and **fast**
- No server costs
- Automatically HTTPS enabled
- Global CDN for fast loading worldwide

### Privacy
- Don't commit sensitive API keys directly in code
- Use environment variables or serverless functions for Notion integration
- Keep bank details in a separate secure file if needed

### Testing Locally
Before pushing to GitHub, test locally:

```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js
npx serve

# Then visit: http://localhost:8000
```

### Backups
- Your code is already backed up on GitHub
- Download a ZIP backup from GitHub: **Code** → **Download ZIP**

## 📊 Analytics (Optional)

Track visitor statistics with Google Analytics:

1. Create account at [analytics.google.com](https://analytics.google.com)
2. Get your tracking ID (e.g., `G-XXXXXXXXXX`)
3. Add to each HTML file before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 🆘 Troubleshooting

### Website Not Loading
- Wait 3-5 minutes after enabling GitHub Pages
- Check Settings → Pages for deployment status
- Ensure `index.html` is in the root directory
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)

### Broken Links
- All links should be relative (e.g., `href="info.html"` not `href="/info.html"`)
- If using custom domain, links should work automatically

### CSS Not Loading
- Ensure `styles.css` is in the same directory as HTML files
- Check browser console for errors (F12)

## 📞 Support

If you need help:
1. Check GitHub Pages Status: [githubstatus.com](https://www.githubstatus.com/)
2. GitHub Pages Documentation: [docs.github.com/pages](https://docs.github.com/en/pages)
3. Open an issue in your repository

---

## 🎉 You're All Set!

Your wedding website is now live and ready to share with your guests!

**Share your website:**
- 📧 Email invitations with the link
- 📱 Share QR code on printed invitations
- 💬 Send via WhatsApp/text message
- 📲 Share on social media

**Remember to:**
- ✅ Test all pages before sharing
- ✅ Update payment links
- ✅ Add your venue details
- ✅ Test RSVP form
- ✅ Set up Notion integration (if using)
- ✅ Generate QR code

---

*Made with ❤️ for Audrey & Josue-Daniel 2026's Wedding - June 12, 2026*
