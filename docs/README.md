# Documentation Guide

Complete documentation for the Audrey & Josue-Daniel 2026 Wedding Website.

**Current version:** 2.2.0

---

## Documentation Files

### **[PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)** — Start here

Step-by-step production setup:

- Local development with `netlify dev`
- Environment variables
- Brevo email configuration
- Admin dashboard
- Deployment checklist

**Use this for:** First-time setup and going live on Netlify.

---

### **[RSVP_SYSTEM.md](RSVP_SYSTEM.md)** — RSVP management

- Netlify Blob Storage
- Submit / get RSVP functions
- Admin dashboard workflow
- RSVP deadline (closed after May 1, 2026)
- Email confirmations via Brevo

**Use this for:** RSVP storage, admin review, and deadline behavior.

---

### **[EMAIL_SYSTEM.md](EMAIL_SYSTEM.md)** — Email configuration

- Brevo API setup
- Confirmation templates
- Admin approval workflow
- Troubleshooting deliverability

**Use this for:** Email setup and troubleshooting.

---

### **[DEPLOYMENT.md](DEPLOYMENT.md)** — Deployment and hosting

- Netlify deployment
- GitHub integration
- Environment variables on Netlify
- Custom domains, SSL, logs, rollback

**Use this for:** Deploying and operating the live site.

---

### **[SECURITY.md](SECURITY.md)** — Security practices

- API key protection
- Admin authentication
- Input validation and HTTPS

**Use this for:** Securing the site before and after launch.

---

### **[ARCHITECTURE.md](ARCHITECTURE.md)** — Architecture reference

- MVC layout
- Data flow and serverless functions

**Use this for:** Understanding how the codebase is organized.

---

## Quick navigation

| Goal | Document |
|------|----------|
| Set up the project | [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) |
| Understand RSVP storage | [RSVP_SYSTEM.md](RSVP_SYSTEM.md) |
| Configure Brevo | [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md) |
| Deploy to Netlify | [DEPLOYMENT.md](DEPLOYMENT.md) |
| Harden security | [SECURITY.md](SECURITY.md) |

---

## Other resources

- **[README.md](../README.md)** — Project overview and quick start
- **[QUICK_REFERENCE.md](../QUICK_REFERENCE.md)** — Common customization tasks
- **[CHANGELOG.md](../CHANGELOG.md)** — Version history
- **[.github/copilot-instructions.md](../.github/copilot-instructions.md)** — MVC patterns for contributors

---

## Key environment variables

| Variable | Purpose |
|----------|---------|
| `BREVO_API_KEY` | Brevo API authentication |
| `BREVO_FROM_EMAIL` | Verified sender address |
| `ADMIN_EMAIL` | Admin notification recipient |
| `ADMIN_SECRET` | Admin dashboard password |
| `RSVP_DEADLINE` | ISO datetime; blocks new RSVPs after this instant |

---

## Deployment checklist

- [ ] Read [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)
- [ ] Configure all environment variables on Netlify
- [ ] Review [SECURITY.md](SECURITY.md)
- [ ] Run `netlify dev` and test admin dashboard
- [ ] Deploy and verify functions in production
- [ ] Confirm RSVP closed state on `views/rsvp.html` (deadline passed)
- [ ] Test language auto-detect and manual switcher

---

## Support

1. **Build / deploy:** [DEPLOYMENT.md](DEPLOYMENT.md)
2. **RSVP / storage:** [RSVP_SYSTEM.md](RSVP_SYSTEM.md)
3. **Email:** [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md)
4. **Security:** [SECURITY.md](SECURITY.md)

Function logs: Netlify Dashboard → Site → Functions → select function.

---

**Last updated:** May 2026
