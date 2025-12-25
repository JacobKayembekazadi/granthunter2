# Fix MCP Connection & Complete Database Setup

## Issue
The MCP server `supabase-granthunter` is configured but Cursor may need a restart to load the new service role key, or the server name format may need adjustment.

## Quick Fix Options

### Option 1: Restart Cursor (Try This First)
1. **Completely close Cursor** (all windows)
2. **Reopen Cursor**
3. The MCP should now use the service role key
4. Ask me to test: "Can you access my GrantHunter project now?"

### Option 2: Verify MCP Config
The config should have the service role key (which it does now). If it still doesn't work after restart, the server name format might be the issue.

### Option 3: Use SQL Migrations (Works Regardless)
If MCP still doesn't work, run the SQL migrations manually - this is the standard approach anyway.

---

## Complete Database Setup (SQL Approach)

Since MCP may need additional configuration, here's the complete setup using SQL:

### Step 1: Enable pgvector
Go to: https://supabase.com/dashboard/project/xvrqtrkrqrcgypghjlvu/sql/new

Run:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Step 2: Run Full Schema
1. Open: `db/migrations/001_initial_schema.sql`
2. Copy entire file (307 lines)
3. Paste into Supabase SQL Editor
4. Run

### Step 3: Create Storage Bucket
1. Go to: Storage → Create bucket
2. Name: `proposals` (private)
3. Add policy for authenticated users

### Step 4: Update .env.local
Get database connection string from Settings → Database and update `DATABASE_URL`

---

## What I've Done

✅ Updated MCP config to use service role key (has full permissions)
✅ Created complete SQL migration files
✅ Ready to proceed once MCP connects or you run SQL manually

---

## Next Steps

1. **Restart Cursor completely**
2. **Test MCP**: Ask me "Can you see my GrantHunter project?"
3. **If MCP works**: I'll set up everything automatically
4. **If MCP doesn't work**: Run the SQL migrations manually (5 minutes)

Either way, your database will be set up! 🚀




