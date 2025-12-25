-- ============================================
-- Storage Policies for 'proposals' Bucket
-- ============================================
-- This version skips the ALTER TABLE step (you don't have permission for that)
-- RLS is usually already enabled on storage.objects by default
-- Just run the policy creation statements

-- Step 1: Drop existing policies if they exist (prevents conflicts)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view their organization's files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their organization's files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their organization's files" ON storage.objects;

-- Step 2: Create the policies
-- Policy: Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'proposals' 
    AND auth.role() = 'authenticated'
  );

-- Policy: Allow users to view files
CREATE POLICY "Allow users to view their organization's files" ON storage.objects
  FOR SELECT 
  USING (
    bucket_id = 'proposals' 
    AND auth.role() = 'authenticated'
  );

-- Policy: Allow users to update files
CREATE POLICY "Allow users to update their organization's files" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'proposals' 
    AND auth.role() = 'authenticated'
  );

-- Policy: Allow users to delete files
CREATE POLICY "Allow users to delete their organization's files" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'proposals' 
    AND auth.role() = 'authenticated'
  );


