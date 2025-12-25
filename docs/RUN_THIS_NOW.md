# ⚡ Run Database Setup Now (5 Minutes)

The MCP connection needs additional configuration. Let's set up your database using SQL directly - this is the standard approach and works perfectly!

## 🚀 Quick Steps

### 1. Enable pgvector (30 seconds)
1. Open: https://supabase.com/dashboard/project/xvrqtrkrqrcgypghjlvu/sql/new
2. Paste and run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### 2. Run Full Schema (2 minutes)
1. In the same SQL Editor, click **New query**
2. Open file: `db/migrations/001_initial_schema.sql`
3. **Copy the ENTIRE file** (all 307 lines)
4. Paste into SQL Editor
5. Click **Run** (or Ctrl+Enter)

✅ This creates all tables, indexes, RLS policies, and triggers!

### 3. Create Storage Bucket (1 minute)
1. Go to: https://supabase.com/dashboard/project/xvrqtrkrqrcgypghjlvu/storage/buckets
2. Click **Create bucket**
3. Name: `proposals`
4. Keep it **private** (uncheck public)
5. Click **Create**

### 4. Update .env.local (1 minute)
1. Go to: https://supabase.com/dashboard/project/xvrqtrkrqrcgypghjlvu/settings/database
2. Copy the **Connection string (URI)**
3. Replace `[YOUR-PASSWORD]` with your database password
4. Update `DATABASE_URL` in `.env.local`

## ✅ Done!

After these steps:
- Database is fully set up
- All tables created
- Security policies enabled
- Ready for development!

## 🔍 Verify It Worked

Run this in SQL Editor:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see 10 tables: organizations, users, opportunities, search_agents, agent_runs, proposals, proposal_sections, past_performance, artifacts, job_logs

---

**Once you've run the SQL, let me know and I'll verify everything is set up correctly!** 🎉



