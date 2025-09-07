-- Fonction pour vérifier si un email existe dans auth.users
CREATE OR REPLACE FUNCTION public.check_email_exists(email_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = email_input
  );
END;
$$;