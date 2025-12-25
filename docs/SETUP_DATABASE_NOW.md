# 🚀 Database Setup - Ready to Run!

Since the MCP is still connected to the original account, let's set up your GrantHunter database using the SQL migrations. This is actually the standard approach and works perfectly!

## Quick Setup (5 minutes)

### Step 1: Enable pgvector Extension

1. Go to: https://supabase.com/dashboard/project/xvrqtrkrqrcgypghjlvu/sql/new
2. Paste this SQL:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Click **Run** (or press Ctrl+Enter)
4. Should see: "Success. No rows returned"

### Step 2: Run Full Database Schema

1. Still in SQL Editor, click **New query**
2. Open the file: `db/migrations/001_initial_schema.sql`
3. Copy the **entire file** (all 307 lines)
4. Paste into SQL Editor
5. Click **Run**
6. You should see multiple "Success" messages

This creates:
- ✅ All 10 database tables
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Triggers for auto-updating timestamps
- ✅ Vector index for RAG embeddings
- ✅ Function to sync auth users

### Step 3: Create Storage Bucket

1. Go to: https://supabase.com/dashboard/project/xvrqtrkrqrcgypghjlvu/storage/buckets
2. Click **Create bucket**
3. Name: `proposals`
4. **Public bucket:** Leave UNCHECKED (private)
5. Click **Create bucket**

### Step 4: Set Up Storage Policies

1. Click on the `proposals` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Select **For authenticated users** template
5. Policy name: `Allow authenticated uploads`
6. Policy definition:
   ```sql
   (bucket_id = 'proposals'::text) AND (auth.role() = 'authenticated'::text)
   ```
7. Click **Review** then **Save policy**

Or run the SQL from `db/migrations/002_storage_setup.sql`

### Step 5: Get Database Connection String

1. Go to: https://supabase.com/dashboard/project/xvrqtrkrqrcgypghjlvu/settings/database
2. Scroll to **Connection string**
3. Select **URI** tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password
6. Update `DATABASE_URL` in `.env.local`

---

## What Gets Created

### Tables:
- `organizations` - Company/org data
- `users` - User profiles (syncs with auth)
- `opportunities` - SAM.gov opportunities
- `search_agents` - Autonomous search agents
- `agent_runs` - Agent execution logs
- `proposals` - Proposal documents
- `proposal_sections` - Proposal sections
- `past_performance` - RAG knowledge base (with vector embeddings)
- `artifacts` - Generated documents
- `job_logs` - Proposal generation logs

### Security:
- Row Level Security (RLS) enabled on all tables
- Users can only see their organization's data
- Storage policies for authenticated uploads

### Performance:
- Indexes on all foreign keys
- Indexes on status fields
- Vector similarity search index for RAG

---

## Verify Setup

Run this query in SQL Editor to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see all 10 tables listed.

---

## Next Steps After Database Setup

1. ✅ Update `.env.local` with `DATABASE_URL`
2. ✅ Install dependencies: `npm install`
3. ✅ Start dev server: `npm run dev`
4. ✅ Test authentication by signing up

---

## Need Help?

If you get any errors:
- Check the error message
- Make sure you're in the correct project
- Verify pgvector extension was enabled first
- Share the error and I'll help fix it!




