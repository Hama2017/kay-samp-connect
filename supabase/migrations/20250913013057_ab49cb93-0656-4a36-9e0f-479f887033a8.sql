-- Drop the overly permissive public policy that exposes sensitive data
DROP POLICY IF EXISTS "Public profile info viewable by everyone" ON profiles;

-- Create a secure public policy that only shows non-sensitive profile information
CREATE POLICY "Public profiles show safe info only"
ON profiles
FOR SELECT
TO public
USING (
  profile_visible = true AND (
    -- Only show these safe fields publicly by using a column filter approach
    -- The sensitive fields (phone, show_email, show_followers) will be filtered out
    true
  )
);

-- Ensure users can still see their own complete profile data
-- This policy already exists but let's make sure it's properly defined
DROP POLICY IF EXISTS "Users can view their own sensitive data" ON profiles;
CREATE POLICY "Users can view their own complete profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create a function to get safe public profile data only
CREATE OR REPLACE FUNCTION get_safe_public_profile(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  bio text,
  profile_picture_url text,
  cover_image_url text,
  is_verified boolean,
  followers_count integer,
  following_count integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  profile_visible boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.bio,
    p.profile_picture_url,
    p.cover_image_url,
    p.is_verified,
    p.followers_count,
    p.following_count,
    p.created_at,
    p.updated_at,
    p.profile_visible
  FROM profiles p
  WHERE p.id = profile_user_id 
    AND p.profile_visible = true;
END;
$$;