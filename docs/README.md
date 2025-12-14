# Documentation Guide

Complete documentation for the Audrey & Josue-Daniel 2026 Wedding Website.

---

## 📚 Documentation Files

### **[COMPLETE_SETUP.md](COMPLETE_SETUP.md)** - Start Here ⭐
The master setup guide covering:
- Local development setup
- Configuration files
- Environment variables
- Netlify deployment
- Admin dashboard setup
- Testing checklist
- Troubleshooting

**Use this for:** Complete project setup from scratch

---

### **[RSVP_SYSTEM.md](RSVP_SYSTEM.md)** - RSVP Management
Complete guide to RSVP storage and processing:
- System overview and architecture
- Netlify Blob Storage implementation
- Submit RSVP function reference
- Get RSVPs function reference
- Admin dashboard workflow
- Email confirmation system
- Deployment steps

**Use this for:** Understanding and managing the RSVP system

---

### **[EMAIL_SYSTEM.md](EMAIL_SYSTEM.md)** - Email Configuration
Detailed email sending system documentation:
- SendGrid integration setup
- Email templates
- Admin approval workflow
- Email testing
- Troubleshooting email issues
- Rate limiting
- Email deliverability

**Use this for:** Email configuration and troubleshooting

---

### **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment & Hosting
Deployment procedures and workflows:
- Netlify deployment process
- GitHub integration
- Environment variables on Netlify
- Custom domains
- SSL/HTTPS setup
- Monitoring and logs
- Rollback procedures

**Use this for:** Deploying to production and managing live site

---

### **[SECURITY.md](SECURITY.md)** - Security Best Practices
Security implementation guide:
- API key protection
- Admin authentication
- Data privacy
- CORS configuration
- Input validation
- HTTPS enforcement
- Secrets management

**Use this for:** Securing your wedding website

---

## 🎯 Quick Navigation

### I want to...

**...setup the project for the first time**
→ [COMPLETE_SETUP.md](COMPLETE_SETUP.md)

**...understand how RSVPs are stored**
→ [RSVP_SYSTEM.md](RSVP_SYSTEM.md)

**...configure SendGrid for emails**
→ [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md) or [RSVP_SYSTEM.md](RSVP_SYSTEM.md#email-service-configuration)

**...deploy to Netlify**
→ [DEPLOYMENT.md](DEPLOYMENT.md) or [COMPLETE_SETUP.md](COMPLETE_SETUP.md#deployment-process)

**...make the site more secure**
→ [SECURITY.md](SECURITY.md)

**...troubleshoot a problem**
→ See "Troubleshooting" section in relevant doc

---

## 📂 Other Important Resources

- **Project Instructions:** [.github/copilot-instructions.md](../.github/copilot-instructions.md) - MVC architecture, patterns, conventions
- **Changelog:** [CHANGELOG.md](../CHANGELOG.md) - Version history and updates
- **Code:** Check `controllers/`, `models/`, `views/` folders for implementation

---

## 🔑 Key Environment Variables

All Netlify environment variables used in the project:

| Variable | Purpose | Example |
|----------|---------|---------|
| `SENDGRID_API_KEY` | SendGrid authentication | `SG.xxxxx...` |
| `SENDGRID_FROM_EMAIL` | Sender email address | `noreply@yourwedding.com` |
| `ADMIN_EMAIL` | Admin notification email | `your-email@example.com` |
| `ADMIN_SECRET` | Admin dashboard password | `strong-32-char-password` |

---

## 🚀 Deployment Checklist

Before going live:

- [ ] Read [COMPLETE_SETUP.md](COMPLETE_SETUP.md)
- [ ] Configure all environment variables
- [ ] Review [SECURITY.md](SECURITY.md)
- [ ] Test RSVP workflow locally
- [ ] Deploy to Netlify
- [ ] Test all functions in production
- [ ] Verify emails send correctly
- [ ] Test admin dashboard
- [ ] Share website with guests

---

## 📧 Support

### For Issues:

1. **Build/Deployment:** See [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting)
2. **RSVP/Storage:** See [RSVP_SYSTEM.md](RSVP_SYSTEM.md#troubleshooting)
3. **Email Problems:** See [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md#troubleshooting)
4. **Security Concerns:** See [SECURITY.md](SECURITY.md)

### Check Function Logs:

1. Go to Netlify Dashboard
2. Site → Functions → Select function
3. View logs and errors

---

## 🎉 Version History

Current Version: **2.1.0**

See [CHANGELOG.md](../CHANGELOG.md) for detailed version history and updates.

---

**Last Updated:** December 14, 2025

Made with ❤️ for J-D & A-N's Special Day
