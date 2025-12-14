# SendGrid Setup & FAQ

## 🎯 Quick Answer: What is EMAIL_USER?

**With SendGrid API: `EMAIL_USER` doesn't exist.**

### Environment Variables

| Service | AUTH Method | Variables |
|---------|------------|-----------|
| **Gmail SMTP** | Username + Password | `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` |
| **SendGrid API** | API Token Only | `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` |

**SendGrid doesn't use:**
- `EMAIL_HOST` ❌
- `EMAIL_PORT` ❌
- `EMAIL_USER` ❌ (Not applicable - you use API key instead)
- `EMAIL_PASS` ❌

**SendGrid uses:**
- `SENDGRID_API_KEY` ✅ (Your authentication token)
- `SENDGRID_FROM_EMAIL` ✅ (Which email sends the message)

---

## 🚀 5-Minute Setup

### Step 1: Create SendGrid Account
```bash
Visit: https://sendgrid.com/free
Sign up with email
Verify email address
```

### Step 2: Get API Key
```bash
Dashboard → Settings → API Keys
Click "Create API Key"
Name it: "Wedding Website"
Select: "Full Access" or "Mail Send"
Copy key (starts with SG.)
⚠️ Save immediately - won't show again!
```

### Step 3: Verify Sender Email
```bash
Dashboard → Settings → Sender Authentication
Click "Add Sender" or "Verify Single Sender"
Enter email: noreply@yourwedding.com (or your email)
Click verification link in email
✅ Now you can send from this email
```

### Step 4: Create .env File
```bash
cd /workspaces/summer_Dream
cp .env.example .env

# Edit .env with your values:
# SENDGRID_API_KEY=SG.xxxxx...
# SENDGRID_FROM_EMAIL=noreply@yourwedding.com
# ADMIN_EMAIL=your-email@example.com
# NOTION_API_KEY=secret_xxxxx
# NOTION_DATABASE_ID=xxxxx
# ADMIN_SECRET=strong-password
```

### Step 5: Deploy to Netlify
```bash
Netlify Dashboard → Site settings → Environment variables
Add these:
  SENDGRID_API_KEY: SG.xxxxx...
  SENDGRID_FROM_EMAIL: noreply@yourwedding.com
  ADMIN_EMAIL: your-email@example.com
  NOTION_API_KEY: secret_xxxxx
  NOTION_DATABASE_ID: xxxxx
  ADMIN_SECRET: strong-password

Save → Trigger redeploy
```

**Done! ✨**

---

## ❓ FAQ

### Q: What's the difference between SENDGRID_API_KEY and EMAIL_USER?

**A:**
- `EMAIL_USER` = Your email address (Gmail SMTP method) ← NOT used with SendGrid
- `SENDGRID_API_KEY` = Your authentication token (SendGrid API method) ← USE THIS
- `SENDGRID_FROM_EMAIL` = Which email sends messages (must be verified in SendGrid)

### Q: Can I use my Gmail with SendGrid?

**A:** SendGrid is better than Gmail because:
- ✅ 100 free emails/day (Gmail SMTP: limited)
- ✅ API-based (more reliable on serverless)
- ✅ Professional service (better deliverability)
- ✅ No app password complications

### Q: Where is the "from" email configured?

**A:** Two places:
1. **In code:** `SENDGRID_FROM_EMAIL` environment variable
2. **In SendGrid:** Must be verified in Sender Authentication first

### Q: What if I get "Invalid From Address"?

**A:** The email hasn't been verified in SendGrid:
1. Go to SendGrid Dashboard
2. Settings → Sender Authentication
3. Verify the email address
4. Try again

### Q: My emails aren't arriving. What do I check?

**A:** In order:
1. ✅ API key is correct (starts with `SG.`)
2. ✅ Sender email is verified in SendGrid
3. ✅ Netlify env vars are set (case-sensitive!)
4. ✅ Check spam folder
5. 📊 SendGrid Dashboard → Activity → See delivery status

### Q: Can I send from multiple email addresses?

**A:** Yes, verify multiple senders in SendGrid:
1. Settings → Sender Authentication
2. Add each email to verify
3. Update `SENDGRID_FROM_EMAIL` to use any verified sender

