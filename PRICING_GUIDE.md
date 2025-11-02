# 💰 Pricing Guide: Free vs Paid Plans

## Quick Answer

**✅ Everything you need is FREE for this savings app!**

- ✅ **Supabase**: Free tier is generous for personal/small apps
- ✅ **Google OAuth**: Completely free (no payment required)
- ✅ **Vercel**: Free tier for hosting
- ✅ **Neon**: Free tier for database (if you don't use Supabase)

## Detailed Breakdown

### Supabase (Database + Auth)

#### Free Tier (Recommended)
- ✅ **Database**: 500 MB storage
- ✅ **Bandwidth**: 2 GB/month
- ✅ **Authentication**: Unlimited users
- ✅ **API requests**: Unlimited
- ✅ **Row-Level Security**: Included
- ✅ **Realtime**: Included (2 million messages/month)
- ✅ **Storage**: 1 GB file storage
- ✅ **Edge Functions**: 500K invocations/month

**Perfect for:** Personal apps, small projects, MVPs

**Limits you might hit:**
- Database size (500 MB) - Unlikely for savings tracking
- Bandwidth (2 GB/month) - Only if you have thousands of active users

#### Paid Plans
- **Pro**: $25/month (8 GB database, 50 GB bandwidth)
- **Team**: $599/month (bigger limits, team features)

**When to upgrade:** Only if you exceed free tier limits (very unlikely for a savings app)

---

### Google OAuth (Sign in with Google)

#### Free Forever ✅
- ✅ **OAuth 2.0**: Completely free
- ✅ **Unlimited users**: No limits
- ✅ **No credit card required**
- ✅ **No usage limits**

**Note:** Google Cloud Console itself has a free tier, but OAuth doesn't require payment even if you exceed other Google Cloud services.

---

### Vercel (Hosting)

#### Free Tier (Hobby Plan)
- ✅ **Unlimited personal projects**
- ✅ **100 GB bandwidth/month**
- ✅ **100 builds/day**
- ✅ **Serverless Functions**: 100 GB-hours/month
- ✅ **Custom domains**: Free (you pay for domain separately)

**Perfect for:** Personal projects, small apps

**When to upgrade:**
- **Pro ($20/month)**: Only if you need team features or more bandwidth
- Unlikely needed for a savings app

---

### Neon (Database Alternative)

#### Free Tier
- ✅ **0.5 GB storage**
- ✅ **2 compute hours/month**
- ✅ **Auto-scaling to zero** (pauses when inactive)

**Limits:**
- Storage (0.5 GB) - Enough for thousands of transactions
- Compute hours (2/month) - Very limited, good for low-traffic apps

#### Paid Plans
- **Launch**: $19/month (10 GB storage, unlimited compute)

---

## Cost Comparison for Savings App

### Scenario 1: Low Usage (1-10 users)

| Service | Plan | Cost |
|---------|------|------|
| Supabase | Free | **$0** |
| Google OAuth | Free | **$0** |
| Vercel | Free | **$0** |
| **Total** | | **$0/month** |

### Scenario 2: Medium Usage (10-100 users)

| Service | Plan | Cost |
|---------|------|------|
| Supabase | Free | **$0** (still within limits) |
| Google OAuth | Free | **$0** |
| Vercel | Free | **$0** (still within limits) |
| **Total** | | **$0/month** |

### Scenario 3: High Usage (100+ users)

| Service | Plan | Cost |
|---------|------|------|
| Supabase | Pro | **$25/month** |
| Google OAuth | Free | **$0** |
| Vercel | Free or Pro | **$0-$20/month** |
| **Total** | | **$25-$45/month** |

---

## Free Tier Limits Breakdown

### Can I stay on free tier?

**Yes, if:**
- ✅ You have < 100 active users
- ✅ Each user has < 5 MB of data (very generous)
- ✅ < 2 GB API traffic/month
- ✅ < 100K transactions total

**You'll hit limits if:**
- ❌ Database exceeds 500 MB
- ❌ Bandwidth exceeds 2 GB/month
- ❌ You have thousands of daily active users

**For a savings app:** You'll likely **never** hit these limits unless it becomes very popular.

---

## Hidden Costs

### What's NOT free?

1. **Custom Domain** (Optional)
   - Domain name: ~$10-15/year (e.g., Namecheap, Google Domains)
   - Vercel provides free SSL certificate

2. **Email Service** (Optional)
   - If you want to send custom emails (not required for basic app)
   - Services like SendGrid: Free tier available (100 emails/day)

3. **Monitoring/Analytics** (Optional)
   - Basic monitoring: Free (Vercel analytics included)
   - Advanced analytics: Paid services like Plausible ($9/month)

---

## Cost Optimization Tips

1. **Use free tiers efficiently:**
   - Supabase free tier is very generous
   - Vercel free tier is perfect for personal projects
   - Google OAuth is always free

2. **Monitor usage:**
   - Check Supabase dashboard for database size
   - Monitor Vercel dashboard for bandwidth usage

3. **Optimize data storage:**
   - Delete old test data
   - Archive old transactions (optional)
   - Use JSON compression for large fields

4. **Upgrade only when needed:**
   - Don't upgrade preemptively
   - Free tiers are designed to be generous
   - Upgrade only if you actually hit limits

---

## When Do You Need to Pay?

### Supabase Free Tier Limits

You'll need to upgrade if:
- Database > 500 MB (unlikely for savings data)
- Bandwidth > 2 GB/month (thousands of users)
- Need team collaboration features

**Cost:** $25/month for Pro plan

### Vercel Free Tier Limits

You'll need to upgrade if:
- Need team features
- Need priority support
- Exceed 100 GB bandwidth/month (very unlikely)

**Cost:** $20/month for Pro plan

---

## Real-World Example

**Your savings app with 50 users:**

```
User 1: 100 transactions × 1 KB = 100 KB
User 2: 150 transactions × 1 KB = 150 KB
...
50 users: ~5 MB total data

Database usage: ~5 MB / 500 MB = 1% of free tier ✅

Monthly API calls: ~10,000 / unlimited = No limit ✅

Bandwidth: ~50 MB / 2 GB = 2.5% of free tier ✅
```

**Result:** **FREE forever!** 🎉

---

## Payment Methods (If Needed Later)

### Supabase
- Credit card
- PayPal
- Invoice (for business plans)

### Vercel
- Credit card
- PayPal
- Invoice (for Pro/Enterprise)

**Note:** Both services have generous free tiers - you likely won't need to pay.

---

## Summary

| Service | Free Tier | Paid Starting At | Need to Pay? |
|---------|-----------|------------------|--------------|
| **Supabase** | ✅ Very generous | $25/month | ❌ Only if you have 100+ users |
| **Google OAuth** | ✅ Always free | N/A | ❌ Never |
| **Vercel** | ✅ Generous | $20/month | ❌ Only if you need team features |
| **Neon** | ✅ Limited but enough | $19/month | ❌ Only if you have high traffic |

**Bottom line:** 
- ✅ **Everything is FREE** for a personal/small savings app
- ✅ **No credit card required** to start
- ✅ **Free tiers are generous** and won't limit you
- ✅ **You'll only pay if** the app becomes very popular (100+ active users)

---

## Frequently Asked Questions

### Q: Do I need a credit card to sign up?
**A:** No! All services (Supabase, Vercel, Google OAuth) can be used without a credit card on their free tiers.

### Q: Will I be charged automatically?
**A:** No. Free tiers don't require payment. You'll only be charged if you:
- Explicitly upgrade to a paid plan
- Exceed free tier limits (you'll get warnings first)

### Q: What happens if I exceed free tier?
**A:** You'll get warnings and emails. Services typically:
- Give you 30 days to upgrade or reduce usage
- Don't charge automatically
- May pause services if limits are exceeded

### Q: Can I switch back to free tier?
**A:** Yes! You can downgrade from paid to free at any time.

### Q: Is there a time limit on free tier?
**A:** No! Free tiers are permanent. They don't expire or require upgrades.

---

**TL;DR:** Everything you need is **100% FREE** for this savings app. No payment required! 🎉

