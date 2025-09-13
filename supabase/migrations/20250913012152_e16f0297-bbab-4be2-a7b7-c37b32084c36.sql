-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "System functions can create OTP codes" ON phone_otp;
DROP POLICY IF EXISTS "System functions can read OTP codes" ON phone_otp;
DROP POLICY IF EXISTS "System functions can update OTP codes" ON phone_otp;

-- Create secure policies that only allow service role access
-- These policies ensure only edge functions with service role can access OTP data
CREATE POLICY "Service role can manage OTP codes" 
ON phone_otp 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Ensure no regular users can access OTP codes
-- This policy explicitly denies all access to authenticated/anon users
CREATE POLICY "Deny user access to OTP codes"
ON phone_otp
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);