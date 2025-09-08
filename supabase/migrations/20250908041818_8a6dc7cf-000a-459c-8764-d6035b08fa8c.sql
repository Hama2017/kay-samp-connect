-- Drop existing comment_media table if it exists
DROP TABLE IF EXISTS public.comment_media CASCADE;

-- Create comment_media table with proper foreign key constraint
CREATE TABLE public.comment_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL,
  media_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT fk_comment_media_comment_id 
    FOREIGN KEY (comment_id) 
    REFERENCES public.comments(id) 
    ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.comment_media ENABLE ROW LEVEL SECURITY;

-- Create policies for comment_media
CREATE POLICY "Everyone can view comment media" ON public.comment_media
  FOR SELECT USING (true);

CREATE POLICY "Comment authors can add media" ON public.comment_media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.comments 
      WHERE comments.id = comment_media.comment_id 
      AND comments.author_id = auth.uid()
    )
  );

CREATE POLICY "Comment authors can delete their media" ON public.comment_media
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.comments 
      WHERE comments.id = comment_media.comment_id 
      AND comments.author_id = auth.uid()
    )
  );