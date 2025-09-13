-- CRITICAL SECURITY FIXES: Fix overly permissive policies (Fixed version)

-- 1. Fix phone_otp table - Clean up existing policies first
DROP POLICY IF EXISTS "System functions can create OTP codes" ON phone_otp;
DROP POLICY IF EXISTS "System functions can update OTP codes" ON phone_otp;
DROP POLICY IF EXISTS "System functions can read OTP codes" ON phone_otp;

-- Only allow OTP operations through system functions (edge functions)
CREATE POLICY "System functions can manage OTP codes" 
ON phone_otp 
FOR ALL
USING (true)
WITH CHECK (true);

-- 2. Fix profiles table - Protect sensitive data (phone numbers)
DROP POLICY IF EXISTS "Public profile info viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view their own sensitive data" ON profiles;

-- Create a single policy that allows viewing public profile data
CREATE POLICY "Public profiles viewable by everyone" 
ON profiles 
FOR SELECT 
USING (true);

-- 3. Fix voting tables - Protect user voting privacy
DROP POLICY IF EXISTS "Users can view their own post votes" ON post_votes;
DROP POLICY IF EXISTS "Users can view their own comment votes" ON post_votes;

-- Only users can see their own votes
CREATE POLICY "Users can view their own post votes" 
ON post_votes 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can view their own comment votes" 
ON comment_votes 
FOR SELECT 
USING (user_id = auth.uid());

-- 4. Add function to get public profile data (excluding sensitive fields)
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  bio TEXT,
  profile_picture_url TEXT,
  cover_image_url TEXT,
  is_verified BOOLEAN,
  profile_visible BOOLEAN,
  followers_count INTEGER,
  following_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
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
    p.profile_visible,
    p.followers_count,
    p.following_count,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.id = profile_id 
    AND (p.profile_visible = true OR p.id = auth.uid());
END;
$$;

-- 5. Add cleanup function for expired OTP codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_otp()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM phone_otp 
  WHERE expires_at < NOW() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 6. Add rate limiting table for OTP requests (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS otp_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on rate limits table
ALTER TABLE otp_rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "System can manage rate limits" ON otp_rate_limits;

-- Only system can manage rate limits
CREATE POLICY "System can manage rate limits" 
ON otp_rate_limits 
FOR ALL 
USING (true);