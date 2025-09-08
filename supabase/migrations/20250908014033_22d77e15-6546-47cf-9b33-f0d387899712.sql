-- Fix security warnings by adding SET search_path to functions

CREATE OR REPLACE FUNCTION update_post_vote_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update post vote counts
  UPDATE posts 
  SET 
    votes_up = (
      SELECT COUNT(*) 
      FROM post_votes 
      WHERE post_id = COALESCE(NEW.post_id, OLD.post_id) 
      AND vote_type = 'up'
    ),
    votes_down = (
      SELECT COUNT(*) 
      FROM post_votes 
      WHERE post_id = COALESCE(NEW.post_id, OLD.post_id) 
      AND vote_type = 'down'
    )
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION update_post_comment_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update post comment count
  UPDATE posts 
  SET comments_count = (
    SELECT COUNT(*) 
    FROM comments 
    WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
  )
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION update_comment_vote_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update comment vote counts
  UPDATE comments 
  SET 
    votes_up = (
      SELECT COUNT(*) 
      FROM comment_votes 
      WHERE comment_id = COALESCE(NEW.comment_id, OLD.comment_id) 
      AND vote_type = 'up'
    ),
    votes_down = (
      SELECT COUNT(*) 
      FROM comment_votes 
      WHERE comment_id = COALESCE(NEW.comment_id, OLD.comment_id) 
      AND vote_type = 'down'
    )
  WHERE id = COALESCE(NEW.comment_id, OLD.comment_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION update_space_subscriber_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update space subscriber count
  UPDATE spaces 
  SET subscribers_count = (
    SELECT COUNT(*) 
    FROM space_subscriptions 
    WHERE space_id = COALESCE(NEW.space_id, OLD.space_id)
  )
  WHERE id = COALESCE(NEW.space_id, OLD.space_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION update_space_posts_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only update if space_id is provided
  IF COALESCE(NEW.space_id, OLD.space_id) IS NOT NULL THEN
    UPDATE spaces 
    SET posts_count = (
      SELECT COUNT(*) 
      FROM posts 
      WHERE space_id = COALESCE(NEW.space_id, OLD.space_id)
    )
    WHERE id = COALESCE(NEW.space_id, OLD.space_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION update_user_follow_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update follower count
  UPDATE profiles 
  SET followers_count = (
    SELECT COUNT(*) 
    FROM user_follows 
    WHERE following_id = COALESCE(NEW.following_id, OLD.following_id)
  )
  WHERE id = COALESCE(NEW.following_id, OLD.following_id);
  
  -- Update following count
  UPDATE profiles 
  SET following_count = (
    SELECT COUNT(*) 
    FROM user_follows 
    WHERE follower_id = COALESCE(NEW.follower_id, OLD.follower_id)
  )
  WHERE id = COALESCE(NEW.follower_id, OLD.follower_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;