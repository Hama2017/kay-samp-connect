-- Update media_type check constraint to include 'youtube' type
ALTER TABLE post_media DROP CONSTRAINT post_media_media_type_check;
ALTER TABLE post_media ADD CONSTRAINT post_media_media_type_check CHECK (media_type = ANY (ARRAY['image'::text, 'video'::text, 'youtube'::text]));