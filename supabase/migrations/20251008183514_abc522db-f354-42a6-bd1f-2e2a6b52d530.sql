-- Ajouter un champ pour indiquer si le profil est complété
ALTER TABLE public.profiles 
ADD COLUMN is_profile_completed BOOLEAN NOT NULL DEFAULT false;

-- Créer un index pour améliorer les performances
CREATE INDEX idx_profiles_completed ON public.profiles(is_profile_completed);

COMMENT ON COLUMN public.profiles.is_profile_completed IS 'Indique si l''utilisateur a complété son profil (username et full_name)';