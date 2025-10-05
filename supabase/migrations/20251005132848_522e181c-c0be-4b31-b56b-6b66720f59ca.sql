-- Ajouter une policy pour permettre à tout le monde de voir les votes des posts
-- Ceci est nécessaire pour compter les votes up/down dans l'edge function get-post
CREATE POLICY "Everyone can view all post votes for counting"
ON public.post_votes
FOR SELECT
TO public
USING (true);

-- Ajouter une policy similaire pour les votes de commentaires
CREATE POLICY "Everyone can view all comment votes for counting"
ON public.comment_votes
FOR SELECT
TO public
USING (true);