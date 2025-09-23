-- Créer le profil manquant pour l'utilisateur existant
INSERT INTO profiles (id, username, full_name, phone) 
VALUES (
  '0cfd1a00-b8eb-4f95-b3fb-542a9f6f96c5',
  'hama_user', 
  'Hama😎🚀',
  '+33775791439'
) 
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  updated_at = now();

-- Corriger le trigger pour mieux gérer l'authentification par téléphone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer un profil pour tous les nouveaux utilisateurs
  INSERT INTO public.profiles (id, username, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'username', 
      CASE 
        WHEN NEW.phone IS NOT NULL THEN 'user_' || substr(NEW.id::text, 1, 8)
        ELSE 'user_' || substr(NEW.id::text, 1, 8)
      END
    ),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    NEW.phone
  )
  ON CONFLICT (id) DO NOTHING; -- Éviter les doublons
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;