# 🔐 Supabase Authentication Setup Guide

This guide will help you set up Supabase with authentication for your savings app.

**💰 Cost:** **100% FREE** - Supabase free tier includes authentication, database, and all features you need. No credit card required! See [PRICING_GUIDE.md](PRICING_GUIDE.md) for details.

## Why Supabase?

Since you're hosting financial data, **Supabase is the best choice** because:
- ✅ **Built-in authentication** - Secure user accounts out of the box
- ✅ **Row-Level Security (RLS)** - Users can only see their own data
- ✅ **Encrypted connections** - All data is encrypted in transit
- ✅ **GDPR compliant** - Proper data privacy controls
- ✅ **Free tier** - Generous free plan for development

## Step 1: Create Supabase Project (5 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"New Project"**
3. Sign in with GitHub (recommended) or email
4. Click **"New Project"**
5. Fill in:
   - **Organization**: Create new or select existing
   - **Name**: `savings-app` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
6. Click **"Create new project"**
7. Wait ~2 minutes for provisioning

✅ **Project created!**

## Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (keep this secret!)

3. Save them for the next steps.

## Step 3: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open `database/schema-supabase.sql` from this repo
4. Copy the entire SQL file
5. Paste into the SQL Editor
6. Click **"Run"** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

✅ **Database schema created with RLS policies!**

## Step 4: Configure Authentication

Supabase authentication is already configured, but you can customize it:

1. Go to **Authentication** → **Settings**
2. **Site URL**: Set to your app URL:
   ```
   https://savings-tracker.vercel.app
   ```
3. **Redirect URLs**: Add your app URLs:
   - `https://savings-tracker.vercel.app/**` (production)
   - `http://localhost:3000/**` (for local dev)
4. **Email Auth**: Already enabled (default)
5. **Email Templates**: Customize if desired

**Note:** Make sure there's **no trailing slash** in the Site URL (`/` at the end)

**Optional: Enable OAuth providers**
- Go to **Authentication** → **Providers**
- Enable Google, GitHub, etc. if you want social login

## Step 5: Set Environment Variables

### Local Development

Create `.env.local` file in your project root:

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc... (anon public key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (service_role key - server only!)
```

**⚠️ Important**: 
- Never commit `.env.local` to git
- The `SERVICE_ROLE_KEY` bypasses RLS - only use on server-side
- The `ANON_KEY` is safe to expose in frontend code

### Vercel Deployment

**💡 Tip:** Add environment variables BEFORE pushing code changes for smoother deployment.

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables one by one:

| Name | Value | Environment |
|------|-------|-------------|
| `SUPABASE_URL` | Your project URL from Step 2 | All (Production, Preview, Development) |
| `SUPABASE_ANON_KEY` | Your anon public key from Step 2 | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service_role key from Step 2 | Production only ⚠️ |

**For each variable:**
- Click **"Add New"** or **"+ Add"**
- Paste the **Key** name exactly (case-sensitive)
- Paste the **Value** (your credential)
- Select **Environments** (checkboxes for Production/Preview/Development)
- Click **"Save"**

4. After adding all three, you're ready to push code!

**Note:** After adding variables, push your code changes. Vercel will automatically deploy with these variables already configured. No need to redeploy manually unless you add variables after pushing.

### Frontend Configuration

For the frontend to use Supabase, you have two options:

#### Option A: Environment Variables (Recommended)

In your `index.html` or `login.html`, add before the auth script:

```html
<script>
  window.SUPABASE_URL = 'YOUR_SUPABASE_URL';
  window.SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
</script>
```

**For production**, use Vercel's environment variables:
- Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` as public variables
- They'll be available in frontend via `process.env`

#### Option B: Configuration File

Create `config.js`:

```javascript
window.SUPABASE_CONFIG = {
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

## Step 6: Test Authentication

1. Start your local server: `npm run dev`
2. Go to `http://localhost:3000/login.html`
3. Click **"Sign up"**
4. Enter email and password
5. Check your email for verification link (if email confirmation is enabled)
6. Sign in with your credentials

✅ **Authentication working!**

## Step 7: Verify Row-Level Security

1. Create two test accounts
2. Log in as first user, add some data
3. Log out, log in as second user
4. Confirm you don't see the first user's data

✅ **RLS is working - users can only see their own data!**

## Security Checklist

- ✅ Database schema created with RLS policies
- ✅ `user_id` column added to all tables
- ✅ RLS policies enforce user isolation
- ✅ Service role key only in server environment variables
- ✅ Anon key used in frontend
- ✅ Authentication required on all API endpoints
- ✅ Passwords meet minimum requirements (6+ characters)

## Troubleshooting

### "Invalid API key"
- Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Ensure no extra spaces in environment variables
- Restart your dev server after adding env vars

### "Row-Level Security policy violation"
- Verify RLS policies are created (check SQL Editor)
- Ensure `user_id` is set on all inserts
- Check that auth token is being sent in API requests

### "User not authenticated"
- Check browser console for auth errors
- Verify login was successful (check `auth.session`)
- Ensure token is included in API request headers

### "Cannot read property 'id' of undefined"
- Verify `req.user` is set in API endpoints
- Check that `withAuth` middleware is applied
- Ensure token is valid and not expired

## Next Steps

- [ ] Customize email templates
- [ ] Add password reset flow (already in login.html)
- [ ] Enable OAuth providers (optional)
- [ ] Set up custom domain
- [ ] Configure backup strategy

## Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Row-Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

**Your financial data is now secure! 🔒**

