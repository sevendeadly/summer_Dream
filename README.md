# J-D & A-N Wedding Website - Production Release v2.1.0

> A modern, full-featured wedding website with RSVP management, email confirmations, admin dashboard, and multi-language support. Built with clean MVC architecture and deployed on Netlify.

## 🎉 Overview

This is a production-ready wedding website featuring a complete RSVP system with email confirmations, an admin dashboard for managing guest responses, and a beautiful, responsive design. The system uses Netlify Blobs for data storage and Brevo for email delivery.

**Wedding Date:** June 12, 2026  
**Version:** 2.1.0 (Production Release)  
**Architecture:** MVC (Model-View-Controller)  
**Deployment:** Netlify

---

## ✨ Features

### Core Features
- **🏠 Home Page** - Elegant landing page with real-time countdown timer
- **📋 Wedding Info** - Comprehensive venue details, schedule, dress code, and FAQ
- **🎁 Gift Registry** - Multiple payment options (PayPal, Wise, Bank Transfer, Wero)
- **✉️ RSVP System** - Complete RSVP management with email confirmations
- **📸 Photo Albums** - Date-based visibility (hidden until after wedding)
- **🎨 Theme System** - 3 color palettes with persistent theme switching
- **🌐 Multi-Language** - Internationalization support (English/French)
- **📱 Fully Responsive** - Optimized for all devices

### RSVP & Admin Features
- **📝 RSVP Form** - Guest-friendly form with validation
- **💾 Data Storage** - Netlify Blobs for reliable data persistence
- **📧 Email Confirmations** - Automated emails via Brevo
  - Accepted template (when admin approves)
  - Declined template (when guest declines)
  - Admin-declined template (with optional reason)
- **👤 Admin Dashboard** - Complete RSVP management interface
  - View all RSVPs with filtering and search
  - Approve/decline RSVPs with custom messages
  - Real-time statistics (total RSVPs, pending, approved guests count)
  - Auto-refresh every 5 minutes
  - Configurable rows per page (25, 50, 100)
  - Pagination support

### Technical Features
- **🏗️ MVC Architecture** - Clean separation of concerns
- **⚡ Serverless Functions** - Netlify Functions for backend operations
- **🔒 Security** - Admin authentication with secret-based access
- **📦 Modular Code** - ES6 modules with clear organization
- **🎯 Zero Dependencies** - Pure JavaScript (except Netlify/Brevo SDKs)

---

## 📂 Project Structure

```
summer_Dream/
├── models/                      # Data models and configuration
│   ├── config.js               # Application configuration
│   └── rsvp.js                 # RSVP data model with validation
│
├── views/                       # HTML templates (presentation layer)
│   ├── index.html              # Home page with countdown
│   ├── info.html               # Wedding information
│   ├── gift.html               # Gift registry
│   ├── rsvp.html               # RSVP form
│   ├── albums.html             # Photo albums
│   └── admin_dashboard.html     # Admin management interface
│
├── controllers/                 # Business logic (client-side)
│   ├── countdown.js            # Countdown timer logic
│   ├── payment.js              # Payment button handling
│   ├── rsvp_form.js            # RSVP form controller
│   ├── albums.js               # Albums page logic
│   ├── theme.js                # Theme switching
│   ├── language.js             # Internationalization
│   ├── info.js                 # Info page controller
│   ├── admin.js                # Admin dashboard controller
│   ├── utility.js              # Utility functions
│   └── netlify-func/           # Serverless functions (backend)
│       ├── submit-rsvp.js      # RSVP submission handler
│       ├── get-rsvps.js        # RSVP retrieval for admin
│       └── send-confirmation.js # Email sending handler
│
├── assets/                      # Static assets
│   ├── css/
│   │   └── styles.css          # All styles with theme variables
│   └── images/                 # Image assets
│
├── docs/                        # Documentation
│   ├── COMPLETE_SETUP.md       # Complete setup guide
│   ├── DEPLOYMENT.md           # Deployment instructions
│   ├── EMAIL_SYSTEM.md         # Email system documentation
│   ├── RSVP_SYSTEM.md          # RSVP system guide
│   └── SECURITY.md             # Security best practices
│
├── app.js                       # Main application entry point
├── netlify.toml                 # Netlify configuration
├── package.json                 # Dependencies
└── README.md                    # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (for local development)
- Netlify account (for deployment)
- Brevo account (for email delivery)
- Git (for version control)

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd summer_Dream

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env` file (see `.env.example` for template):

