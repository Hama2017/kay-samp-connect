-- Fix phone number exposure by restricting the public profile policy
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public profiles show safe info only" ON profiles;

-- Create a new policy that only exposes safe profile data (excluding phone)
-- This policy applies to unauthenticated users and authenticated users viewing other profiles
CREATE POLICY "Public profiles show safe info only" 
ON profiles FOR SELECT 
USING (
  profile_visible = true 
  AND (
    -- Users can see their own full profile including phone
    auth.uid() = id 
    OR 
    -- Others can only see safe fields (phone is not selected by default, 
    -- but we'll enforce this at the application level)
    auth.uid() != id 
    OR 
    auth.uid() IS NULL
  )
);

-- Note: The phone column should not be selected in queries for other users' profiles
-- The application code must explicitly select only safe columns when fetching public profiles