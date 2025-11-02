# ✅ Deployment Checklist

Use this checklist to ensure your savings app is properly configured and deployed.

## Pre-Deployment

### Supabase Configuration
- [ ] Supabase project created
- [ ] Database schema deployed (`database/schema-supabase.sql`)
- [ ] Authentication enabled
- [ ] **Site URL** configured: `https://savings-tracker.vercel.app` (no trailing slash)
- [ ] **Redirect URLs** added:
  - [ ] `https://savings-tracker.vercel.app/**`
  - [ ] `http://localhost:3000/**` (for local dev)

### Google OAuth (Optional)
- [ ] Google Cloud Console project created
- [ ] OAuth consent screen configured
- [ ] OAuth client credentials created
- [ ] **Authorized redirect URI** set: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- [ ] **Authorized JavaScript origin** set: `https://YOUR_PROJECT_REF.supabase.co`
- [ ] Google OAuth enabled in Supabase dashboard
- [ ] Client ID and Secret added to Supabase

### Environment Variables

**Local Development (.env.local):**
- [ ] `SUPABASE_URL` = Your Supabase project URL
- [ ] `SUPABASE_ANON_KEY` = Your Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = Your Supabase service role key

**Vercel Production:**
- [ ] `SUPABASE_URL` added in Vercel dashboard
- [ ] `SUPABASE_ANON_KEY` added in Vercel dashboard
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added (Production only)

## Deployment

### Vercel Configuration
- [ ] Project deployed to Vercel
- [ ] Custom domain configured: `savings-tracker.vercel.app`
- [ ] Environment variables set in Vercel dashboard
- [ ] Deployment successful (no build errors)

### Frontend Configuration
- [ ] `login.html` has Supabase credentials configured
- [ ] `index.html` (main app) has Supabase credentials configured
- [ ] Auth check added to redirect unauthenticated users to login
- [ ] API client (`js/api.js`) properly configured

## Post-Deployment Testing

### Authentication
- [ ] Can create new account with email/password
- [ ] Can sign in with email/password
- [ ] Can sign out
- [ ] Can reset password (if implemented)
- [ ] **Google OAuth** works (if enabled):
  - [ ] "Sign in with Google" button appears
  - [ ] Clicking redirects to Google
  - [ ] After approval, redirects back to app
  - [ ] User is logged in after Google sign-in

### Data Operations
- [ ] Can add a person
- [ ] Can view people list
- [ ] Can edit a person
- [ ] Can delete a person
- [ ] Can add a goal
- [ ] Can view goals
- [ ] Can edit a goal
- [ ] Can delete a goal
- [ ] Can add a transaction
- [ ] Can view transactions
- [ ] Can edit a transaction
- [ ] Can delete a transaction
- [ ] Can update settings
- [ ] Data persists after page refresh

### Security
- [ ] Logged-out users can't access app (redirected to login)
- [ ] User A can't see User B's data (Row-Level Security working)
- [ ] API endpoints return 401 if no auth token
- [ ] HTTPS enabled (secure connection)

### Multi-User Testing
- [ ] Create two test accounts
- [ ] Log in as User 1, add data
- [ ] Log out, log in as User 2
- [ ] Verify User 2 can't see User 1's data
- [ ] User 2 can create their own data

## Performance
- [ ] Page loads quickly (< 3 seconds)
- [ ] API responses are fast (< 500ms)
- [ ] No console errors
- [ ] No network errors (404s, etc.)

## URLs to Verify

### Production URLs
- [ ] Main app: `https://savings-tracker.vercel.app`
- [ ] Login page: `https://savings-tracker.vercel.app/login.html`
- [ ] API base: `https://savings-tracker.vercel.app/api`

### Supabase URLs
- [ ] Project dashboard: `https://app.supabase.com/project/YOUR_PROJECT`
- [ ] API endpoint: `https://YOUR_PROJECT_REF.supabase.co`
- [ ] Auth callback: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

## Common Issues Checklist

### "Cannot connect to database"
- [ ] Supabase credentials are correct
- [ ] Environment variables set in Vercel
- [ ] Database schema deployed
- [ ] Supabase project is active (not paused)

### "Unauthorized" errors
- [ ] User is logged in
- [ ] Auth token is being sent in API requests
- [ ] Token hasn't expired
- [ ] RLS policies are configured

### "redirect_uri_mismatch" (Google OAuth)
- [ ] Redirect URI in Google Console matches Supabase callback URL exactly
- [ ] No extra spaces or typos
- [ ] HTTPS used (not HTTP)

### Users can see other users' data
- [ ] RLS policies are enabled
- [ ] All tables have `user_id` column
- [ ] RLS policies use `auth.uid() = user_id`
- [ ] API endpoints filter by `user_id`

## Final Checks

- [ ] All tests pass
- [ ] No console errors
- [ ] No broken links
- [ ] Mobile responsive (test on phone)
- [ ] Works in Chrome, Firefox, Safari
- [ ] Print styles work (if applicable)

## Documentation

- [ ] README.md updated with deployment URL
- [ ] Setup guides reference correct URLs
- [ ] Environment variable names documented

---

## Quick Test Script

Run these in your browser console on the deployed app:

```javascript
// Test 1: Check if authenticated
console.log('Auth status:', auth.isAuthenticated());

// Test 2: Check API connection
fetch('/api/data')
  .then(r => r.json())
  .then(d => console.log('API works:', d))
  .catch(e => console.error('API error:', e));

// Test 3: Check Supabase client
console.log('Supabase URL:', window.SUPABASE_URL);
```

---

**🎉 Deployment Complete!**

Your app is live at: **https://savings-tracker.vercel.app**

