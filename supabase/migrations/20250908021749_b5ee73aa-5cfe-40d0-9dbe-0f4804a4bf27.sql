-- Add privacy settings to profiles table
ALTER TABLE public.profiles 
ADD COLUMN profile_visible boolean DEFAULT true,
ADD COLUMN show_email boolean DEFAULT false,
ADD COLUMN show_followers boolean DEFAULT true;

-- Update existing users to have default values
UPDATE public.profiles 
SET profile_visible = true, 
    show_email = false, 
    show_followers = true 
WHERE profile_visible IS NULL;