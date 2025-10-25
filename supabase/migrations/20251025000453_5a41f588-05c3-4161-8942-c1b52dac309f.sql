-- Add tiktok_video_id column to post_media table for TikTok video support
ALTER TABLE post_media 
ADD COLUMN IF NOT EXISTS tiktok_video_id TEXT;