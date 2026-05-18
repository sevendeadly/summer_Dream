# Quick Reference Guide

**Version:** 2.2.0

## Get started in 5 minutes

### 1. Customize configuration

Edit `models/config.js`:

```javascript
export const WEDDING_DATE = new Date('2026-06-12T16:00:00').getTime();
export const RSVP_DEADLINE_ISO = '2026-05-01T23:59:59.999+02:00';

export const PAYMENT_LINKS = {
    paypal: 'https://paypal.me/yourname',
    wise: 'https://wise.com/pay/me/yourname',
    wero: 'wero://pay?to=yourphone'
};
```

### 2. Update content

Edit files in `views/`:

| File | What to change |
|------|----------------|
| `index.html` | Names, hero copy |
| `info.html` | Venue, schedule, hotels |
| `gift.html` | Bank details (if enabled) |
| `rsvp.html` | Closed-state copy (form auto-hidden after deadline) |

### 3. Test locally

```bash
npm install
netlify dev
```

Visit the URL shown in the terminal (static files + Netlify functions).

### 4. Deploy

Push to GitHub; Netlify builds and deploys automatically if connected.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and [docs/PRODUCTION_SETUP.md](docs/PRODUCTION_SETUP.md).

---

## File quick reference

| Task | Location |
|------|----------|
| Wedding date | `models/config.js` → `WEDDING_DATE` |
| RSVP deadline | `models/config.js` → `RSVP_DEADLINE_ISO` |
| Payment links | `models/config.js` → `PAYMENT_LINKS` |
| Album links | `models/config.js` → `ALBUM_LINKS` |
| Themes | `models/config.js` → `THEME_PALETTES` |
| Translations | `controllers/language.js` |
| Locale detection | `controllers/i18n.js` |
| RSVP form logic | `controllers/rsvp_form.js` |
| Submit API | `controllers/netlify-func/submit-rsvp.js` |
| Admin dashboard | `controllers/admin.js` |
| Styles | `assets/css/styles.css` |

---

## RSVP (v2.2.0)

- **Deadline:** May 1, 2026 — form hidden and API returns 403 after that date
- **Override:** Set `RSVP_DEADLINE` in Netlify environment variables
- **Admin:** `views/admin_dashboard.html` still manages existing RSVPs

---

## Internationalization

- **Locales:** English (`en`), French (`fr`), German (`de`)
- **Auto-detect:** First visit uses `navigator.languages` (France, USA, Canada, Cameroon, Germany)
- **Override:** Language switcher in the navbar; choice stored in `localStorage`
- **Markup:** `data-i18n="section.key"` and `data-i18n-placeholder="section.field"`

---

## Theme switcher

Click the theme control in the UI, or edit `THEME_PALETTES` in `models/config.js`.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Overview and features |
| [docs/README.md](docs/README.md) | Documentation index |
| [docs/PRODUCTION_SETUP.md](docs/PRODUCTION_SETUP.md) | Full production setup |
| [docs/RSVP_SYSTEM.md](docs/RSVP_SYSTEM.md) | RSVP and blobs |
| [docs/EMAIL_SYSTEM.md](docs/EMAIL_SYSTEM.md) | Brevo email |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Netlify deployment |
| [docs/SECURITY.md](docs/SECURITY.md) | Security practices |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | MVC architecture |
| [CHANGELOG.md](CHANGELOG.md) | Version history |

---

## Essential commands

```bash
# Local dev (functions + site)
netlify dev

# Install dependencies
npm install

# Git
git status
git add .
git commit -m "Your message"
git push origin main
```

---

## Pre-deployment checklist

- [ ] Updated `models/config.js` (date, payments, RSVP deadline if needed)
- [ ] Customized `views/*.html` content
- [ ] Netlify env vars set (Brevo, `ADMIN_SECRET`, optional `RSVP_DEADLINE`)
- [ ] Tested with `netlify dev`
- [ ] Verified RSVP closed message (deadline passed)
- [ ] Tested language auto-detect and switcher
- [ ] Tested admin dashboard in production

---

**Made with ❤️ for Audrey & Josue-Daniel 2026**
