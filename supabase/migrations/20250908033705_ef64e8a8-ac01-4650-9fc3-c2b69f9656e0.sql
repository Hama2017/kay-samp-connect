-- Créer une table pour les médias des commentaires (similaire à post_media)
CREATE TABLE public.comment_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'gif')),
  media_order INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur la table
ALTER TABLE public.comment_media ENABLE ROW LEVEL SECURITY;

-- Politique pour que tout le monde puisse voir les médias des commentaires
CREATE POLICY "Everyone can view comment media" 
ON public.comment_media 
FOR SELECT 
USING (true);

-- Politique pour que les auteurs de commentaires puissent ajouter des médias
CREATE POLICY "Comment authors can add media" 
ON public.comment_media 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM comments 
  WHERE comments.id = comment_media.comment_id 
  AND comments.author_id = auth.uid()
));

-- Politique pour que les auteurs de commentaires puissent supprimer leurs médias
CREATE POLICY "Comment authors can delete their media" 
ON public.comment_media 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM comments 
  WHERE comments.id = comment_media.comment_id 
  AND comments.author_id = auth.uid()
));