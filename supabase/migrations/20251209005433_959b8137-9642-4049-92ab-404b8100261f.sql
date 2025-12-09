-- 1. Supprimer les anciennes politiques RLS problématiques pour les votes
DROP POLICY IF EXISTS "Everyone can view all post votes for counting" ON public.post_votes;
DROP POLICY IF EXISTS "Everyone can view all comment votes for counting" ON public.comment_votes;

-- 2. Créer de nouvelles politiques plus restrictives pour les votes
-- Les utilisateurs ne peuvent voir que leurs propres votes
-- Le comptage se fait via les colonnes votes_up/votes_down déjà dénormalisées

CREATE POLICY "Users can only view their own post votes"
ON public.post_votes
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can only view their own comment votes"
ON public.comment_votes
FOR SELECT
USING (user_id = auth.uid());

-- 3. Mettre à jour la fonction get_public_profile pour exclure le téléphone
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE(
  id uuid, 
  username text, 
  bio text, 
  profile_picture_url text, 
  cover_image_url text, 
  is_verified boolean, 
  profile_visible boolean, 
  followers_count integer, 
  following_count integer, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.bio,
    p.profile_picture_url,
    p.cover_image_url,
    p.is_verified,
    p.profile_visible,
    p.followers_count,
    p.following_count,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.id = profile_id 
    AND p.profile_visible = true;
END;
$$;

-- 4. Mettre à jour la fonction get_safe_public_profile pour exclure le téléphone
CREATE OR REPLACE FUNCTION public.get_safe_public_profile(profile_user_id uuid)
RETURNS TABLE(
  id uuid, 
  username text, 
  bio text, 
  profile_picture_url text, 
  cover_image_url text, 
  is_verified boolean, 
  followers_count integer, 
  following_count integer, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  profile_visible boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.bio,
    p.profile_picture_url,
    p.cover_image_url,
    p.is_verified,
    p.followers_count,
    p.following_count,
    p.created_at,
    p.updated_at,
    p.profile_visible
  FROM profiles p
  WHERE p.id = profile_user_id 
    AND p.profile_visible = true;
END;
$$;

-- 5. Créer une fonction pour obtenir les comptages de votes sans exposer les votants
CREATE OR REPLACE FUNCTION public.get_vote_counts(p_post_id uuid)
RETURNS TABLE(upvotes bigint, downvotes bigint, user_vote text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM post_votes WHERE post_id = p_post_id AND vote_type = 'up') as upvotes,
    (SELECT COUNT(*) FROM post_votes WHERE post_id = p_post_id AND vote_type = 'down') as downvotes,
    (SELECT vote_type FROM post_votes WHERE post_id = p_post_id AND user_id = auth.uid()) as user_vote;
END;
$$;

-- 6. Créer une fonction pour les votes de commentaires
CREATE OR REPLACE FUNCTION public.get_comment_vote_counts(p_comment_id uuid)
RETURNS TABLE(upvotes bigint, downvotes bigint, user_vote text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM comment_votes WHERE comment_id = p_comment_id AND vote_type = 'up') as upvotes,
    (SELECT COUNT(*) FROM comment_votes WHERE comment_id = p_comment_id AND vote_type = 'down') as downvotes,
    (SELECT vote_type FROM comment_votes WHERE comment_id = p_comment_id AND user_id = auth.uid()) as user_vote;
END;
$$;