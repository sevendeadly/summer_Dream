# Quick Reference Guide

## 🚀 Get Started in 5 Minutes

### 1. Choose Your Version

- **Multi-Page MVC** (Recommended): Traditional website, easy to customize
- **React SPA**: Single-page app, if you know React

See [VERSIONS.md](VERSIONS.md) for comparison.

### 2. Customize Configuration

Edit `models/config.js`:

```javascript
// Wedding date
export const WEDDING_DATE = new Date('2026-06-12T16:00:00').getTime();

// Payment links
export const PAYMENT_LINKS = {
    paypal: 'https://paypal.me/yourname',
    wise: 'https://wise.com/pay/me/yourname',
    wero: 'wero://pay?to=yourphone'
};
```

### 3. Update Content

Edit files in `views/` folder:

- `index.html` - Names, wedding date display
- `info.html` - Venue, schedule, hotels
- `gift.html` - Bank details, wishlist
- `rsvp.html` - RSVP deadline

### 4. Test Locally

```bash
python -m http.server 8000
# Visit: http://localhost:8000/views/
```

### 5. Deploy

```bash
git add .
git commit -m "Customize wedding website"
git push origin main
```

Enable GitHub Pages in Settings → Pages.

## 📁 File Quick Reference

### Need to Change

#### Wedding Date

📄 `models/config.js` → `WEDDING_DATE`

#### Names

📄 `views/index.html` → Update `<h1>` tags

#### Payment Links

📄 `models/config.js` → `PAYMENT_LINKS`

#### Venue Info

📄 `views/info.html` → Update venue section

#### Bank Details

📄 `views/gift.html` → Update bank transfer section

#### Color Theme

🎨 Click theme switcher button in footer
📄 Or edit `models/config.js` → `THEME_PALETTES`

#### RSVP Settings

📄 `views/rsvp.html` → Update deadline
📄 `models/config.js` → `NOTION_CONFIG` (see Security guide)

#### Album Links (After Wedding)

📄 `models/config.js` → `ALBUM_LINKS`

## 🎨 Theme Switcher

### Use It

Click "🎨 Switch Theme" button in footer

### Customize Themes

Edit `models/config.js`:

```javascript
export const THEME_PALETTES = {
    myTheme: {
        name: 'My Custom Theme',
        primary: '#yourcolor',
        secondary: '#yourcolor',
        // ... other colors
    }
};
```

## 🔧 Common Tasks

### Add a New Page

1. Create `views/newpage.html`
2. Copy structure from existing page
3. Update navigation links in all pages
4. Create controller if needed

### Change Colors

- Use theme switcher button (easiest)
- Edit `models/config.js` → `THEME_PALETTES`
- Or edit `assets/css/styles.css` directly

### Update Photos (After Wedding)

1. Upload photos to Lightroom/Google Photos
2. Get shareable links
3. Update `models/config.js` → `ALBUM_LINKS`

### Setup RSVP with Notion

See [docs/NOTION_INTEGRATION.md](docs/NOTION_INTEGRATION.md)

**⚠️ Security:** Use serverless functions (see [docs/SECURITY.md](docs/SECURITY.md))

## 🐛 Troubleshooting

### Modules Not Loading

**Error:** "Cannot use import statement outside a module"

**Fix:**

1. Use web server (not file://)
2. Check `<script type="module" src="../app.js">`

### Theme Not Working

**Fix:**

1. Check console for errors
2. Clear browser cache
3. Verify CSS file loaded

### Navigation Not Working

**Fix:**

1. Verify files in `views/` directory
2. Check relative paths are correct
3. Use web server for testing

### RSVP Not Submitting

**Fix:**

1. Check Notion configuration
2. See console for errors
3. Review [docs/SECURITY.md](docs/SECURITY.md)

## 📚 Documentation Index

### Getting Started

- **README.md** - Main documentation, features, setup
- **docs/QUICKSTART.md** - Quick start guide
- **VERSIONS.md** - Choose your version

### Understanding Structure

- **STRUCTURE.md** - MVC architecture explained
- **PROJECT_SUMMARY.md** - Complete overview

### Deployment & Setup

- **docs/DEPLOYMENT.md** - GitHub Pages deployment
- **docs/NOTION_INTEGRATION.md** - RSVP setup
- **docs/SECURITY.md** - Security best practices

### Migration

- **MIGRATION.md** - Upgrade from old structure
- **legacy/README.md** - About archived files

## 🎯 Essential Commands

### Local Testing

```bash
# Python
python -m http.server 8000

# Node.js
npx serve

# Visit
http://localhost:8000/views/
```

### Git Commands

```bash
# Status
git status

# Stage all changes
git add .

# Commit
git commit -m "Your message"

# Push
git push origin main

# View changes
git diff
```

### Check Structure

```bash
# List files
tree -L 2

# Check specific directory
ls -la views/
```

## ⚡ Quick Tips

1. **Always use web server** - ES6 modules require it
2. **Theme persists** - Choice saved in localStorage
3. **Test on mobile** - Use browser dev tools
4. **Keep API keys secure** - Never in client code
5. **Backup first** - Before major changes
6. **Read docs** - Comprehensive guides available
7. **Start simple** - Customize gradually
8. **Test frequently** - After each change

## 🎁 Features at a Glance

| Feature | Location | Customize |
|---------|----------|-----------|
| Countdown | `controllers/countdown.js` | `models/config.js` |
| Theme Switcher | `controllers/theme.js` | `models/config.js` |
| RSVP Form | `controllers/rsvp.js` | `views/rsvp.html` |
| Payment Links | `controllers/payment.js` | `models/config.js` |
| Albums | `controllers/albums.js` | `models/config.js` |
| Styles | `assets/css/styles.css` | Theme switcher |

## 📞 Need More Help?

### Read Documentation

Start with `README.md`, then check specific guides in `docs/`

### Check Examples

Look at `legacy/` folder for old code examples

### Common Issues

See Troubleshooting section above

### Structure Questions

Read `STRUCTURE.md` for architecture details

### Security Concerns

Read `docs/SECURITY.md` for best practices

## ✅ Pre-Deployment Checklist

- [ ] Updated `models/config.js`
- [ ] Customized `views/*.html` content
- [ ] Chose color theme
- [ ] Tested locally with web server
- [ ] Verified all pages work
- [ ] Tested on mobile
- [ ] Checked RSVP form
- [ ] Reviewed security (no real API keys)
- [ ] Ready to push!

## 🎉 You're Ready

This quick reference covers the essentials. For detailed information, see the full documentation files.

**Happy wedding planning! 💍**

---

**Made with ❤️ for Audrey & Josue-Daniel 2026**
