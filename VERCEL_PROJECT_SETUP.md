# 🚀 Setting Up Your First Vercel Project

This guide will help you create a new Vercel project for your Savings Tracker app.

## Prerequisites

Before creating a Vercel project, you need:

- ✅ Your code in a Git repository (GitHub, GitLab, or Bitbucket)
- ✅ Vercel account (free - sign up at vercel.com)

---

## Option 1: Connect GitHub Repository (Recommended)

### Step 1: Push Your Code to GitHub

**If you haven't done this yet:**

1. Go to [GitHub.com](https://github.com) and sign in
2. Click **"+"** (top right) → **"New repository"**
3. Name it: `savings-tracker` (or any name)
4. Choose **Public** or **Private**
5. **Don't** initialize with README (you already have code)
6. Click **"Create repository"**

**Then in your local terminal:**

```bash
# Navigate to your project folder
cd d:\my-projects\savings-app

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Savings Tracker app"

# Add GitHub as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Replace:**
- `YOUR_USERNAME` = Your GitHub username
- `REPO_NAME` = Your repository name (e.g., `savings-tracker`)

### Step 2: Create Vercel Account & Project

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"** (easiest option)
4. Authorize Vercel to access your GitHub

### Step 3: Import Your Repository

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find your `savings-tracker` (or whatever you named it)
4. Click **"Import"**

### Step 4: Configure Project

Vercel will auto-detect settings, but verify:

**Project Settings:**
- **Project Name**: `savings-tracker` (or keep default)
- **Framework Preset**: Vercel will detect (might say "Other" or "Vite")
- **Root Directory**: `./` (project root)
- **Build Command**: Leave empty (or `npm run build` if you have one)
- **Output Directory**: Leave empty (or `dist` if you have build output)
- **Install Command**: `npm install` (default)

**Don't add environment variables yet** - we'll do that next!

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (~1-2 minutes)
3. You'll see: **"Congratulations! Your project has been deployed"**
4. Click the deployment URL to see your app

**Note:** Your app might show errors because environment variables aren't set yet - that's normal!

---

## Option 2: Deploy from Local Directory (Vercel CLI)

If you don't want to use GitHub (or want to deploy directly):

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser to authenticate.

### Step 3: Deploy

```bash
# Navigate to your project
cd d:\my-projects\savings-app

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (choose your account)
# - Link to existing project? No
# - Project name? savings-tracker
# - Directory? ./
# - Override settings? No
```

### Step 4: Production Deploy

```bash
vercel --prod
```

---

## After Project is Created

Once your project is deployed, you can:

1. **Add Environment Variables** (see next section)
2. **View Deployments** in the dashboard
3. **See Logs** for debugging
4. **Configure Domain** (optional)

---

## Adding Environment Variables (After Project Creation)

Now that your project exists:

1. In Vercel dashboard, click on your **savings-tracker** project
2. Go to **Settings** → **Environment Variables**
3. Add your Supabase credentials:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Save**
5. **Redeploy** (go to Deployments → click "..." → "Redeploy")

---

## Quick Start Checklist

- [ ] Code pushed to GitHub (or ready to deploy locally)
- [ ] Vercel account created
- [ ] Project imported/created in Vercel
- [ ] First deployment completed
- [ ] Environment variables added
- [ ] App redeployed with variables

---

## Troubleshooting

### "No repositories found"

**Solution:**
- Make sure you authorized Vercel to access GitHub
- Check that you pushed your code to GitHub
- Go to Vercel Settings → Git → Reconnect GitHub

### "Build failed"

**Solution:**
- Check build logs in Vercel dashboard
- Common issues:
  - Missing `package.json`
  - Build command error
  - Missing dependencies

### "Environment variables not working"

**Solution:**
- Make sure variables are added in Vercel dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding variables

---

## Next Steps After Setup

1. ✅ Project created in Vercel
2. ✅ First deployment done
3. ✅ Add environment variables (see SUPABASE_SETUP.md)
4. ✅ Test your app at the Vercel URL
5. ✅ Customize domain (optional)

---

## Your Vercel URL

After deployment, Vercel will give you a URL like:
```
https://savings-tracker.vercel.app
```

Or:
```
https://savings-tracker-xyz.vercel.app
```

This is your live app! You can use this URL in:
- Supabase redirect URLs
- Google OAuth configuration
- Sharing with others

---

**Ready?** Start with Option 1 (GitHub) for the easiest setup, or Option 2 (CLI) if you prefer command line.

