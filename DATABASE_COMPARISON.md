# Database Provider Comparison: Neon vs Supabase vs PlanetScale

## Quick Answer

**For this savings app:**
- ✅ **Neon** - Best for simplicity and pure Postgres
- ✅ **Supabase** - Best if you want built-in auth and realtime features
- ⚠️ **PlanetScale** - Good alternative, but uses MySQL (not PostgreSQL)

## Detailed Comparison

### Neon (PostgreSQL)

**Best for:** Simple, serverless Postgres with modern features

**Pros:**
- ✅ **Simplest setup** - Just Postgres, nothing extra
- ✅ **Serverless/auto-scaling** - Scales to zero when idle (free tier friendly)
- ✅ **Branching** - Create database branches like Git (great for testing)
- ✅ **Modern architecture** - Separates compute and storage
- ✅ **Full PostgreSQL** - Standard SQL, all Postgres features work
- ✅ **Vercel integration** - Native integration with Vercel
- ✅ **Generous free tier** - 0.5 GB storage, 2 compute hours/month
- ✅ **No vendor lock-in** - Standard Postgres, easy to migrate

**Cons:**
- ❌ **Just a database** - No built-in auth, storage, or functions
- ❌ **Auto-pauses on free tier** - Cold starts (~2-3 seconds) when inactive
- ❌ **Newer platform** - Smaller community than Supabase

**Use Neon if:**
- You want pure Postgres with no extra features
- You're building your own API (like this savings app)
- You prefer simplicity and modern tooling
- You want the easiest migration path

---

### Supabase (PostgreSQL)

**Best for:** Full-featured Backend-as-a-Service (BaaS)

**Pros:**
- ✅ **All-in-one platform** - Database + Auth + Storage + Realtime + Edge Functions
- ✅ **Built-in authentication** - User management, OAuth, magic links
- ✅ **Realtime subscriptions** - Live data updates (great for collaborative features)
- ✅ **File storage** - Upload/download files with access policies
- ✅ **Auto-generated APIs** - REST and GraphQL APIs from your schema
- ✅ **Larger community** - More tutorials and examples
- ✅ **Better for rapid development** - Less code to write for common features

**Cons:**
- ⚠️ **More complex** - More features = more to learn
- ⚠️ **Ties you to Supabase** - Harder to migrate away (auth APIs, etc.)
- ⚠️ **Free tier limits** - 500 MB database, 2 GB bandwidth
- ⚠️ **Can be overkill** - If you just need a database, extra features are unused

**Use Supabase if:**
- You want to add user authentication later
- You need realtime features (multiple users viewing data simultaneously)
- You want file uploads (QR code images, receipts, etc.)
- You prefer rapid development with built-in tools

---

### PlanetScale (MySQL)

**Best for:** MySQL-based applications, schema branching

**Pros:**
- ✅ **Schema branching** - Branch database schema like Git
- ✅ **Horizontal scaling** - Designed for high-scale applications
- ✅ **Serverless** - Auto-scales based on usage
- ✅ **Great for MySQL apps** - If you're already using MySQL

**Cons:**
- ❌ **MySQL, not PostgreSQL** - Requires different SQL syntax
- ❌ **Different connection method** - Need `@planetscale/database` package
- ❌ **Schema changes required** - Need to adapt `schema.sql` for MySQL
- ❌ **Less common** - Fewer examples and tutorials

**Use PlanetScale if:**
- You prefer MySQL over PostgreSQL
- You need horizontal scaling
- You're migrating from an existing MySQL database

---

## Recommendation for Savings App

### **Option 1: Supabase (⭐ Recommended for Financial Data)**

**Why:**
- ✅ **Security first** - Financial data requires authentication
- ✅ **Row-Level Security** - Users can only access their own data
- ✅ **Built-in auth** - No need to build authentication from scratch
- ✅ **Compliance ready** - GDPR, encryption, audit logs
- ✅ **Future-proof** - Easy to add features like sharing, realtime sync

**Migration path:**
```bash
1. Create Supabase project
2. Run schema-supabase.sql
3. Set environment variables
4. Deploy to Vercel
5. Done! 🎉
```

