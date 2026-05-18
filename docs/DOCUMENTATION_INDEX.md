# Documentation Index

## Overview

This document provides a comprehensive index of all documentation available for the wedding website project. Use this as a starting point to find the information you need.

---

## 📚 Main Documentation

### [README.md](../README.md)
**Purpose:** Main project documentation and overview  
**Audience:** Everyone  
**Contents:**
- Project overview and features
- Quick start guide
- Project structure
- Key components explanation
- Customization guide
- Troubleshooting

**Start here if:** You're new to the project or want a high-level overview.

---

## 🏗️ Architecture & Design

### [ARCHITECTURE.md](ARCHITECTURE.md)
**Purpose:** Detailed architecture documentation  
**Audience:** Developers, maintainers  
**Contents:**
- MVC pattern explanation
- Project structure details
- Data flow diagrams
- Communication patterns
- State management
- Security architecture
- Error handling
- Best practices
- Extending the architecture

**Start here if:** You want to understand how the code is organized or need to extend functionality.

---

## 🚀 Setup & Deployment

### [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)
**Purpose:** Step-by-step production setup guide  
**Audience:** Administrators, developers  
**Contents:**
- Prerequisites
- Environment variable setup
- Brevo configuration
- Netlify deployment
- Testing procedures
- Troubleshooting
- Security best practices
- Maintenance tasks

**Start here if:** You're setting up the website for the first time or deploying to production.

### [COMPLETE_SETUP.md](COMPLETE_SETUP.md)
**Purpose:** Comprehensive setup guide (legacy, but still useful)  
**Audience:** Developers  
**Contents:**
- Detailed setup instructions
- Configuration file explanations
- Environment variables
- Netlify Functions setup
- RSVP storage system
- Email service configuration

**Start here if:** You need detailed technical setup information.

### [DEPLOYMENT.md](DEPLOYMENT.md)
**Purpose:** Deployment-specific instructions  
**Audience:** Administrators  
**Contents:**
- Deployment process
- Netlify configuration
- Environment variable setup
- Post-deployment verification

**Start here if:** You're ready to deploy and need deployment-specific steps.

---

## 📧 Email System

### [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md)
**Purpose:** Email system documentation  
**Audience:** Administrators, developers  
**Contents:**
- Brevo setup
- Email template structure
- Template customization
- Email workflow
- Troubleshooting email issues

**Start here if:** You need to configure or troubleshoot the email system.

---

## 📋 RSVP System

### [RSVP_SYSTEM.md](RSVP_SYSTEM.md)
**Purpose:** RSVP system documentation  
**Audience:** Administrators, developers  
**Contents:**
- RSVP workflow
- Admin dashboard usage
- Data storage
- Status management

**Start here if:** You need to understand or use the RSVP system.

---

## 🔒 Security

### [SECURITY.md](SECURITY.md)
**Purpose:** Security best practices and guidelines  
**Audience:** Administrators, developers  
**Contents:**
- Security architecture
- Authentication
- Data protection
- Best practices
- Common vulnerabilities

**Start here if:** You need security information or are reviewing security practices.

---

## 📝 Code Documentation

### Inline Comments
**Location:** Throughout codebase  
**Purpose:** Explain code logic and decisions  
**Files with extensive comments:**
- `app.js` - Application bootstrap
- `controllers/netlify-func/send-confirmation.js` - Email sending
- `controllers/netlify-func/submit-rsvp.js` - RSVP submission
- `controllers/admin.js` - Admin dashboard
- `models/config.js` - Configuration
- `models/rsvp.js` - RSVP data model

**Start here if:** You're reading or modifying code.

---

## 📊 Project Information

### [CHANGELOG.md](../CHANGELOG.md)
**Purpose:** Version history and changes  
**Audience:** Everyone  
**Contents:**
- Version history
- Feature additions
- Bug fixes
- Breaking changes

**Start here if:** You want to know what's changed between versions.

### [PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md)
**Purpose:** Project overview and summary  
**Audience:** Everyone  
**Contents:**
- Project overview
- Architecture changes
- Features
- Statistics

**Start here if:** You want a project summary or overview.

---

## 🎯 Quick Reference

### [QUICK_REFERENCE.md](../QUICK_REFERENCE.md)
**Purpose:** Quick reference guide  
**Audience:** Developers, administrators  
**Contents:**
- Common tasks
- File locations
- Configuration options
- Troubleshooting tips

**Start here if:** You need quick answers to common questions.

---

## 📖 Documentation by Task

### I want to...

**Set up the website for the first time:**
1. Read [README.md](../README.md) for overview
2. Follow [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) step-by-step

