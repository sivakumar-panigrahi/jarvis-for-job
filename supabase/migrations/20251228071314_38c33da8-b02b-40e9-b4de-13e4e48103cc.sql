-- Create job_applications table to track when users apply to jobs
CREATE TABLE public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  job_title text NOT NULL,
  company_name text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own applications
CREATE POLICY "Users can view own applications" ON public.job_applications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own applications
CREATE POLICY "Users can track own applications" ON public.job_applications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);