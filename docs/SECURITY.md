# Security Best Practices

This guide covers security considerations for the wedding website.

## 🔐 Critical Security Rules

### ❌ NEVER Do This:

```javascript
// ❌ NEVER put real API keys in client-side code
const NOTION_API_KEY = 'secret_abc123xyz...'; // Exposed to everyone!
```

### ✅ ALWAYS Do This:

```javascript
// ✅ Use serverless functions
const response = await fetch('/.netlify/functions/submit-rsvp', {
    method: 'POST',
    body: JSON.stringify(formData)
});
```

## 🛡️ What's Safe to Expose

### ✅ Safe in Client-Side Code:
- **Database IDs** - Not sensitive (Notion, Firebase, etc.)
- **Public URLs** - Album links, website URLs
- **Payment Links** - PayPal.me, Wise public links
- **Configuration** - Wedding date, theme colors
- **Public Bank Details** - IBAN for receiving payments (common practice)

### ❌ Never Expose:
- **API Keys** - Notion, SendGrid, any service API keys
- **Secrets** - Authentication tokens, private keys
- **Passwords** - Any kind of password
- **Private Keys** - Encryption keys, signing keys

## 📝 Current Implementation

### Multi-Page MVC Version

#### Safe Configuration (`models/config.js`):
```javascript
// ✅ Safe - Public information
export const WEDDING_DATE = new Date('2026-06-12T15:30:00').getTime();

// ✅ Safe - Public payment links
export const PAYMENT_LINKS = {
    paypal: 'https://paypal.me/username',
    wise: 'https://wise.com/pay/me/username',
    wero: 'wero://pay?to=phone'
};

// ⚠️ Keep API key empty - use serverless function
export const NOTION_CONFIG = {
    apiKey: '', // Never put real key here
    databaseId: 'abc123' // Database ID is OK
};
```

#### RSVP Controller (`controllers/rsvp.js`):
The RSVP controller includes a placeholder for Notion integration but notes that you should use a serverless function:

```javascript
// This is a client-side example. For production, you should create a serverless function
// (e.g., Netlify Functions, Vercel Serverless Functions, or AWS Lambda) to handle Notion API calls
// to keep your API key secure.
```

### React SPA Version

The SPA version (`views/spa/index.html`) includes similar warnings and placeholder code.

## 🔧 Secure RSVP Setup

### Option 1: Netlify Functions (Recommended)

**1. Create function file** (`netlify/functions/submit-rsvp.js`):
```javascript
const { Client } = require('@notionhq/client');

exports.handler = async (event) => {
    // API key is in Netlify environment variables
    const notion = new Client({
        auth: process.env.NOTION_API_KEY
    });

    const data = JSON.parse(event.body);

    try {
        await notion.pages.create({
            parent: { database_id: process.env.NOTION_DATABASE_ID },
            properties: {
                Name: { title: [{ text: { content: data.name } }] },
                Email: { email: data.email },
                // ... other fields
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
```

**2. Set environment variables in Netlify:**
- Go to Site settings → Environment variables
- Add `NOTION_API_KEY`
- Add `NOTION_DATABASE_ID`

**3. Update client code** (`controllers/rsvp.js`):
```javascript
async submitToNotion(data) {
    const response = await fetch('/.netlify/functions/submit-rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
}
```

### Option 2: Vercel Serverless Functions

Similar to Netlify, create in `api/submit-rsvp.js`.

### Option 3: Google Forms (Simplest)

**No API keys needed!**

1. Create a Google Form with your fields
2. Get the form URL
3. Link directly from your RSVP page

## 🏦 Payment Information

### Bank Details

**IBAN numbers are meant to receive payments** - it's standard practice to share them publicly:

✅ **Safe to display:**
```html
<p>IBAN: DE89 3704 0044 0532 0130 00</p>
```

This is like sharing your address - people need it to send you things.

**What NOT to share:**
- ❌ Online banking passwords
- ❌ Credit card numbers
- ❌ PIN codes
- ❌ Security questions/answers

### Payment Links

✅ **Safe to share:**
- PayPal.me links
- Wise payment links
- Venmo usernames
- Cash App $cashtags

These are designed to be shared publicly.

## 🔍 How to Check for Exposed Secrets

### Before Committing:

```bash
# Search for potential API keys
git grep -i "api.key"
git grep -i "secret"
git grep -i "password"

# Check what you're about to commit
git diff --cached
```

### Tools:

1. **git-secrets** - Prevents committing secrets
2. **truffleHog** - Finds secrets in git history
3. **GitHub Secret Scanning** - Automatic on public repos

## 📋 Security Checklist

### Before Going Live:

- [ ] No API keys in client-side code
- [ ] Notion integration uses serverless functions
- [ ] Environment variables set on hosting platform
- [ ] `.env` files in `.gitignore`
- [ ] Tested RSVP submission
- [ ] HTTPS enabled (automatic on GitHub Pages)
- [ ] No passwords or secrets in code
- [ ] Reviewed all committed files

### Regular Maintenance:

- [ ] Check for security updates
- [ ] Review access logs if using analytics
- [ ] Rotate API keys annually
- [ ] Remove test data from databases

## 🚨 If You Accidentally Expose a Secret

### Immediate Actions:

1. **Revoke the key immediately**
   - Notion: Delete integration or regenerate key
   - GitHub: Rotate tokens
   - Any service: Regenerate credentials

2. **Remove from git history**
   ```bash
   # Use git-filter-repo or BFG Repo-Cleaner
   # This is complex - see GitHub docs
   ```

3. **Update with new key**
   - Generate new credentials
   - Update in secure location (environment variables)
   - Never commit new key

4. **Check for unauthorized access**
   - Review service logs
   - Check for unusual activity

### Prevention:

- Use `.env` files (in `.gitignore`)
- Use environment variables
- Use serverless functions
- Review commits before pushing

## 📚 Additional Resources

### Documentation:
- [Netlify Functions Guide](https://docs.netlify.com/functions/overview/)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

### Tools:
- [git-secrets](https://github.com/awslabs/git-secrets)
- [truffleHog](https://github.com/trufflesecurity/truffleHog)
- [GitGuardian](https://www.gitguardian.com/)

## ✅ This Repository

### Current Status:
✅ No real API keys exposed
✅ Placeholders clearly marked
✅ Security warnings in comments
✅ Serverless function pattern documented
✅ `.gitignore` includes sensitive patterns

### What Users Need to Do:
1. Keep API keys in environment variables
2. Use serverless functions for Notion
3. Never commit real credentials
4. Follow this security guide

---

## 💡 Remember

**Client-side code is public code.**

Anything in HTML, CSS, or JavaScript files can be viewed by anyone. Treat it as if it's published on a billboard.

**When in doubt, ask:** "Would I write this on a public billboard?"
- Wedding date? Yes ✅
- Payment links? Yes ✅
- API keys? NO ❌
- Passwords? NO ❌

---

**Stay secure! 🔐**

*This guide is part of the Audrey & Josue-Daniel 2026 wedding website project*
