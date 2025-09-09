-- Ajouter le champ cover_image_url à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN cover_image_url text;