# Summer & Dream Wedding Website

A lightweight, simple, and beautiful wedding website with countdown timer, RSVP form, gift pot, and photo albums.

## 🎉 Wedding Date: June 12, 2026

## ✨ Features

- **Home Page** - Elegant landing page with countdown timer to the big day
- **Wedding Info** - Venue details, schedule, dress code, accommodations, and FAQ
- **Gift Pot** - Multiple payment options (PayPal, Wise, Bank Transfer, Wero) and wishlist
- **RSVP Form** - Easy RSVP with optional Notion integration
- **Albums** - Photo gallery (automatically hidden until after June 12, 2026)
- **3 Color Palettes** - Easy theme switching using CSS variables
- **Fully Responsive** - Looks great on all devices
- **Lightweight** - No frameworks, pure HTML/CSS/JavaScript

## 🚀 Quick Start

### 1. Customize Your Website

Edit these files to add your personal information:

- **`index.html`** - Update names if needed
- **`info.html`** - Add venue, schedule, accommodations, FAQ
- **`gift.html`** - Add bank details and payment information
- **`script.js`** - Configure payment links (PayPal, Wise, Wero)

### 2. Choose Your Color Theme

In `styles.css`, uncomment one of the 3 color palettes:

- **Palette 1**: Romantic Blush & Gold (default)
- **Palette 2**: Garden Sage & Terracotta
- **Palette 3**: Ocean Blue & Coral

### 3. Deploy to GitHub Pages

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for step-by-step instructions.

Quick version:
```bash
git add .
git commit -m "Initial wedding website"
git push origin main
```

Then enable GitHub Pages in repository Settings → Pages → Select `main` branch.

Your site will be live at: `https://YOUR-USERNAME.github.io/summer_Dream/`

## 📱 Generate QR Code

After deployment, create a QR code for your website:

1. Visit [qr-code-generator.com](https://www.qr-code-generator.com/)
2. Enter your GitHub Pages URL
3. Download and add to invitations!

## 🔧 Optional: Notion Integration

To receive RSVP submissions in Notion, see **[NOTION_INTEGRATION.md](NOTION_INTEGRATION.md)** for detailed setup instructions.

Alternatively, use Google Forms for a simpler solution (instructions included in Notion guide).

## 📂 File Structure

```
summer_Dream/
├── index.html           # Home page with countdown
├── info.html            # Wedding information
├── gift.html            # Gift pot and payment options
├── rsvp.html            # RSVP form
├── albums.html          # Photo albums (hidden until after wedding)
├── styles.css           # All styles with 3 color palette options
├── script.js            # Countdown, form handling, date logic
├── DEPLOYMENT.md        # GitHub Pages deployment guide
├── NOTION_INTEGRATION.md # Notion RSVP setup guide
└── README.md            # This file
```

## 💰 Cost

**$0/year** - Completely free when hosted on GitHub Pages!

Optional costs:
- Custom domain: ~$10-15/year (optional)
- Nothing else needed!

## 🎨 Customization Tips

### Update Payment Links

In `script.js`:
```javascript
const PAYMENT_LINKS = {
    paypal: 'https://paypal.me/YourID',
    wise: 'https://wise.com/pay/me/YourID',
    wero: 'wero://pay?to=YOUR-PHONE',
};
```

### Update Bank Details

In `gift.html`, replace placeholders:
```html
[Account Holder Name]
[IBAN Number]
[BIC/SWIFT Code]
[Wero ID/Phone Number]
```

### Change Wedding Date

In `script.js` (if needed):
```javascript
const WEDDING_DATE = new Date('2026-06-12T15:30:00').getTime();
```

## 🧪 Testing Locally

Before deploying, test locally:

```bash
# Using Python
python -m http.server 8000

# Or using Node.js
npx serve

# Visit: http://localhost:8000
```

## 📱 Mobile Friendly

The website is fully responsive and looks great on:
- 📱 Smartphones
- 📱 Tablets
- 💻 Laptops
- 🖥️ Desktop computers

## 🌟 Key Features Explained

### Countdown Timer
- Updates in real-time every second
- Shows days, hours, minutes, seconds until wedding
- Automatically changes to "We're Married! 🎉" after June 12, 2026

### Albums Page Logic
- **Before June 12, 2026**: Shows "Coming Soon" message with countdown
- **After June 12, 2026**: Displays photo albums with view/download links
- Edit album links in `script.js` after wedding

### RSVP Form
- Shows/hides fields based on attendance selection
- Client-side validation
- Optional Notion integration for data storage
- Fallback to Google Forms if preferred

### Gift Pot
- Multiple payment options
- Direct bank transfer details
- Wishlist section
- No transaction fees (direct to you)

## 🔒 Security

- No sensitive data in code
- Payment links are just URLs (no API keys)
- Notion API keys should be in serverless functions (see NOTION_INTEGRATION.md)
- HTTPS automatically enabled by GitHub Pages

## 📊 Analytics (Optional)

Add Google Analytics to track visitors (free):

1. Get tracking ID from [analytics.google.com](https://analytics.google.com)
2. Add code to each HTML file (instructions in DEPLOYMENT.md)

## 🆘 Support & Troubleshooting

Common issues and solutions in **[DEPLOYMENT.md](DEPLOYMENT.md)**

## 📝 To-Do Before Going Live

- [ ] Update names and wedding date in `index.html`
- [ ] Add venue details in `info.html`
- [ ] Add bank details in `gift.html`
- [ ] Configure payment links in `script.js`
- [ ] Choose color palette in `styles.css`
- [ ] Test all pages locally
- [ ] Deploy to GitHub Pages
- [ ] Test live website on mobile and desktop
- [ ] Generate QR code
- [ ] Set up Notion integration (optional)
- [ ] Share with guests!

## 🎊 After the Wedding

1. Upload photos to Lightroom/Google Photos/Dropbox
2. Update album links in `script.js`
3. Test that albums page displays correctly
4. Let guests know photos are available!

## 📄 License

This is your personal wedding website. Feel free to modify and use as you wish!

## 🙏 Credits

Made with ❤️ for Summer & Dream

---

**Questions?** Check out:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment instructions
- [NOTION_INTEGRATION.md](NOTION_INTEGRATION.md) - RSVP setup guide

**Ready to deploy?** Follow the guide in [DEPLOYMENT.md](DEPLOYMENT.md)

---

*Congratulations on your upcoming wedding! 🎉💍*