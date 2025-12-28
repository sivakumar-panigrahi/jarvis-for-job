-- Add education columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN college_name TEXT,
ADD COLUMN department TEXT,
ADD COLUMN qualification TEXT,
ADD COLUMN graduation_percentage NUMERIC(5,2),
ADD COLUMN year_of_passout INTEGER;