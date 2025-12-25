# 🔧 Troubleshooting Storage Policies

If the storage policies aren't working, try these steps:

## Step 1: Verify Bucket Name

1. Go to: https://supabase.com/dashboard/project/xvrqtrkrqrcgypghjlvu/storage/buckets
2. Check the exact name of your bucket
3. **It MUST be exactly `proposals` (lowercase, no spaces)**

If it's named differently:
- Either rename it to `proposals`
- Or update the SQL to use your bucket name

## Step 2: Check for Existing Policies

1. Go to: Storage → Buckets → proposals → Policies tab
2. If you see any policies, **delete them all** first
3. Then run the SQL again

## Step 3: Run the Fixed SQL

Use `STORAGE_POLICIES_WORKING.sql` - it has better error handling.

**Copy the entire file and paste into SQL Editor, then run.**

## Step 4: If You Get Specific Errors

### Error: "relation storage.objects does not exist"
- This shouldn't happen, but if it does, the bucket might not be created properly
- Try deleting and recreating the bucket

### Error: "policy already exists"
- The DROP POLICY statements should handle this
- If not, manually delete policies in the Dashboard first

### Error: "permission denied"
- Make sure you're running this as the project owner
- Or use the service role key

## Step 5: Alternative - Use Dashboard UI

If SQL keeps failing, create policies via the Dashboard:

1. Go to: Storage → Buckets → proposals
2. Click **"Policies"** tab
3. Click **"New Policy"**
4. For each policy:
   - **Policy name:** "Allow authenticated uploads"
   - **Allowed operation:** INSERT
   - **Policy definition:**
     ```sql
     (bucket_id = 'proposals'::text) AND (auth.role() = 'authenticated'::text)
     ```
5. Repeat for SELECT, UPDATE, DELETE operations

## Step 6: Verify It Works

After creating policies, test by:

1. Go to Storage → proposals bucket
2. Try uploading a test file
3. If it works, policies are set up correctly!

---

## Quick Test Query

Run this to see if policies exist:

```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
```

You should see 4 policies listed.


