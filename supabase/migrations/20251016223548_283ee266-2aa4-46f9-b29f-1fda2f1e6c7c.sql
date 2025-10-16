-- Fix phone number exposure by creating a secure public profiles view
-- and restricting direct table access

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public profiles show safe info only" ON profiles;

-- Create a more restrictive policy that denies direct SELECT for other users
-- Users can only SELECT their own complete profile from the table
CREATE POLICY "Users can only view their own complete profile via table" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Create a secure view that excludes sensitive data (phone, etc.)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  full_name,
  bio,
  profile_picture_url,
  cover_image_url,
  is_verified,
  profile_visible,
  followers_count,
  following_count,
  created_at,
  updated_at,
  show_followers,
  show_email
FROM profiles
WHERE profile_visible = true;

-- Grant SELECT permission on the view to authenticated and anonymous users
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Add comment to document the view's purpose
COMMENT ON VIEW public.public_profiles IS 'Public-safe view of user profiles that excludes sensitive data like phone numbers. Use this view for displaying public profile information.';
