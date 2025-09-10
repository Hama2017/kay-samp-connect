-- Add youtube_video_id column to post_media table for YouTube video support
ALTER TABLE post_media 
ADD COLUMN youtube_video_id TEXT;