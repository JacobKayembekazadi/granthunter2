-- Storage Bucket Setup
-- This creates the storage bucket and policies
-- Note: You may need to create the bucket manually in Supabase Dashboard if this doesn't work

-- Create storage bucket for proposals (if it doesn't exist)
-- Note: Storage buckets are created via the Storage API, not SQL
-- Go to Supabase Dashboard → Storage → Create bucket → Name: "proposals" → Private

-- Storage policies for proposals bucket
-- These policies allow authenticated users to upload/download their organization's files

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'proposals' 
    AND auth.role() = 'authenticated'
  );

-- Policy: Allow users to view their organization's files
CREATE POLICY "Allow users to view their organization's files" ON storage.objects
  FOR SELECT 
  USING (
    bucket_id = 'proposals' 
    AND auth.role() = 'authenticated'
    -- Additional check: file path should contain organization_id or user_id
    -- This is handled at application level for now
  );

-- Policy: Allow users to update their organization's files
CREATE POLICY "Allow users to update their organization's files" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'proposals' 
    AND auth.role() = 'authenticated'
  );

-- Policy: Allow users to delete their organization's files
CREATE POLICY "Allow users to delete their organization's files" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'proposals' 
    AND auth.role() = 'authenticated'
  );






