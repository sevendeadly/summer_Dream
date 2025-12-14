# Audrey & Josue-Daniel 2026 Wedding Website

A lightweight, simple, and beautiful wedding website with countdown timer, RSVP form, gift pot, and photo albums. Now with a clean MVC (Model-View-Controller) architecture for better organization and maintainability.

## 🎉 Wedding Date: June 12, 2026

## 🎁 Two Versions Available

This repository includes **two complete versions** of the wedding website:

1. **Multi-Page MVC Version** (Recommended) - Traditional multi-page site with clean architecture
2. **React SPA Version** - Single-page React application

**📊 [See detailed comparison →](VERSIONS.md)** to choose the best version for you.

**TL;DR:** If you're unsure, use the **Multi-Page MVC Version** - it's easier to customize and maintain.

## ✨ Features

- **Home Page** - Elegant landing page with countdown timer to the big day
- **Wedding Info** - Venue details, schedule, dress code, accommodations, and FAQ
- **Gift Pot** - Multiple payment options (PayPal, Wise, Bank Transfer, Wero) and wishlist
- **RSVP Form** - Easy RSVP with optional Notion integration
- **Albums** - Photo gallery (automatically hidden until after June 12, 2026)
- **3 Color Palettes** - Easy theme switching using CSS variables
- **Fully Responsive** - Looks great on all devices
- **Lightweight** - No frameworks, pure HTML/CSS/JavaScript with ES6 modules
- **MVC Architecture** - Clean separation of concerns for easy maintenance

## 📂 Project Structure (MVC Pattern)

```
summer_Dream/
├── models/                    # Data models and configuration
│   ├── config.js             # Application configuration (payment links, dates, etc.)
│   └── rsvp.js               # RSVP data model with validation
├── views/                    # HTML templates (presentation layer)
│   ├── index.html            # Home page
│   ├── info.html             # Wedding information
│   ├── gift.html             # Gift pot
│   ├── rsvp.html             # RSVP form
│   └── albums.html           # Photo albums
├── controllers/              # Business logic and interaction handling
│   ├── countdown.js          # Countdown timer logic
│   ├── payment.js            # Payment button handling
│   ├── rsvp.js               # RSVP form handling
│   ├── albums.js             # Albums page logic
│   └── utility.js            # Utility functions
├── assets/                   # Static assets
│   └── css/
│       └── styles.css        # All styles with color palette options
├── docs/                     # Documentation
│   ├── DEPLOYMENT.md         # Deployment guide
│   ├── NOTION_INTEGRATION.md # Notion setup guide
│   └── QUICKSTART.md         # Quick start guide
├── app.js                    # Main application entry point
├── index.html                # Root redirector (for backwards compatibility)
└── README.md                 # This file
```

## 🚀 Quick Start

### 1. Customize Your Website

Edit these files to add your personal information:

- **`models/config.js`** - Update wedding date, payment links, and album URLs
- **`views/*.html`** - Update names, venue details, and content
- **`assets/css/styles.css`** - Choose your color palette

### 2. Configure Settings

In `models/config.js`:
```javascript
// Update wedding date
export const WEDDING_DATE = new Date('2026-06-12T15:30:00').getTime();

// Add payment links
export const PAYMENT_LINKS = {
    paypal: 'https://paypal.me/YourID',
    wise: 'https://wise.com/pay/me/YourID',
    wero: 'wero://pay?to=YOUR-PHONE',
};

// Update album links (after wedding)
export const ALBUM_LINKS = {
    ceremony: 'https://your-album-url.com',
    reception: 'https://your-album-url.com',
    couple: 'https://your-album-url.com',
    guests: 'https://your-album-url.com',
};
```

### 3. Choose Your Color Theme

In `assets/css/styles.css`, uncomment one of the 3 color palettes:

- **Palette 1**: Romantic Blush & Gold (default)
- **Palette 2**: Garden Sage & Terracotta
- **Palette 3**: Ocean Blue & Coral

### 4. Deploy to GitHub Pages

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for step-by-step instructions.

Quick version:
```bash
git add .
git commit -m "Customized wedding website"
git push origin main
```

Then enable GitHub Pages in repository Settings → Pages → Select `main` branch.

Your site will be live at: `https://YOUR-USERNAME.github.io/summer_Dream/`

## 🏗️ MVC Architecture Benefits

### Models (`models/`)
- **config.js**: Centralized configuration for easy updates
- **rsvp.js**: Data validation and structure for RSVP submissions

### Views (`views/`)
- Clean HTML templates without embedded logic
- Easy to update content and styling
- Consistent structure across all pages

### Controllers (`controllers/`)
- Separated business logic from presentation
- Reusable components
- Easy to test and maintain
- Clear responsibilities for each controller

