# ✅ Verify Database Setup & Complete Configuration

Since you've run the SQL migrations, let's verify everything is working and complete the setup!

## Step 1: Verify Database Tables (30 seconds)

Run this in Supabase SQL Editor to verify all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected result:** You should see 10 tables:
- artifacts
- agent_runs
- job_logs
- opportunities
- organizations
- past_performance
- proposal_sections
- proposals
- search_agents
- users

## Step 2: Verify pgvector Extension (30 seconds)

Run this to verify pgvector is enabled:

```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

**Expected result:** Should return 1 row showing the vector extension.

## Step 3: Create Storage Bucket (1 minute)

1. Go to: https://supabase.com/dashboard/project/xvrqtrkrqrcgypghjlvu/storage/buckets
2. Click **"New bucket"** or **"Create bucket"**
3. Name: `proposals`
4. **Public bucket:** Leave **UNCHECKED** (keep it private)
5. Click **"Create bucket"**

## Step 4: Set Up Storage Policies (1 minute)

**IMPORTANT:** Make sure you've created the `proposals` bucket first (Step 3)!

After creating the bucket, run the SQL from `STORAGE_POLICIES_SIMPLE.sql`:

1. Open `STORAGE_POLICIES_SIMPLE.sql` in your project
2. Copy the entire file
3. Paste into Supabase SQL Editor
4. Click **Run** (or Ctrl+Enter)
5. Should see "Success" messages

**Note:** This version skips the ALTER TABLE step (you don't have permission for that). RLS is already enabled on storage.objects by default in Supabase.

**If you get "policy already exists" error:**
- The DROP POLICY statements will handle this automatically
- Or manually delete existing policies in: Storage → Buckets → proposals → Policies tab

## Step 5: Get Database Connection String (1 minute)

1. Go to: https://supabase.com/dashboard/project/xvrqtrkrqrcgypghjlvu/settings/database
2. Scroll to **"Connection string"**
3. Click the **"URI"** tab
4. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xvrqtrkrqrcgypghjlvu.supabase.co:5432/postgres`)
5. Replace `[YOUR-PASSWORD]` with your actual database password
6. Update `DATABASE_URL` in `.env.local`

**Don't know your password?**
- Go to: Settings → Database → Reset database password
- Or use the password you set when creating the project

## Step 6: Update .env.local

Make sure your `.env.local` has:

```env
# Database (update with your password)
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.xvrqtrkrqrcgypghjlvu.supabase.co:5432/postgres

# Supabase (already set ✅)
NEXT_PUBLIC_SUPABASE_URL=https://xvrqtrkrqrcgypghjlvu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_FX14Enlcyz-ZXhEly9Ol9A_Yih-PTeE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cnF0cmtycXJjZ3lwZ2hqbHZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NzgzMCwiZXhwIjoyMDgyMTczODMwfQ.xvjmsSUS_E-9-78akuohWx_Bdj1H8KXRDR81Eh3vp1U

# AI Keys (already set ✅)
GEMINI_API_KEY=AIzaSyCSLlthr_RcWJ2LouKz03PCtsX3uDQujO0
SAM_GOV_API_KEY=SAM-3b71bf5a-37bd-4082-bbeb-fb3aecab124b
```

## Step 7: Test the Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```

3. Open: http://localhost:3000
4. Try signing up - this will test:
   - Database connection ✅
   - Auth setup ✅
   - User creation trigger ✅

## ✅ What's Complete

- ✅ Database schema (10 tables)
- ✅ Row Level Security policies
- ✅ Indexes for performance
- ✅ Vector extension for RAG
- ✅ Auto-sync with Supabase Auth
- ✅ Storage bucket (after Step 3)
- ✅ Storage policies (after Step 4)

## ⏳ Still Need (Optional for now)

- Inngest (for background jobs)
- Upstash Redis (for caching/rate limiting)
- Anthropic API key (for Claude models)
- DeepSeek API key (optional, for Scout agent)

These can be added later as you need them!

---

**Once you've completed Steps 1-6, let me know and I'll help test everything!** 🚀

