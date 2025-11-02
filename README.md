# 💰 Savings Dashboard — Cloud Edition

A comprehensive savings tracking and planning application with cloud database support. Track multiple contributors, set financial goals, analyze rate scenarios, and manage transactions—all with persistent cloud storage.

![Savings Dashboard](https://img.shields.io/badge/version-v17-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Bootstrap](https://img.shields.io/badge/bootstrap-5.3-purple)
![Deploy](https://img.shields.io/badge/deploy-Vercel-black)

## ✨ Features

### 📊 Dashboard Overview
- **Key Performance Indicators (KPIs)**
  - Monthly Income Tracking
  - Current Total Savings
  - Savings Rate Calculation
  - APY vs Inflation Comparison
  - Emergency Fund Ratio Analysis
  - Goals Completion Status

- **Interactive Charts**
  - Contribution Breakdown (by person)
  - Goal Timeline Visualization
  - Savings Consistency Tracking
  - Recent Transactions (6 months)
  - Monthly Contribution Trends

- **Smart Insights**
  - Automated financial recommendations
  - Goal progress tracking
  - Contribution streak monitoring

### 👥 People & Income Management
- Add multiple contributors/people
- Track individual savings balances
- Manage income sources with different frequencies (monthly, yearly, etc.)
- Set fixed or percentage-based contributions
- View per-person contribution breakdowns

### 🎯 Goals Management
- Create multiple savings goals with:
  - Target amounts
  - Deadline dates
  - Priority levels
  - Owner assignment (per person)
- Track goal progress and ETA
- Calculate monthly requirements vs. plan
- Visualize goal timelines

### 📈 Rate Scenarios Calculator
- Compare multiple savings rate scenarios (e.g., 5%, 10%, 15%, 20%)
- Select specific contributors and goals for analysis
- Project 2-year and 5-year future values
- Calculate goal achievement status for each scenario
- Identify key impacts and recommendations
- Export scenarios to Excel

### 💳 Transaction Tracking
- Record savings transactions with:
  - Date, amount, and person
  - Goal allocation (optional)
  - Notes and descriptions
- View transaction history and statistics
- Analyze trends with interactive charts
- Track top contributors
- Filter and sort transactions

### ☁️ Cloud Features (NEW!)
- **Persistent Storage**: Data saved to cloud database (Neon/PlanetScale/Supabase)
- **Multi-Device Sync**: Access your data from any device
- **Backup & Recovery**: Automatic backups with cloud storage
- **API-First Architecture**: RESTful API for all operations
- **Serverless Functions**: Deploy on Vercel/Netlify

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (for local development)
- A database account (Neon, PlanetScale, or Supabase)
- Vercel or Netlify account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/savings-app.git
   cd savings-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up database**
   - Choose a database provider (Neon recommended)
   - Create a new database
   - Run the schema: `database/schema.sql`

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Run locally**
   ```bash
   npm run dev
   ```

6. **Deploy**
   ```bash
   # Vercel
   vercel --prod
   
   # Or Netlify
   netlify deploy --prod
   ```

See [MIGRATION.md](MIGRATION.md) for detailed setup instructions.

## 🛠️ Technology Stack

- **Frontend:**
  - Bootstrap 5.3
  - Chart.js
  - Vanilla JavaScript (ES6+)

- **Backend:**
  - Serverless Functions (Vercel/Netlify)
  - RESTful API

- **Database:**
  - Neon (PostgreSQL) - Recommended for simplicity
  - Supabase (PostgreSQL) - Alternative if you need auth/realtime
  - PlanetScale (MySQL) - Alternative for MySQL-based apps
  
  See [DATABASE_COMPARISON.md](DATABASE_COMPARISON.md) for detailed comparison.

- **Deployment:**
  - Vercel (recommended)
  - Netlify (alternative)

## 📦 Project Structure

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
├── netlify.toml              # Netlify configuration
├── .env.example              # Environment variables template
├── MIGRATION.md              # Migration guide
└── README.md                 # This file
```

## 🔧 Configuration

### Database Setup

Choose one database provider:

#### Option A: Neon (PostgreSQL) - ⭐ Recommended

**Best for:** Simplest setup, pure PostgreSQL, serverless scaling

1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Set `POSTGRES_URL` environment variable

**Why Neon?** See [DATABASE_COMPARISON.md](DATABASE_COMPARISON.md) for detailed comparison.

#### Option B: Supabase (PostgreSQL)

**Best for:** Built-in auth, realtime features, file storage

1. Go to [supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables

### Environment Variables

Required environment variables (see `.env.example`):

```bash
# For Neon/PostgreSQL
POSTGRES_URL=postgresql://user:password@host:5432/database

# For PlanetScale (if using)
DATABASE_HOST=xxx.psdb.cloud
DATABASE_USERNAME=xxx
DATABASE_PASSWORD=xxx

# For Supabase (if using)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
```

## 📚 API Documentation

### Endpoints

- `GET /api/data` - Get all data (settings, people, goals, transactions, scenario rates)
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings
- `GET /api/people` - Get all people
- `POST /api/people` - Create person
- `PUT /api/people` - Update person
- `DELETE /api/people?id={id}` - Delete person
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `PUT /api/goals` - Update goal
- `DELETE /api/goals?id={id}` - Delete goal
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions` - Update transaction
- `DELETE /api/transactions?id={id}` - Delete transaction
- `GET /api/scenario-rates` - Get scenario rates
- `PUT /api/scenario-rates` - Update scenario rates

See [FRONTEND_MIGRATION.md](FRONTEND_MIGRATION.md) for frontend integration examples.

## 🔄 Migration from localStorage

If you're migrating from the old localStorage version:

1. **Export your data** from the old app (Settings → Export JSON)
2. **Set up the new architecture** (see MIGRATION.md)
3. **Import your data** using the migration script or API

See [MIGRATION.md](MIGRATION.md) for detailed migration steps.

## 🐛 Troubleshooting

### Database Connection Issues
- Verify your connection string is correct
- Check that your database allows connections from Vercel/Netlify IPs
- Ensure environment variables are set in your deployment platform

### API Errors
- Check browser console for error messages
- Verify API endpoints are accessible
- Check CORS configuration in `vercel.json` or `netlify.toml`

### Environment Variables
- Restart dev server after adding env vars
- For production, add vars in Vercel/Netlify dashboard
- Redeploy after adding environment variables

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Bootstrap team for the excellent framework
- Chart.js for beautiful, responsive charts
- Neon, PlanetScale, and Supabase for database hosting
- Vercel and Netlify for serverless hosting

## 📧 Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

---

**Happy Saving! 💰✨**
