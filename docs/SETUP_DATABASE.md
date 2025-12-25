# Database Setup Instructions

Since the Supabase MCP doesn't have access to your project, follow these steps to set up the database manually.

## Step 1: Enable pgvector Extension

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/xvrqtrkrqrcgypghjlvu
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Paste this SQL:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

## Step 2: Run Database Schema Migration

1. Still in **SQL Editor**, click **New query** again
2. Open the file `db/migrations/001_initial_schema.sql` in this project
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run**
6. You should see multiple "Success" messages

This creates:
- All database tables
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for auto-updating timestamps
- Function to sync auth users with users table

## Step 3: Create Storage Bucket

1. Go to **Storage** in the left sidebar
2. Click **Create bucket**
3. Fill in:
   - **Name:** `proposals`
   - **Public bucket:** Leave UNCHECKED (private)
4. Click **Create bucket**

## Step 4: Set Up Storage Policies

1. Click on the `proposals` bucket you just created
2. Go to **Policies** tab
3. Click **New Policy**
4. Select **For authenticated users** template
5. Policy name: `Allow authenticated uploads`
6. Policy definition:
   ```sql
   (bucket_id = 'proposals'::text) AND (auth.role() = 'authenticated'::text)
   ```
7. Click **Review** then **Save policy**

Or run the SQL from `db/migrations/002_storage_setup.sql` in SQL Editor.

## Step 5: Get Database Connection String

1. Go to **Settings** (gear icon) → **Database**
2. Scroll to **Connection string** section
3. Select **URI** tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password
6. Update `DATABASE_URL` in `.env.local`

Example format:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## Step 6: Verify Setup

Run this query in SQL Editor to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- organizations
- users
- opportunities
- search_agents
- agent_runs
- proposals
- proposal_sections
- past_performance
- artifacts
- job_logs

## Troubleshooting

### "Extension vector does not exist"
- Make sure you ran `CREATE EXTENSION IF NOT EXISTS vector;` first
- Check that your Supabase project supports extensions

### "Permission denied"
- Make sure you're using the SQL Editor (not a restricted query tool)
- Check that you're logged in as the project owner

### "Table already exists"
- That's okay! The migration uses `CREATE TABLE IF NOT EXISTS`
- You can safely re-run the migration

### Storage bucket creation fails
- Create it manually in the Storage section
- Then run the storage policies SQL

## Next Steps

After database setup:
1. Update `.env.local` with your `DATABASE_URL`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Test authentication by signing up




