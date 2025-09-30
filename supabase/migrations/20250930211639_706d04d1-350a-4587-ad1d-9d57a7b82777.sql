-- Add foreign key constraint for inviter_id to profiles table
ALTER TABLE public.space_invitations 
DROP CONSTRAINT IF EXISTS space_invitations_inviter_id_fkey;

ALTER TABLE public.space_invitations
ADD CONSTRAINT space_invitations_inviter_id_fkey 
FOREIGN KEY (inviter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for invited_user_id to profiles table
ALTER TABLE public.space_invitations 
DROP CONSTRAINT IF EXISTS space_invitations_invited_user_id_fkey;

ALTER TABLE public.space_invitations
ADD CONSTRAINT space_invitations_invited_user_id_fkey 
FOREIGN KEY (invited_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;