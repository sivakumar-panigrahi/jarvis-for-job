-- Add resume columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN resume_url TEXT,
ADD COLUMN ats_score INTEGER;

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false);

-- Storage policies for resumes bucket
CREATE POLICY "Users can upload own resume"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own resume"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own resume"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own resume"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);