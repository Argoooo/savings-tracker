# 🚀 Migration Guide: localStorage to Cloud Database

This guide will help you migrate your savings app from localStorage to a cloud-based architecture with serverless functions.

## 📋 Overview

The app is being migrated from:
- ❌ Single HTML file with localStorage
- ❌ Client-side only storage

To:
- ✅ Separated frontend (HTML/CSS/JS)
- ✅ Serverless API functions
- ✅ Cloud database (Neon/PlanetScale/Supabase)
- ✅ Deployable on Vercel/Netlify

## 🏗️ New Project Structure

```
savings-app/
├── index.html                 # Main frontend file
├── styles/
│   └── main.css              # Extracted CSS
├── js/
│   ├── app.js                # Main application logic
│   └── api.js                # API client functions
├── api/                      # Serverless functions
│   ├── data/
│   │   └── index.js          # GET all data
│   ├── settings/
│   │   └── index.js          # Settings CRUD
│   ├── people/
│   │   └── index.js          # People CRUD
│   ├── goals/
│   │   └── index.js          # Goals CRUD
│   ├── transactions/
│   │   └── index.js          # Transactions CRUD
│   ├── scenario-rates/
│   │   └── index.js          # Scenario rates CRUD
│   └── lib/
│       └── db.js             # Database connection utility
├── database/
│   └── schema.sql            # Database schema
├── package.json
├── vercel.json               # Vercel configuration
├── .env.example              # Environment variables template
└── README.md
```

## 🔧 Setup Steps

### 1. Choose Your Database Provider

#### Option A: Neon (PostgreSQL) - Recommended
1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string (it looks like: `postgresql://user:password@host/database`)

#### Option B: PlanetScale (MySQL)
1. Go to [planetscale.com](https://planetscale.com)
2. Create a free account
3. Create a new database
4. Copy the connection credentials (host, username, password)

#### Option C: Supabase (PostgreSQL)
1. Go to [supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Get your project URL and anon key from Settings > API

### 2. Set Up Database Schema

1. Connect to your database using your preferred tool:
   - **Neon**: Use their SQL Editor or pgAdmin
   - **PlanetScale**: Use their web console or CLI
   - **Supabase**: Use their SQL Editor

2. Run the SQL schema from `database/schema.sql`:
   ```bash
   # For Neon/Supabase (PostgreSQL)
   psql $POSTGRES_URL < database/schema.sql
   
   # Or use their web SQL editor to paste and run the schema
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your database credentials:

```bash
cp .env.example .env
```

For **Vercel** (recommended):
1. Install Vercel CLI: `npm i -g vercel`
2. Link your project: `vercel link`
3. Set environment variables:
   ```bash
   vercel env add POSTGRES_URL
   # Paste your database connection string
   ```

Or use Vercel Dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add `POSTGRES_URL` with your connection string

For **Neon with Vercel**:
- Vercel has native integration with Neon
- Connect Neon database in Vercel dashboard
- Environment variables will be auto-populated

### 5. Update Database Connection (if needed)

The default setup uses `@vercel/postgres` which works with Neon/PostgreSQL.

If using **PlanetScale**:
1. Install: `npm install @planetscale/database`
2. Update `api/lib/db.js` to use the PlanetScale adapter (see commented code)

If using **Supabase**:
1. Install: `npm install @supabase/supabase-js`
2. Update `api/lib/db.js` to use the Supabase client (see commented code)

### 6. Test Locally

```bash
# Start local development server
npm run dev

# Or with Vercel CLI
vercel dev
```

The app will be available at `http://localhost:3000`

### 7. Deploy

#### Deploy to Vercel

```bash
# Deploy
vercel --prod

# Or push to GitHub and connect to Vercel
git push origin main
```

Then connect your GitHub repo to Vercel:
1. Go to [vercel.com](https://vercel.com)
2. Import your repository
3. Vercel will auto-detect the project
4. Add environment variables in project settings
5. Deploy!

#### Deploy to Netlify

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Build: `npm run build` (or no build step needed)
3. Deploy: `netlify deploy --prod`
4. Add environment variables in Netlify dashboard

Or use Netlify's GitHub integration:
1. Go to [netlify.com](https://netlify.com)
2. Add new site from Git
3. Connect your repository
4. Build command: (leave empty or `npm run build`)
5. Publish directory: `/`
6. Add environment variables in Site settings > Environment variables

## 🔄 Data Migration

To migrate existing localStorage data:

1. **Export from old app:**
   - Open `savings_app_v16.html` in browser
   - Go to Settings tab
   - Click "Export JSON"
   - Save the file

2. **Import to new app:**
   - Option A: Use the import feature in the new app (via API)
   - Option B: Use a migration script (see below)

### Migration Script

Create `migrate-data.js`:

```javascript
import fetch from 'node-fetch';
import fs from 'fs';

const jsonData = JSON.parse(fs.readFileSync('exported-data.json', 'utf8'));

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

async function migrate() {
  // Import settings
  await fetch(`${API_BASE}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jsonData.settings)
  });

  // Import people
  for (const person of jsonData.people) {
    await fetch(`${API_BASE}/api/people`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(person)
    });
  }

  // Import goals
  for (const goal of jsonData.goals) {
    await fetch(`${API_BASE}/api/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal)
    });
  }

  // Import transactions
  for (const tx of jsonData.transactions) {
    await fetch(`${API_BASE}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx)
    });
  }

  // Import scenario rates
  await fetch(`${API_BASE}/api/scenario-rates`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jsonData.scenarioRates)
  });

  console.log('Migration complete!');
}

migrate().catch(console.error);
```

## 🐛 Troubleshooting

### Database Connection Issues

**Error: "Cannot find module '@vercel/postgres'"**
```bash
npm install @vercel/postgres
```

**Error: "Connection refused"**
- Check your database connection string
- Ensure database allows connections from Vercel/Netlify IPs
- For Neon: Check if IP allowlist includes Vercel IPs (usually not required)
- For PlanetScale: Ensure database is active (doesn't auto-sleep on free tier)

### API Errors

**CORS errors:**
- Check `vercel.json` headers configuration
- Ensure API routes return proper CORS headers

**404 on API routes:**
- Verify file structure matches Vercel/Netlify requirements
- For Vercel: Files in `/api` folder become `/api/*` routes
- For Netlify: Check `netlify.toml` configuration

### Environment Variables

**Variables not loading:**
- Restart dev server after adding env vars
- Check variable names match exactly (case-sensitive)
- For Vercel: Redeploy after adding env vars
- For Netlify: Rebuild after adding env vars

## 📚 Next Steps

1. ✅ Set up database
2. ✅ Run schema migration
3. ✅ Configure environment variables
4. ✅ Test API endpoints
5. ✅ Migrate frontend code (see next steps)
6. ✅ Deploy to production
7. ✅ Migrate existing data

## 🔗 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [PlanetScale Documentation](https://planetscale.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Netlify Documentation](https://docs.netlify.com)

