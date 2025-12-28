-- ============================================
-- Storage Policies for 'proposals' Bucket
-- ============================================
-- Run this AFTER creating the 'proposals' bucket in Supabase Dashboard
-- You can run this entire file at once, or section by section if you get errors

-- Step 1: Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view their organization's files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their organization's files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their organization's files" ON storage.objects;

-- Step 3: Create the policies
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




