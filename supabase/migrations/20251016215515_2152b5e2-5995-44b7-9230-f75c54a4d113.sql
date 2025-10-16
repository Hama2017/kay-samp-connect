-- Drop and recreate the function with SECURITY INVOKER instead of SECURITY DEFINER
DROP FUNCTION IF EXISTS public.increment_post_view_if_new(uuid, uuid);

CREATE OR REPLACE FUNCTION public.increment_post_view_if_new(p_post_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  view_exists boolean;
BEGIN
  -- Vérifier si l'utilisateur a déjà vu ce post
  SELECT EXISTS(
    SELECT 1 FROM post_views 
    WHERE post_id = p_post_id AND user_id = p_user_id
  ) INTO view_exists;
  
  -- Si pas encore vu, insérer et incrémenter
  IF NOT view_exists THEN
    INSERT INTO post_views (post_id, user_id)
    VALUES (p_post_id, p_user_id)
    ON CONFLICT (post_id, user_id) DO NOTHING;
    
    UPDATE posts 
    SET views_count = views_count + 1 
    WHERE id = p_post_id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;