### Benefits:
✅ **Better Organization** - Clear separation of concerns  
✅ **Easy Maintenance** - Update configuration in one place  
✅ **Scalability** - Add new features without touching existing code  
✅ **Testability** - Controllers can be tested independently  
✅ **Reusability** - Controllers can be reused across pages  

## 🧪 Testing Locally

Before deploying, test locally using a web server:

```bash
# Using Python
python -m http.server 8000

# Or using Node.js
npx serve

# Visit: http://localhost:8000
```

**Note**: Due to ES6 modules, you must use a web server (not just opening HTML files directly).

## 📱 Generate QR Code

After deployment, create a QR code for your website:

1. Visit [qr-code-generator.com](https://www.qr-code-generator.com/)
2. Enter your GitHub Pages URL
3. Download and add to invitations!

## 🔧 Optional: Notion Integration

To receive RSVP submissions in Notion, see **[docs/NOTION_INTEGRATION.md](docs/NOTION_INTEGRATION.md)** for detailed setup instructions.

Alternatively, use Google Forms for a simpler solution (instructions included in Notion guide).

## 💰 Cost

**$0/year** - Completely free when hosted on GitHub Pages!

Optional costs:
- Custom domain: ~$10-15/year (optional)
- Nothing else needed!

## 🎨 Customization Tips

### Update Payment Links

In `models/config.js`:
```javascript
export const PAYMENT_LINKS = {
    paypal: 'https://paypal.me/YourID',
    wise: 'https://wise.com/pay/me/YourID',
    wero: 'wero://pay?to=YOUR-PHONE',
};
```

### Update Bank Details

In `views/gift.html`, replace placeholders:
```html
[Account Holder Name]
[IBAN Number]
[BIC/SWIFT Code]
[Wero ID/Phone Number]
```

### Change Wedding Date

In `models/config.js`:
```javascript
export const WEDDING_DATE = new Date('2026-06-12T15:30:00').getTime();
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
- Managed by `controllers/countdown.js`

### Albums Page Logic
- **Before June 12, 2026**: Shows "Coming Soon" message with countdown
- **After June 12, 2026**: Displays photo albums with view/download links
- Edit album links in `models/config.js` after wedding
- Managed by `controllers/albums.js`

### RSVP Form
- Shows/hides fields based on attendance selection
- Client-side validation using `models/rsvp.js`
- Optional Notion integration for data storage
- Managed by `controllers/rsvp.js`

### Gift Pot
- Multiple payment options
- Direct bank transfer details
- Wishlist section
- No transaction fees (direct to you)
- Managed by `controllers/payment.js`

## 🔒 Security

- No sensitive data in code
- Payment links are just URLs (no API keys)
- Notion API keys should be in serverless functions (see docs/NOTION_INTEGRATION.md)
- HTTPS automatically enabled by GitHub Pages

## 📊 Analytics (Optional)

Add Google Analytics to track visitors (free):

1. Get tracking ID from [analytics.google.com](https://analytics.google.com)
2. Add code to each HTML file (instructions in docs/DEPLOYMENT.md)

## 🆘 Support & Troubleshooting

Common issues and solutions in **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

## 📝 To-Do Before Going Live

- [ ] Update wedding date in `models/config.js`
- [ ] Add payment links in `models/config.js`
- [ ] Update names and content in `views/*.html`
- [ ] Add venue details in `views/info.html`
- [ ] Add bank details in `views/gift.html`
- [ ] Choose color palette in `assets/css/styles.css`
- [ ] Test all pages locally (use a web server!)
- [ ] Deploy to GitHub Pages
- [ ] Test live website on mobile and desktop
- [ ] Generate QR code
- [ ] Set up Notion integration (optional)
- [ ] Share with guests!

## 🎊 After the Wedding

1. Upload photos to Lightroom/Google Photos/Dropbox
2. Update album links in `models/config.js` (ALBUM_LINKS)
3. Test that albums page displays correctly
4. Let guests know photos are available!

## 🔄 Migrating from Old Structure

If you're updating from the old flat structure:

1. Your old `script.js` has been split into modular controllers
2. Configuration is now in `models/config.js`
3. HTML files are in `views/` directory
4. CSS is in `assets/css/` directory
5. Documentation is in `docs/` directory
6. The root `index.html` redirects to `views/index.html` for backwards compatibility

All functionality remains the same, just better organized!

## 📄 License

This is your personal wedding website. Feel free to modify and use as you wish!

## 🙏 Credits

Made with ❤️ for Audrey & Josue-Daniel 2026  
Restructured with MVC pattern for better maintainability

---

**Questions?** Check out:
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment instructions
- [docs/NOTION_INTEGRATION.md](docs/NOTION_INTEGRATION.md) - RSVP setup guide
- [docs/QUICKSTART.md](docs/QUICKSTART.md) - Quick start guide

**Ready to deploy?** Follow the guide in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

*Congratulations on your upcoming wedding! 🎉💍*
