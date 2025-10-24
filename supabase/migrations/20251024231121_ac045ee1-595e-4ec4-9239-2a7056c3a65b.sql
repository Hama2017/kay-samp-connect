-- Drop the public_profiles view as it bypasses RLS policies
-- The application already uses direct queries on the profiles table with proper RLS
-- and SECURITY DEFINER functions like get_safe_public_profile() for public access

DROP VIEW IF EXISTS public.public_profiles;