### Q: What happens after 100 emails/day (free tier)?

**A:** Emails are rejected with "Rate limit exceeded"
- Upgrade SendGrid plan (paid)
- Or wait until next day
- For wedding RSVPs, 100/day is plenty!

### Q: Is my API key safe to put in netlify.toml?

**A:** ⚠️ NO! Keep it in:
- ✅ Netlify Dashboard environment variables (secure)
- ✅ Local .env file (add to .gitignore)
- ❌ Never in code files
- ❌ Never in netlify.toml
- ❌ Never in git commits

---

## 🔍 Verify Setup Works

### Test 1: Check API Key Format
```bash
echo $SENDGRID_API_KEY
# Should output: SG.1a2b3c4d5e6f7g8h...
```

### Test 2: Verify Sender in SendGrid Dashboard


```
Go to: https://app.sendgrid.com/settings/sender_auth
Your SENDGRID_FROM_EMAIL should show "Verified" ✓
```

### Test 3: Test Email Locally
```bash
cd /workspaces/summer_Dream
# Create .env with real credentials

# Option A: Test via admin dashboard
# Go to: http://localhost:8000/views/admin_dashboard.html
# Login with ADMIN_SECRET
# Approve an RSVP → Should send email

# Option B: Test via curl
curl -X POST http://localhost:3000/.netlify/functions/send-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "name": "Test Guest",
    "attending": "yes",
    "guests": "1",
    "adminSecret": "your-admin-secret"
  }'
```

### Test 4: Check Netlify Env Vars
```bash
Netlify Dashboard → Site settings → Environment variables
All 6 variables should be present:
  ✓ SENDGRID_API_KEY
  ✓ SENDGRID_FROM_EMAIL
  ✓ ADMIN_EMAIL
  ✓ NOTION_API_KEY
  ✓ NOTION_DATABASE_ID
  ✓ ADMIN_SECRET
```

### Test 5: Send Real RSVP
```
1. Go to: https://your-site.netlify.app/views/rsvp.html
2. Fill out form completely
3. Submit
4. Check email inbox for confirmation
5. If not there, check spam folder
```

---

## 📊 SendGrid Free Tier Limits

| Feature | Limit |
|---------|-------|
| Emails per day | 100 |
| Emails per month | 3,000 |
| Cost | FREE |
| API access | ✅ Yes |
| Custom sender | ✅ Yes (verified) |
| Bounce/spam handling | ✅ Yes |
| Attachments | ✅ Yes |
| Credit card | ❌ Not required |

**Perfect for weddings!** 💕

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Invalid API key" | Copy full key including `SG.` prefix |
| "Invalid From address" | Verify sender email in SendGrid Dashboard |
| "401 Unauthorized" | Check `ADMIN_SECRET` matches in code |
| "500 Server error" | Check function logs in Netlify Dashboard |
| Email not delivered | Check spam folder + SendGrid Activity log |
| Too many emails sent | Free tier is 100/day, comes back tomorrow |

---

## 📞 Resources

- **SendGrid Dashboard:** https://app.sendgrid.com
- **SendGrid API Docs:** https://sendgrid.com/docs/
- **Netlify Env Vars:** https://docs.netlify.com/environment-variables/overview/
- **@sendgrid/mail npm:** https://www.npmjs.com/package/@sendgrid/mail

---

## ✅ Checklist: SendGrid Implementation Complete

- [ ] SendGrid free account created
- [ ] API key generated and saved
- [ ] Sender email verified in SendGrid
- [ ] `.env` file created with all 6 variables
- [ ] `.env` added to `.gitignore`
- [ ] `send-confirmation.js` updated for SendGrid
- [ ] `package.json` has `@sendgrid/mail` dependency
- [ ] Netlify env variables set (6 total)
- [ ] Netlify site redeployed
- [ ] Test email sent successfully
- [ ] Email appears in inbox (check spam!)
- [ ] Admin dashboard can trigger emails
- [ ] Ready for guest RSVPs! 🎉

---

**Made for SendGrid free tier + Netlify + Notion integration** 💕

*Last Updated: December 11, 2025*
