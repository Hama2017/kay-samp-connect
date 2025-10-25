-- Update the check constraint to allow 'tiktok' as a valid media type
ALTER TABLE post_media 
DROP CONSTRAINT IF EXISTS post_media_media_type_check;

ALTER TABLE post_media 
ADD CONSTRAINT post_media_media_type_check 
CHECK (media_type IN ('image', 'video', 'gif', 'youtube', 'tiktok'));