### **Option 2: Neon (For Single-User Apps)**

**Why:**
- If you plan to add user authentication (multiple users, sharing data)
- Built-in realtime = live updates if multiple devices are viewing
- File storage = could store receipts/QR code images
- Edge functions = could move some API logic to Supabase

**Migration path:**
```bash
1. Create Supabase project
2. Run schema.sql
3. Update api/lib/db.js to use Supabase client
4. Optionally use Supabase Auth (add later)
```

---

## Migration Between Providers

**Neon ↔ Supabase** - Both are PostgreSQL, so migration is straightforward:
1. Export data from source
2. Import to destination
3. Update connection string

**PostgreSQL ↔ MySQL** (e.g., Neon ↔ PlanetScale) - More complex:
- Need to convert SQL syntax
- Data type differences
- Use migration tools or scripts

---

## Feature Comparison Matrix

| Feature | Neon | Supabase | PlanetScale |
|---------|------|----------|-------------|
| **Database** | PostgreSQL | PostgreSQL | MySQL |
| **Serverless** | ✅ Auto-scaling | ✅ | ✅ |
| **Free Tier** | ✅ 0.5 GB | ✅ 500 MB | ✅ 5 GB |
| **Branching** | ✅ Database branches | ❌ | ✅ Schema branches |
| **Authentication** | ❌ | ✅ Built-in | ❌ |
| **Realtime** | ❌ | ✅ Subscriptions | ❌ |
| **File Storage** | ❌ | ✅ Built-in | ❌ |
| **Auto APIs** | ❌ | ✅ REST/GraphQL | ❌ |
| **Edge Functions** | ❌ | ✅ | ❌ |
| **Vercel Integration** | ✅ Native | ⚠️ Manual | ⚠️ Manual |
| **Complexity** | ⭐ Simple | ⭐⭐⭐ Full platform | ⭐⭐ Medium |
| **Best For** | Pure DB | Full BaaS | MySQL apps |

---

## Cost Comparison (Free Tier)

| Provider | Database Size | Compute | Bandwidth | Extra Features |
|----------|---------------|---------|-----------|----------------|
| **Neon** | 0.5 GB | 2 hours/month | Unlimited | None |
| **Supabase** | 500 MB | Always on | 2 GB/month | Auth, Storage, Realtime |
| **PlanetScale** | 5 GB | Always on | 1 billion reads/month | Schema branching |

**Note:** All free tiers are generous for this savings app. You likely won't hit limits.

---

## Final Recommendation

For **this savings app migration (with financial data):**

1. **Use Supabase** ✅ **RECOMMENDED**
   - **Security is critical** for financial data
   - Built-in authentication prevents unauthorized access
   - Row-Level Security ensures data isolation
   - Compliance features built-in

2. **Only use Neon if:**
   - This is a single-user app (no need for accounts)
   - You're building your own auth system
   - You prefer minimal dependencies

3. **Skip PlanetScale** (for now)
   - Unless you have a specific MySQL requirement
   - PostgreSQL is more common for new projects

---

## Quick Setup Comparison

### Neon Setup
```bash
1. Sign up at neon.tech
2. Create project → Copy connection string
3. Run schema.sql in SQL editor
4. Add POSTGRES_URL to Vercel
5. Deploy! ✅
```

### Supabase Setup
```bash
1. Sign up at supabase.com
2. Create project → Wait ~2 minutes
3. Go to SQL Editor → Run schema.sql
4. Go to Settings → Copy connection string
5. Add SUPABASE_URL + SUPABASE_ANON_KEY to Vercel
6. Update api/lib/db.js (uncomment Supabase code)
7. Deploy! ✅
```

**Winner for speed:** Neon (fewer steps)

---

## When to Switch

**Switch from Neon → Supabase when:**
- You want to add user accounts
- You need realtime collaborative features
- You want to store files (receipts, images)

**Switch from Supabase → Neon when:**
- You realize you don't need the extra features
- You want simpler architecture
- You prefer standard Postgres tooling

Both are PostgreSQL, so switching is straightforward! ✅

---

**TL;DR:** Start with Neon for simplicity. Switch to Supabase if you need auth/realtime later.

