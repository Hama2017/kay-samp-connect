-- Fonction pour incrémenter les vues des posts
CREATE OR REPLACE FUNCTION public.increment_post_views(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts 
  SET views_count = views_count + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;