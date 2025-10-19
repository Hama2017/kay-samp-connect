-- Ajouter une politique pour permettre à tout le monde de voir les profils publics
CREATE POLICY "Everyone can view public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (profile_visible = true);

-- Cette politique permet à tous les utilisateurs authentifiés de voir
-- les profils qui ont profile_visible = true (donc les profils publics)