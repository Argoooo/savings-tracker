# 🚀 Quick Start Guide

Get your savings app running with cloud database in 5 minutes!

## Step 1: Choose Database (2 minutes)

### Option A: Supabase (⭐ Recommended - Secure & Full-Featured)

**Best for:** Financial data, user authentication, security-first apps

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Fill in details and wait for provisioning (~2 minutes)
4. Go to **Settings** → **API**:
   - Copy **Project URL** (e.g., `https://xxxxx.supabase.co`) - 
   - Copy **anon public key**
   - Copy **service_role key** (keep secret!)
5. Go to **SQL Editor** → Run `database/schema-supabase.sql`

**Why Supabase?** Perfect for financial data with built-in auth and Row-Level Security. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed setup.

### Option B: Neon (Single-User Apps)

**Best for:** Single-user apps, minimal setup, pure PostgreSQL

1. Go to [neon.tech](https://neon.tech) and sign up
2. Click "Create Project"
3. Choose a name and region
4. Copy the connection string (it will be shown after creation)
5. Run `database/schema.sql` in their SQL editor

**Note:** No authentication - all data is accessible to anyone with the connection string. Use only for single-user apps.

### Option C: PlanetScale (MySQL)

**Best for:** MySQL-based apps, horizontal scaling

1. Go to [planetscale.com](https://planetscale.com) and sign up
2. Create a new database
3. Get connection credentials (host, username, password)
4. **Note:** Requires MySQL syntax changes in schema. See MIGRATION.md.

**💡 Quick Tip:** Since you're hosting financial data, **Supabase is strongly recommended** for authentication and security. See [DATABASE_COMPARISON.md](DATABASE_COMPARISON.md) for details.

## Step 2: Set Up Database Schema (1 minute)

### For Supabase:
1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Open `database/schema-supabase.sql` from this repo
4. Copy and paste the entire SQL into the editor
5. Click **"Run"** or press `Ctrl+Enter`

### For Neon:
1. Go to **SQL Editor** in Neon dashboard
2. Open `database/schema.sql` from this repo
3. Copy and paste the entire SQL into the editor
4. Click **"Run"**

✅ Your database is now ready!

**Note:** Supabase schema includes Row-Level Security (RLS) for data isolation between users.

## Step 3: Create Vercel Project & Deploy (5 minutes)

**⚠️ If you don't have a Vercel project yet, create one first!**

### First Time Setup

**Option A: From GitHub (Recommended)**
1. Push your code to GitHub (if not already)
2. Go to [vercel.com](https://vercel.com) and sign up/login
3. Click **"Add New..."** → **"Project"**
4. Import your GitHub repository
5. Vercel will auto-detect settings
6. Click **"Deploy"** (environment variables will be added next)

**Option B: From Local (CLI)**
```bash
npm install -g vercel
vercel login
vercel  # Follow prompts to create project
vercel --prod  # Deploy to production
```

**See [VERCEL_PROJECT_SETUP.md](VERCEL_PROJECT_SETUP.md) for detailed instructions.**

### If You Already Have a Vercel Project

Proceed with adding environment variables below.

## Step 4: Add Environment Variables to Vercel (2 minutes)

### Method A: GitHub + Vercel (Recommended)

1. Push this code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect settings
6. **Add Environment Variables:**
   
   **For Supabase:**
   - `SUPABASE_URL` = Your project URL
   - `SUPABASE_ANON_KEY` = Your anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = Your service role key (Production only)
   
   **For Neon:**
   - `POSTGRES_URL` = Your connection string
   
7. Click "Deploy"

### Method B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Add environment variable
vercel env add POSTGRES_URL
# Paste your connection string when prompted

# Deploy
vercel --prod
```

## Step 5: Verify (30 seconds)

1. Visit your deployed URL (shown after deployment)
2. You should see the savings dashboard
3. Try adding a person - it should save to the database!

## ✅ Done!

Your app is now live with cloud database storage!

## Troubleshooting

**"Cannot connect to database"**
- Double-check your `POSTGRES_URL` environment variable
- Make sure you copied the full connection string
- For Neon: Ensure the database isn't paused (free tier auto-pauses)

**"Table does not exist"**
- Make sure you ran the `schema.sql` file
- Check your database for the tables: `settings`, `people`, `goals`, `transactions`

**API errors**
- Check Vercel function logs: Dashboard > Your Project > Functions tab
- Check browser console for specific error messages

## Next Steps

- [ ] Customize the app appearance
- [ ] Set up custom domain
- [ ] Migrate existing localStorage data (see MIGRATION.md)
- [ ] Add authentication (optional)

---

**Need help?** Open an issue on GitHub!

