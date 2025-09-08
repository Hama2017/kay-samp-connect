-- Function to update post vote counts
CREATE OR REPLACE FUNCTION update_post_vote_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Function to update post comment counts
CREATE OR REPLACE FUNCTION update_post_comment_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Function to update comment vote counts
CREATE OR REPLACE FUNCTION update_comment_vote_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Function to update space subscriber counts
CREATE OR REPLACE FUNCTION update_space_subscriber_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Function to update space posts count
CREATE OR REPLACE FUNCTION update_space_posts_count()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Function to update user followers/following counts
CREATE OR REPLACE FUNCTION update_user_follow_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Create triggers for post votes
DROP TRIGGER IF EXISTS trigger_update_post_vote_counts ON post_votes;
CREATE TRIGGER trigger_update_post_vote_counts
  AFTER INSERT OR UPDATE OR DELETE ON post_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_vote_counts();

-- Create triggers for comments
DROP TRIGGER IF EXISTS trigger_update_post_comment_counts ON comments;
CREATE TRIGGER trigger_update_post_comment_counts
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comment_counts();

-- Create triggers for comment votes
DROP TRIGGER IF EXISTS trigger_update_comment_vote_counts ON comment_votes;
CREATE TRIGGER trigger_update_comment_vote_counts
  AFTER INSERT OR UPDATE OR DELETE ON comment_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_vote_counts();

-- Create triggers for space subscriptions
DROP TRIGGER IF EXISTS trigger_update_space_subscriber_counts ON space_subscriptions;
CREATE TRIGGER trigger_update_space_subscriber_counts
  AFTER INSERT OR DELETE ON space_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_space_subscriber_counts();

-- Create triggers for space posts count
DROP TRIGGER IF EXISTS trigger_update_space_posts_count ON posts;
CREATE TRIGGER trigger_update_space_posts_count
  AFTER INSERT OR DELETE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_space_posts_count();

-- Create triggers for user follows
DROP TRIGGER IF EXISTS trigger_update_user_follow_counts ON user_follows;
CREATE TRIGGER trigger_update_user_follow_counts
  AFTER INSERT OR DELETE ON user_follows
  FOR EACH ROW
  EXECUTE FUNCTION update_user_follow_counts();