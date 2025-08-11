-- Fix linter issues: enable RLS on mauritius_activities and set function search_path

-- Enable Row Level Security on activities table
ALTER TABLE public.mauritius_activities ENABLE ROW LEVEL SECURITY;

-- Allow public read-only access to activities
DROP POLICY IF EXISTS "Public can read activities" ON public.mauritius_activities;
CREATE POLICY "Public can read activities"
ON public.mauritius_activities
FOR SELECT
USING (true);

-- Optional: prevent writes from anonymous users for safety (no INSERT/UPDATE/DELETE policies)

-- Update function with a fixed search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;