-- Fix comment_media table with proper foreign key
CREATE TABLE IF NOT EXISTS public.comment_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL,
  media_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.comment_media ENABLE ROW LEVEL SECURITY;

-- Create policies for comment_media
CREATE POLICY "Comment media is viewable by everyone" ON public.comment_media
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comment media" ON public.comment_media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.comments 
      WHERE comments.id = comment_media.comment_id 
      AND comments.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own comment media" ON public.comment_media
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.comments 
      WHERE comments.id = comment_media.comment_id 
      AND comments.author_id = auth.uid()
    )
  );