```bash
# Brevo Configuration
BREVO_API_KEY=your_brevo_api_key
BREVO_FROM_EMAIL=noreply@yourdomain.com

# Admin Security
ADMIN_SECRET=your_secure_admin_secret

# Optional: For local development
NETLIFY_SITE_ID=your_site_id
NETLIFY_AUTH_TOKEN=your_auth_token
```

### 3. Customize Configuration

Edit `models/config.js`:
- Update wedding date and time
- Add payment links (PayPal, Wise, Wero)
- Configure album links (after wedding)
- Customize theme palettes

### 4. Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

Or connect your GitHub repository to Netlify for automatic deployments.

### 5. Set Environment Variables in Netlify

1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add all variables from your `.env` file
3. Redeploy if needed

---

## 📖 Detailed Documentation

### Setup Guides
- **[Complete Setup Guide](docs/COMPLETE_SETUP.md)** - Step-by-step setup instructions
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Detailed deployment walkthrough
- **[Email System Guide](docs/EMAIL_SYSTEM.md)** - Brevo configuration and email templates
- **[RSVP System Guide](docs/RSVP_SYSTEM.md)** - RSVP workflow and admin dashboard usage

### Architecture
- **[MVC Architecture](docs/ARCHITECTURE.md)** - Detailed architecture explanation
- **[Security Guide](docs/SECURITY.md)** - Security best practices

---

## 🎯 Key Components Explained

### Models (`models/`)

**config.js** - Central configuration file
- Payment links (PayPal, Wise, Wero)
- Wedding date and time
- Album links (for post-wedding)
- Theme palette definitions

**rsvp.js** - RSVP data model
- Data validation (name, email, attendance)
- Data structure definition
- JSON serialization for API submission

### Views (`views/`)

All HTML templates follow a consistent structure:
- Navigation bar with theme switcher
- Page-specific content
- Footer with copyright
- Language switcher (where applicable)

### Controllers (`controllers/`)

**Client-Side Controllers:**
- `countdown.js` - Real-time countdown timer updates
- `payment.js` - Payment button click handlers
- `rsvp_form.js` - RSVP form submission and validation
- `albums.js` - Albums page date-based visibility
- `theme.js` - Theme switching with localStorage
- `language.js` - Internationalization handling
- `admin.js` - Admin dashboard functionality
- `info.js` - Info page interactions
- `utility.js` - Shared utility functions

**Serverless Functions (`controllers/netlify-func/`):**
- `submit-rsvp.js` - Handles RSVP form submissions, stores in Netlify Blobs
- `get-rsvps.js` - Retrieves all RSVPs for admin dashboard (with authentication)
- `send-confirmation.js` - Sends email confirmations via Brevo

---

## 🔐 Security

### Admin Authentication
- Secret-based authentication via `X-Admin-Secret` header
- Base64 encoding support for non-ASCII characters
- Environment variable storage (never in code)

### Data Protection
- All sensitive data in environment variables
- No API keys in client-side code
- HTTPS enforced by Netlify
- Input validation and sanitization

See **[Security Guide](docs/SECURITY.md)** for detailed information.

---

## 📧 Email System

### Email Templates

1. **Accepted Template** - Sent when admin approves RSVP
   - Includes RSVP details
   - Wedding information
   - Optional admin personal message
   - Venue limitation notice (children under 13)

2. **Declined Template** - Sent when guest declines
   - Thank you message
   - Guest's original message (if provided)

3. **Admin-Declined Template** - Sent when admin declines a guest who wanted to attend
   - Explains the situation
   - Optional reason from admin
   - Apologetic tone

### Email Flow

```
Guest submits RSVP
    ↓
Stored in Netlify Blobs (status: pending)
    ↓
Admin reviews in dashboard
    ↓
Admin approves/declines
    ↓
Email sent via Brevo
    ↓
RSVP status updated in storage
```