**Understand the code structure:**
1. Read [ARCHITECTURE.md](ARCHITECTURE.md)
2. Review inline comments in code files

**Deploy to production:**
1. Follow [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)
2. Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment-specific steps

**Configure email system:**
1. Read [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md)
2. Follow Brevo setup in [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)

**Use the admin dashboard:**
1. Read [RSVP_SYSTEM.md](RSVP_SYSTEM.md)
2. Check admin dashboard section in [README.md](../README.md)

**Customize the website:**
1. Read customization section in [README.md](../README.md)
2. Edit `models/config.js` for configuration
3. Edit HTML files in `views/` for content

**Troubleshoot issues:**
1. Check troubleshooting section in relevant guide
2. Review [QUICK_REFERENCE.md](../QUICK_REFERENCE.md)
3. Check function logs in Netlify dashboard

**Extend functionality:**
1. Read [ARCHITECTURE.md](ARCHITECTURE.md) for extension patterns
2. Review existing controllers for examples
3. Follow MVC pattern

---

## 📁 File Locations

### Documentation Files
- `README.md` - Main documentation (root)
- `CHANGELOG.md` - Version history (root)
- `PROJECT_SUMMARY.md` - Project summary (root)
- `QUICK_REFERENCE.md` - Quick reference (root)
- `docs/ARCHITECTURE.md` - Architecture guide
- `docs/PRODUCTION_SETUP.md` - Setup guide
- `docs/EMAIL_SYSTEM.md` - Email documentation
- `docs/RSVP_SYSTEM.md` - RSVP documentation
- `docs/SECURITY.md` - Security guide
- `docs/COMPLETE_SETUP.md` - Detailed setup
- `docs/DEPLOYMENT.md` - Deployment guide

### Configuration Files
- `models/config.js` - Main configuration
- `models/rsvp.js` - RSVP data model
- `netlify.toml` - Netlify configuration
- `.env.example` - Environment variables template
- `package.json` - Dependencies

### Code Files
- `app.js` - Application bootstrap
- `controllers/` - All controllers
- `controllers/netlify-func/` - Serverless functions
- `views/` - HTML templates
- `assets/css/styles.css` - All styles

---

## 🎓 Learning Path

### For New Developers

1. **Start Here:**
   - Read [README.md](../README.md)
   - Review [ARCHITECTURE.md](ARCHITECTURE.md)

2. **Understand the Code:**
   - Read `app.js` with comments
   - Review one controller (e.g., `countdown.js`)
   - Review one model (e.g., `rsvp.js`)

3. **Understand the System:**
   - Read [RSVP_SYSTEM.md](RSVP_SYSTEM.md)
   - Read [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md)

4. **Practice:**
   - Make a small customization
   - Test locally
   - Deploy to staging

### For Administrators

1. **Setup:**
   - Follow [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)
   - Configure environment variables
   - Test all features

2. **Daily Use:**
   - Use admin dashboard (see [RSVP_SYSTEM.md](RSVP_SYSTEM.md))
   - Monitor RSVPs
   - Send confirmations

3. **Maintenance:**
   - Check [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) maintenance section
   - Monitor email deliverability
   - Update content as needed

---

## 🔍 Finding Information

### By Topic

**Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)  
**Setup:** [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)  
**Email:** [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md)  
**RSVP:** [RSVP_SYSTEM.md](RSVP_SYSTEM.md)  
**Security:** [SECURITY.md](SECURITY.md)  
**Deployment:** [DEPLOYMENT.md](DEPLOYMENT.md)  
**Troubleshooting:** [QUICK_REFERENCE.md](../QUICK_REFERENCE.md)

### By File Type

**Configuration:** `models/config.js`, `netlify.toml`  
**Code:** `controllers/`, `models/`, `app.js`  
**Templates:** `views/`  
**Styles:** `assets/css/styles.css`  
**Functions:** `controllers/netlify-func/`

---

## 📞 Getting Help

1. **Check Documentation:**
   - Review relevant guide
   - Check troubleshooting sections
   - Review inline code comments

2. **Check Logs:**
   - Netlify function logs
   - Browser console
   - Brevo transactional activity logs

3. **Review Code:**
   - Check inline comments
   - Review similar implementations
   - Follow MVC patterns

---

## ✅ Documentation Status

- ✅ Production README
- ✅ Architecture documentation
- ✅ Setup guides
- ✅ Email system documentation
- ✅ RSVP system documentation
- ✅ Security guide
- ✅ Inline code comments
- ✅ CHANGELOG
- ✅ Quick reference

**All documentation is up-to-date for production release v2.1.0**

---

*Last updated: January 2026*
