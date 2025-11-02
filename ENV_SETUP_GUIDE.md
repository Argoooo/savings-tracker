# 🔧 Detailed Guide: Setting Up Environment Variables

This guide explains step-by-step how to configure environment variables for your Savings Tracker app.

## What Are Environment Variables?

Environment variables are secret values (like API keys, database URLs) that your app needs to run, but shouldn't be hardcoded in your source code. They're stored in files or your hosting platform's settings.

## Step 1: Get Your Supabase Credentials

First, you need to collect your Supabase credentials.

### A. Log into Supabase

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in with your account
3. Select your **Savings Tracker** project (or create one if you haven't)

### B. Navigate to Settings

1. In the left sidebar, click on the **⚙️ Settings** icon (gear icon)
2. Click on **API** from the settings menu

### C. Copy Your Credentials

You'll see a page with several sections. Look for:

**Project URL:**
```
https://xxxxxxxxxxxxx.supabase.co
```
- This is your `SUPABASE_URL`
- Copy the entire URL (including `https://`)
- **Example:** `https://abcdefghijklmnop.supabase.co`

**Project API keys:**

You'll see two keys:

1. **anon public** key:
   - Click the 👁️ (eye icon) or **"Reveal"** button to see it
   - It's a long string starting with `eyJ...`
   - This is your `SUPABASE_ANON_KEY`
   - **This key is safe** to use in frontend code (browser)

2. **service_role** key:
   - Also click **"Reveal"** to see it
   - Also starts with `eyJ...` but different from anon key
   - This is your `SUPABASE_SERVICE_ROLE_KEY`
   - **⚠️ WARNING:** This key is secret! Never expose it in frontend code
   - Only use it in server-side code (API functions)

**Keep these tabs open** - you'll need to copy these values in the next steps.

---

## Step 2: Set Up Environment Variables for Local Development

### A. Create `.env.local` File

1. Open your project in your code editor (VS Code, etc.)
2. In the **root folder** of your project (same level as `package.json`), create a new file
3. Name it exactly: `.env.local`
   - Important: Starts with a dot (`.`)
   - No space before `.env`
   - `.local` extension

**Where to create it:**
```
savings-app/           ← Root folder
├── package.json
├── .env.local         ← Create HERE (new file)
├── api/
├── js/
└── login.html
```

### B. Add Your Credentials

Open `.env.local` and add these lines:

```bash
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important Rules:**
- ✅ **One variable per line**
- ✅ **No spaces** around the `=` sign
- ✅ **No quotes** needed (unless the value has spaces)
- ✅ **No trailing spaces** at the end of lines
- ✅ Copy the **entire** URL/key value

**Example (with fake values):**
```bash
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.abcdefghijklmnopqrstuvwxyz1234567890
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.abcdefghijklmnopqrstuvwxyz1234567890
```

### C. Verify File Location

Your file structure should look like this:

```
savings-app/
├── .env.local           ✅ Here
├── .gitignore           (should ignore .env.local)
├── package.json
├── api/
│   └── lib/
│       └── db-supabase.js
└── login.html
```

### D. Check `.gitignore`

Make sure `.env.local` is in your `.gitignore` file so you don't accidentally commit secrets to GitHub:

```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

**Why?** Environment files contain secrets. Never commit them to version control!

---

## Step 3: Use Environment Variables in Your Code

### A. In Server-Side Code (API Functions)

Your API functions in `api/lib/db-supabase.js` and `api/lib/auth.js` already use environment variables:

```javascript
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
```

**How it works:**
- Node.js/Vercel automatically loads `.env.local`
- `process.env.VARIABLE_NAME` reads the value
- No need to manually load the file

### B. In Frontend Code (Browser)

**Important:** Frontend code runs in the browser, so you can't use `process.env` directly in HTML/JS files that run in the browser.

**Option 1: Use Window Variables (Quick Start)**

In your `login.html` or main HTML file, add this before your scripts:

```html
<script>
  // Set from environment or use default
  window.SUPABASE_URL = 'https://your-project.supabase.co';
  window.SUPABASE_ANON_KEY = 'eyJhbGc...'; // Your anon key
</script>
```

**Option 2: Build-Time Injection (Better for Production)**

For Vercel, you can use `@vercel/env` or inject variables during build.

Create a `config.js` file:

```javascript
// config.js
export const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || window.SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY
};
```

**Option 3: Use Public Variables (Vercel)**

In Vercel, variables starting with `NEXT_PUBLIC_` are exposed to the browser automatically.

Rename your variables:
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Keep this secret, no NEXT_PUBLIC_ prefix
```

---

## Step 4: Test Locally

### A. Start Your Dev Server

```bash
npm run dev
# or
vercel dev
```

### B. Check Console

Open your browser console and check:
1. No errors about missing Supabase URL
2. Auth should work when you try to log in
3. API calls should succeed

### C. Verify Variables Are Loaded

Add a temporary check in your code:

```javascript
console.log('Supabase URL:', process.env.SUPABASE_URL); // Server-side only
console.log('Window URL:', window.SUPABASE_URL); // Frontend
```

---

## Step 5: Set Up Vercel Production Environment Variables

### A. Go to Vercel Dashboard

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Sign in
3. Click on your **savings-tracker** project

### B. Navigate to Settings

1. Click on **Settings** tab (top navigation)
2. Click on **Environment Variables** in the left sidebar

### C. Add Variables

For each variable:

1. Click **"Add New"** or **"+ Add"** button
2. **Key**: Enter variable name (e.g., `SUPABASE_URL`)
3. **Value**: Paste your credential
4. **Environment**: Select which environments:
   - ✅ **Production** (for live app)
   - ✅ **Preview** (for pull request previews)
   - ✅ **Development** (for `vercel dev`)

5. Click **"Save"**

**Add these three variables:**

| Key | Value | Environments |
|-----|-------|--------------|
| `SUPABASE_URL` | Your Supabase project URL | All |
| `SUPABASE_ANON_KEY` | Your anon public key | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Production only ⚠️ |

**Note:** For `SUPABASE_SERVICE_ROLE_KEY`, you might want to set it to **Production only** since it's more sensitive.

### D. Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Find your latest deployment
3. Click **"..."** (three dots) → **"Redeploy"**
4. Or push a new commit to trigger redeployment

**Why?** Environment variables are loaded when the app builds. You need to redeploy for changes to take effect.

---

## Step 6: Verify Production Setup

### A. Check Your Live App

1. Go to `https://savings-tracker.vercel.app`
2. Try to log in
3. Should work without errors

### B. Check Vercel Logs

1. In Vercel dashboard → **Deployments**
2. Click on a deployment
3. Click **"Functions"** tab
4. Check for any errors related to missing environment variables

### C. Test Authentication

1. Try creating a new account
2. Try logging in
3. Verify data saves correctly

---

## Troubleshooting

### Problem: "SUPABASE_URL is not defined"

**Solution:**
- Check `.env.local` file exists in project root
- Verify variable name is exactly `SUPABASE_URL` (case-sensitive)
- Make sure no spaces around `=`
- Restart your dev server after creating `.env.local`

### Problem: Variables work locally but not in production

**Solution:**
- Check Vercel dashboard → Settings → Environment Variables
- Make sure variables are added for **Production** environment
- Redeploy your app after adding variables
- Check variable names match exactly (case-sensitive)

### Problem: "Invalid API key"

**Solution:**
- Verify you copied the **entire** key (they're very long)
- Check for extra spaces or line breaks
- Make sure you're using the correct key:
  - `SUPABASE_ANON_KEY` = anon public key (frontend)
  - `SUPABASE_SERVICE_ROLE_KEY` = service role key (backend only)

### Problem: Frontend can't access variables

**Solution:**
- Frontend code can't use `process.env` directly
- Use `window.SUPABASE_URL` or `NEXT_PUBLIC_` prefix
- Or inject variables in HTML as shown above

### Problem: ".env.local not found"

**Solution:**
- Make sure file is in **root** of project (same folder as `package.json`)
- Check file name is exactly `.env.local` (with dot at start)
- Some editors hide dotfiles - enable "Show hidden files"
- Try creating it via terminal: `touch .env.local`

---

## Security Best Practices

1. ✅ **Never commit `.env.local`** to Git
2. ✅ **Add to `.gitignore`** immediately
3. ✅ **Use different keys** for development and production if possible
4. ✅ **Don't share** environment variables publicly
5. ✅ **Rotate keys** if they're accidentally exposed
6. ✅ **Use service role key** only in server-side code
7. ✅ **Anon key** is safe for frontend (it has RLS protection)

---

## Quick Reference

### File Locations

**Local:**
```
savings-app/
└── .env.local  (create this file)
```

**Production:**
```
Vercel Dashboard → Project → Settings → Environment Variables
```

### Required Variables

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Where to Find Supabase Credentials

1. Go to Supabase Dashboard
2. Settings → API
3. Copy Project URL and API keys

---

## Checklist

- [ ] Supabase project created
- [ ] Credentials copied from Supabase dashboard
- [ ] `.env.local` file created in project root
- [ ] All three variables added to `.env.local`
- [ ] `.env.local` added to `.gitignore`
- [ ] Local dev server tested successfully
- [ ] Variables added to Vercel dashboard
- [ ] Vercel app redeployed
- [ ] Production app tested and working

---

**Need help?** Check the error messages in:
- Browser console (F12)
- Vercel function logs
- Terminal where you're running `npm run dev`

