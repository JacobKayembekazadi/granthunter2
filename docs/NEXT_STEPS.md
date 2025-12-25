# 🎯 Next Steps to Get Fully Functional

## ✅ What You Already Have:
- ✅ Supabase project URL
- ✅ Supabase publishable key (anon key)
- ✅ Supabase service role key
- ✅ Gemini API key
- ✅ SAM.gov API key

## 🔧 What You Still Need:

### 1. Supabase Database Connection String (REQUIRED)

**How to get it:**
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/xvrqtrkrqrcgypghjlvu
2. Click **Settings** (gear icon) in left sidebar
3. Click **Database** in settings menu
4. Scroll down to **Connection string** section
5. Select **URI** tab
6. Copy the connection string
7. Replace `[YOUR-PASSWORD]` with your database password (the one you set when creating the project)
8. Paste it in `.env.local` as `DATABASE_URL`

**Example format:**
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 2. Enable pgvector Extension (REQUIRED)

**In Supabase SQL Editor:**
1. Go to **SQL Editor** in left sidebar
2. Click **New query**
3. Paste this:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Click **Run** (or press Ctrl+Enter)
5. Should see "Success. No rows returned"

### 3. Create Storage Bucket (REQUIRED)

1. Go to **Storage** in left sidebar
2. Click **Create bucket**
3. Name: `proposals`
4. **Public bucket:** Leave UNCHECKED (private)
5. Click **Create bucket**
6. Click on the `proposals` bucket
7. Go to **Policies** tab
8. Click **New Policy**
9. Select **For authenticated users** template
10. Policy name: `Allow authenticated uploads`
11. Policy definition:
    ```sql
    (bucket_id = 'proposals'::text) AND (auth.role() = 'authenticated'::text)
    ```
12. Click **Review** then **Save policy**

### 4. Inngest Setup (REQUIRED for workflows)

**Quick setup:**
1. Go to https://inngest.com
2. Sign up (GitHub recommended)
3. Click **Create app**
4. Name: `grant-hunter`
5. Framework: Next.js
6. Copy **Event Key** → Add to `.env.local` as `INNGEST_EVENT_KEY`
7. Copy **Signing Key** → Add to `.env.local` as `INNGEST_SIGNING_KEY`

**Time:** ~3 minutes

### 5. Upstash Redis (REQUIRED for caching)

**Quick setup:**
1. Go to https://upstash.com
2. Sign up (GitHub recommended)
3. Click **Create Database**
4. Name: `grant-hunter-cache`
5. Type: **Regional** (cheaper)
6. Region: Choose closest to you
7. Plan: **Free tier**
8. Click **Create**
9. Click on your database
10. Scroll to **REST API** section
11. Copy **UPSTASH_REDIS_REST_URL** → Add to `.env.local`
12. Copy **UPSTASH_REDIS_REST_TOKEN** → Add to `.env.local`

**Time:** ~2 minutes

### 6. Anthropic (Claude) API Key (REQUIRED for proposal generation)

**Quick setup:**
1. Go to https://console.anthropic.com/
2. Sign up with email
3. Verify email
4. Go to **API Keys** section
5. Click **Create Key**
6. Name: `grant-hunter`
7. Copy key → Add to `.env.local` as `ANTHROPIC_API_KEY`
8. **Important:** Add payment method (required, but you get $5 free credit)

**Time:** ~5 minutes

### 7. Optional but Recommended

**DeepSeek API** (Very cheap, great for Scout role):
- Go to https://platform.deepseek.com/
- Sign up → Create API key
- Add to `.env.local` as `DEEPSEEK_API_KEY`

**OpenAI API** (For embeddings/RAG):
- Go to https://platform.openai.com/
- Sign up → Create API key
- Add to `.env.local` as `OPENAI_API_KEY`
- **Alternative:** Skip this and use local embeddings later

---

## 🚀 Quick Start (Minimum Setup)

To test the app RIGHT NOW with what you have:

1. **Get database connection string** (5 min)
2. **Enable pgvector** (1 min)
3. **Create storage bucket** (2 min)

Then you can:
- ✅ Run database migrations
- ✅ Test authentication
- ✅ See the dashboard
- ✅ Test Navigator voice (you have Gemini!)

**Run these commands:**
```bash
# Install dependencies
npm install

# Generate database migrations
npm run db:generate

# Apply migrations (or run SQL manually in Supabase)
npm run db:migrate

# Start dev server
npm run dev
```

---

## 📝 Update Your .env.local

After getting the database connection string, update `.env.local`:

```env
DATABASE_URL=postgresql://postgres:[YOUR-ACTUAL-PASSWORD]@db.xvrqtrkrqrcgypghjlvu.supabase.co:5432/postgres
```

Then add other keys as you get them.

---

## ⚡ Priority Order

**To test immediately:**
1. Database connection string ← **DO THIS FIRST**
2. Enable pgvector
3. Create storage bucket

**To get full functionality:**
4. Inngest (for workflows)
5. Anthropic (for proposals)
6. Redis (for caching)

**Optional enhancements:**
7. DeepSeek (cost savings)
8. OpenAI (better embeddings)

---

## 🆘 Need Help?

If you get stuck:
1. Check `SETUP_GUIDE.md` for detailed instructions
2. Let me know which step you're on
3. I can help troubleshoot any issues!




