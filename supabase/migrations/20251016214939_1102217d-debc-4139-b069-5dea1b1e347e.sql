-- Create post_views table to track unique views per user per post
CREATE TABLE IF NOT EXISTS public.post_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own views
CREATE POLICY "Users can view their own post views"
ON public.post_views
FOR SELECT
USING (user_id = auth.uid());

-- Policy: Users can insert their own views
CREATE POLICY "Users can insert their own post views"
ON public.post_views
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON public.post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON public.post_views(user_id);

-- Create function to increment view count only if user hasn't viewed the post
CREATE OR REPLACE FUNCTION public.increment_post_view_if_new(p_post_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  view_exists boolean;
BEGIN
  -- Check if user has already viewed this post
  SELECT EXISTS(
    SELECT 1 FROM post_views 
    WHERE post_id = p_post_id AND user_id = p_user_id
  ) INTO view_exists;
  
  -- If not viewed yet, insert view record and increment counter
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