See **[Email System Guide](docs/EMAIL_SYSTEM.md)** for detailed configuration.

---

## 👤 Admin Dashboard

### Features
- **Authentication** - Secret-based login
- **RSVP Management** - View, approve, decline RSVPs
- **Filtering** - Filter by status, attendance, search by name/email
- **Statistics** - Real-time counts:
  - Total RSVPs
  - Pending reviews
  - Approved attending guests (total count)
- **Pagination** - Configurable rows per page (25, 50, 100)
- **Auto-Refresh** - Updates every 5 minutes automatically
- **Custom Messages** - Add personal messages when approving/declining

### Access
Navigate to `/views/admin_dashboard.html` or use the admin button in navigation.

---

## 🎨 Customization

### Theme Customization

Edit `models/config.js` to modify theme palettes:

```javascript
export const THEME_PALETTES = {
    palette1: {
        primary: '#d4a5a5',
        secondary: '#c9a86a',
        // ... other colors
    }
};
```

### Content Customization

- **Wedding Info**: Edit `views/info.html`
- **Gift Registry**: Edit `views/gift.html`
- **RSVP Form**: Edit `views/rsvp.html`
- **Home Page**: Edit `views/index.html`

### Styling

All styles in `assets/css/styles.css` use CSS variables for easy theming.

---

## 🧪 Testing

### Local Development

```bash
# Start Netlify Dev (recommended)
netlify dev

# Or use a simple HTTP server
python -m http.server 8000
# Visit http://localhost:8000
```

**Important:** ES6 modules require a web server (not `file://` protocol).

### Testing Checklist

- [ ] Countdown timer displays correctly
- [ ] RSVP form validation works
- [ ] RSVP submission succeeds
- [ ] Admin dashboard loads
- [ ] Admin can approve/decline RSVPs
- [ ] Email confirmations are sent
- [ ] Theme switching works
- [ ] Language switching works
- [ ] All pages are responsive
- [ ] Payment buttons work

---

## 📊 Production Checklist

Before going live:

- [ ] Update wedding date in `models/config.js`
- [ ] Add payment links in `models/config.js`
- [ ] Update names and content in `views/*.html`
- [ ] Configure Brevo API key
- [ ] Set secure `ADMIN_SECRET`
- [ ] Test RSVP submission flow
- [ ] Test admin dashboard
- [ ] Test email delivery
- [ ] Verify all environment variables in Netlify
- [ ] Test on mobile devices
- [ ] Generate QR code for invitations
- [ ] Test language switching
- [ ] Verify theme switching works

---

## 🐛 Troubleshooting

### Common Issues

**RSVP submissions fail:**
- Check Netlify function logs
- Verify Netlify Blobs is enabled
- Check environment variables

**Emails not sending:**
- Verify Brevo API key
- Check Brevo account status
- Review function logs for errors

**Admin dashboard not loading:**
- Verify `ADMIN_SECRET` is set
- Check browser console for errors
- Ensure admin secret matches

**Theme not persisting:**
- Check browser localStorage support
- Clear cache and try again

See documentation in `docs/` for more troubleshooting help.

---

## 📝 Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

**Current Version:** 2.1.0 (Production Release)

### Recent Updates
- Complete RSVP system with email confirmations
- Admin dashboard with auto-refresh
- Multi-language support
- Enhanced email templates
- Children under 13 limitation notice
- Configurable rows per page in admin dashboard

---

## 🤝 Contributing

This is a personal wedding website project. For questions or suggestions, please open an issue.

---

## 📄 License

This project is for personal use. Feel free to use and modify for your own wedding website.

---

## 🙏 Credits

Made with ❤️ for J-D & A-N's special day  
Built with modern web technologies and best practices

---

## 📞 Support

For detailed guides and documentation:
- [Complete Setup Guide](docs/COMPLETE_SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Email System Guide](docs/EMAIL_SYSTEM.md)
- [RSVP System Guide](docs/RSVP_SYSTEM.md)
- [Security Guide](docs/SECURITY.md)

---

**Congratulations on your upcoming wedding! 🎉💍**

*This is a production-ready release. All features are fully implemented and tested.*
