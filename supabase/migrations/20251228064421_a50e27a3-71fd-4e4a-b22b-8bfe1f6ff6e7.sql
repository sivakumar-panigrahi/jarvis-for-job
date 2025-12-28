-- Make the resumes bucket public so files can be accessed
UPDATE storage.buckets SET public = true WHERE id = 'resumes';

-- Ensure proper RLS policies exist for the resumes bucket
DROP POLICY IF EXISTS "Users can upload their own resume" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own resume" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own resume" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view resumes" ON storage.objects;

-- Allow authenticated users to upload their resume
CREATE POLICY "Users can upload their own resume" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own resume
CREATE POLICY "Users can update their own resume" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access for resumes (since bucket is public)
CREATE POLICY "Anyone can view resumes" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resumes');