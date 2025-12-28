-- Create jobs table for active job postings
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  apply_url TEXT NOT NULL,
  posted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view active jobs
CREATE POLICY "Authenticated users can view active jobs" 
ON public.jobs 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true AND expires_at > now());

-- Create index for faster queries on active jobs
CREATE INDEX idx_jobs_active ON public.jobs (is_active, expires_at) WHERE is_active = true;