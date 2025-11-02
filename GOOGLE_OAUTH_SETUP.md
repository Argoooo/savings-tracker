# 🔐 Google OAuth Setup Guide for Supabase

This guide will help you enable "Sign in with Google" for your savings app.

**💰 Cost:** **100% FREE** - No payment or credit card required!

## Step 1: Create Google OAuth Credentials (5 minutes)

### A. Go to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click the project dropdown at the top
4. Click **"NEW PROJECT"**
   - Project name: `Savings App` (or your preferred name)
   - Click **"CREATE"**
5. Wait a few seconds, then select your new project

### B. Enable Google+ API

1. In the search bar at the top, type: `Google+ API`
2. Click on **"Google+ API"**
3. Click **"ENABLE"** button
4. Wait for it to enable

**Note:** Google+ API is deprecated, but Supabase uses it for basic profile info. Alternatively, you can use **"Google Identity Services"** (newer), but Supabase currently supports Google+ API.

### C. Configure OAuth Consent Screen

1. In the left sidebar, go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (unless you have a Google Workspace account)
3. Click **"CREATE"**

**Fill in the required information:**

- **App name**: `Savings Dashboard` (or your app name)
- **User support email**: Your email address
- **Developer contact information**: Your email address
- **App logo**: (Optional) Upload your app logo if you have one
- **App domain**: (Optional) Your domain if you have one
- **Application home page**: Your app URL
  ```
  https://savings-tracker.vercel.app
  ```
- **Privacy policy link**: (Required for production) Link to your privacy policy
- **Terms of service link**: (Optional) Link to your terms of service
- **Authorized domains**: Add your domain (e.g., `vercel.app`, `yourdomain.com`)

4. Click **"SAVE AND CONTINUE"**

**Scopes** (Step 2):
- Keep default scopes (usually `email`, `profile`, `openid`)
- Click **"SAVE AND CONTINUE"**

**Test users** (Step 3):
- For development, you can add test users
- For production, skip this
- Click **"SAVE AND CONTINUE"**

**Summary** (Step 4):
- Review your settings
- Click **"BACK TO DASHBOARD"**

### D. Create OAuth 2.0 Credentials

1. In the left sidebar, go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**

**Application type:**
- Choose **"Web application"**

**Name:**
- Enter: `Savings App Web Client` (or your preferred name)

**Authorized JavaScript origins:**
- Click **"+ ADD URI"**
- Add your Supabase project URL:
  ```
  https://YOUR_PROJECT_REF.supabase.co
  ```
  Replace `YOUR_PROJECT_REF` with your actual Supabase project reference (found in your Supabase dashboard URL).

**Example:** If your Supabase project URL is `https://xyzabc123.supabase.co`, add:
  ```
  https://xyzabc123.supabase.co
  ```

**Authorized redirect URIs:**
- Click **"+ ADD URI"**
- Add this exact URL (replace `YOUR_PROJECT_REF` with your actual Supabase project reference):
  ```
  https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
  ```
  
  **How to find your Supabase project reference:**
  - Go to your Supabase dashboard
  - Look at your project URL: `https://abcdefghijklmnop.supabase.co`
  - The part before `.supabase.co` is your project reference (e.g., `abcdefghijklmnop`)
  
  **Example:** If your Supabase URL is `https://xyzabc123.supabase.co`, the redirect URI would be:
  ```
  https://xyzabc123.supabase.co/auth/v1/callback
  ```

4. Click **"CREATE"**

5. **IMPORTANT:** Copy these values immediately (you won't see the secret again):
   - **Client ID**: `xxxxx.apps.googleusercontent.com`
   - **Client secret**: `GOCSPX-xxxxx`

✅ **Google OAuth credentials created!**

## Step 2: Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **"Authentication"** (left sidebar) → **"Providers"**
4. Find **"Google"** in the list
5. Click **"Configure provider"** or toggle it **ON**

**Fill in the credentials:**

- **Enabled**: ✅ Toggle ON
- **Client ID (for OAuth)**: Paste your Google Client ID
  ```
  xxxxx.apps.googleusercontent.com
  ```
- **Client Secret (for OAuth)**: Paste your Google Client Secret
  ```
  GOCSPX-xxxxx
  ```

6. Click **"Save"**

✅ **Google OAuth configured in Supabase!**

## Step 3: Update Your Login Page

Update `login.html` to add a "Sign in with Google" button.

Find the login form section and add:

```html
<!-- Add after the sign in form, before "Don't have an account?" -->

<div class="text-center mb-3">
  <div class="divider mb-3">
    <span class="text-muted">OR</span>
  </div>
  
  <button type="button" class="btn btn-outline-secondary w-100" id="google-signin-btn" onclick="signInWithGoogle()">
    <svg width="20" height="20" viewBox="0 0 24 24" style="margin-right: 8px;">
      <!-- Google logo SVG -->
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    Sign in with Google
  </button>
</div>

<style>
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem 0;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #dee2e6;
}
.divider span {
  padding: 0 1rem;
}
</style>
```

Then add the JavaScript function:

```javascript
async function signInWithGoogle() {
  try {
    const btn = document.getElementById('google-signin-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Connecting...';

    if (!auth.supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await auth.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });

    if (error) throw error;

    // The user will be redirected to Google
    // After approval, they'll be redirected back to your app
  } catch (error) {
    console.error('Google sign in error:', error);
    showAlert(error.message || 'Failed to sign in with Google');
    btn.disabled = false;
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" style="margin-right: 8px;">
        <!-- Google logo SVG (same as above) -->
      </svg>
      Sign in with Google
    `;
  }
}
```

## Step 4: Configure Redirect URL

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your app URL:
   ```
   https://savings-tracker.vercel.app
   ```
   **Important:** No trailing slash (`/`) at the end!

3. Add to **Redirect URLs**:
   ```
   https://savings-tracker.vercel.app/**
   http://localhost:3000/** (for local development)
   ```
4. Click **"Save"**

**Note:** This ensures that after Google sign-in, users are redirected back to your production app.

## Step 5: Test Google Sign-In

1. Go to your login page: `http://localhost:3000/login.html`
2. Click **"Sign in with Google"**
3. You should be redirected to Google's consent screen
4. Sign in with your Google account
5. You should be redirected back to your app, logged in!

✅ **Google OAuth working!**

## Troubleshooting

### "redirect_uri_mismatch" Error

**Problem:** Google says the redirect URI doesn't match.

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Click on your OAuth 2.0 Client ID
3. Make sure the **Authorized redirect URI** is exactly:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
4. Check that there are no extra spaces or typos
5. Click **"SAVE"**
6. Wait a few minutes for changes to propagate

### "Access blocked: This app's request is invalid"

**Problem:** OAuth consent screen not properly configured.

**Solution:**
1. Go to Google Cloud Console → OAuth consent screen
2. Make sure all required fields are filled:
   - App name
   - User support email
   - Application home page
   - Privacy policy link (required for production)
3. If still in development, add yourself as a test user
4. Publish the app if you want public access

### "OAuth client not found"

**Problem:** Client ID or Secret is incorrect.

**Solution:**
1. Double-check you copied the full Client ID and Secret
2. Make sure there are no extra spaces
3. Verify in Supabase that the credentials are correctly pasted

### User Not Redirecting Back

**Problem:** After Google sign-in, user doesn't return to your app.

**Solution:**
1. Check Supabase **Authentication** → **URL Configuration**
2. Verify **Redirect URLs** include your app domain
3. Check browser console for errors
4. Make sure your app is accessible (not blocked by firewall)

## Production Checklist

Before going to production:

- [ ] OAuth consent screen is published (not in "Testing")
- [ ] Privacy policy URL is added and accessible
- [ ] Authorized domains include your production domain
- [ ] Redirect URIs use HTTPS (not HTTP)
- [ ] Site URL in Supabase matches your production domain
- [ ] Test with a different Google account

## Additional OAuth Providers

You can also enable:
- **GitHub** - Similar process, uses GitHub OAuth Apps
- **Facebook** - Requires Facebook App ID
- **Twitter/X** - Requires Twitter Developer account
- **Discord** - Requires Discord Application

Each provider has a similar setup process. See Supabase docs for specific instructions.

## Security Best Practices

1. **Never commit credentials** - Keep Client ID and Secret in environment variables
2. **Use HTTPS only** - OAuth requires secure connections
3. **Limit redirect URIs** - Only add domains you control
4. **Review permissions** - Only request scopes you actually need
5. **Monitor usage** - Check Google Cloud Console for suspicious activity

---

**Need help?** Check:
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Discord Community](https://discord.supabase.com/)

