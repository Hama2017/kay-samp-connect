-- Activation RLS et politiques de sécurité pour toutes les tables

-- 1. Activer RLS sur toutes les tables
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- 2. Politiques pour les ESPACES
-- Tout le monde peut voir les espaces publics
CREATE POLICY "Public spaces are viewable by everyone" 
ON public.spaces 
FOR SELECT 
USING (is_public = true OR creator_id = auth.uid());

-- Seuls les créateurs peuvent modifier leurs espaces
CREATE POLICY "Creators can update their own spaces" 
ON public.spaces 
FOR UPDATE 
USING (creator_id = auth.uid());

-- Tout le monde peut créer un espace
CREATE POLICY "Users can create spaces" 
ON public.spaces 
FOR INSERT 
WITH CHECK (creator_id = auth.uid());

-- Seuls les créateurs peuvent supprimer leurs espaces
CREATE POLICY "Creators can delete their own spaces" 
ON public.spaces 
FOR DELETE 
USING (creator_id = auth.uid());

-- 3. Politiques pour les ABONNEMENTS AUX ESPACES
-- Les utilisateurs peuvent voir leurs propres abonnements
CREATE POLICY "Users can view their own subscriptions" 
ON public.space_subscriptions 
FOR SELECT 
USING (user_id = auth.uid());

-- Les utilisateurs peuvent s'abonner aux espaces
CREATE POLICY "Users can subscribe to spaces" 
ON public.space_subscriptions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Les utilisateurs peuvent se désabonner
CREATE POLICY "Users can unsubscribe from spaces" 
ON public.space_subscriptions 
FOR DELETE 
USING (user_id = auth.uid());

-- 4. Politiques pour les MODÉRATEURS
-- Seuls les créateurs et admin peuvent voir les modérateurs
CREATE POLICY "Space creators and admins can view moderators" 
ON public.space_moderators 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.spaces WHERE id = space_id AND creator_id = auth.uid())
  OR user_id = auth.uid()
);

-- Seuls les créateurs peuvent ajouter des modérateurs
CREATE POLICY "Space creators can add moderators" 
ON public.space_moderators 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.spaces WHERE id = space_id AND creator_id = auth.uid())
);

-- Seuls les créateurs peuvent supprimer des modérateurs
CREATE POLICY "Space creators can remove moderators" 
ON public.space_moderators 
FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.spaces WHERE id = space_id AND creator_id = auth.uid())
);

-- 5. Politiques pour les POSTS
-- Tout le monde peut voir les posts
CREATE POLICY "Everyone can view posts" 
ON public.posts 
FOR SELECT 
USING (true);

-- Les utilisateurs peuvent créer des posts
CREATE POLICY "Users can create posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (author_id = auth.uid());

-- Les auteurs peuvent modifier leurs posts
CREATE POLICY "Authors can update their own posts" 
ON public.posts 
FOR UPDATE 
USING (author_id = auth.uid());

-- Les auteurs peuvent supprimer leurs posts
CREATE POLICY "Authors can delete their own posts" 
ON public.posts 
FOR DELETE 
USING (author_id = auth.uid());

-- 6. Politiques pour les MÉDIAS DES POSTS
-- Tout le monde peut voir les médias
CREATE POLICY "Everyone can view post media" 
ON public.post_media 
FOR SELECT 
USING (true);

-- Seuls les auteurs des posts peuvent ajouter des médias
CREATE POLICY "Post authors can add media" 
ON public.post_media 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid())
);

-- Seuls les auteurs peuvent supprimer leurs médias
CREATE POLICY "Post authors can delete their media" 
ON public.post_media 
FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid())
);

-- 7. Politiques pour les VOTES SUR POSTS
-- Les utilisateurs peuvent voir tous les votes
CREATE POLICY "Everyone can view post votes" 
ON public.post_votes 
FOR SELECT 
USING (true);

-- Les utilisateurs peuvent voter
CREATE POLICY "Users can vote on posts" 
ON public.post_votes 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Les utilisateurs peuvent modifier leurs votes
CREATE POLICY "Users can update their own votes" 
ON public.post_votes 
FOR UPDATE 
USING (user_id = auth.uid());

-- Les utilisateurs peuvent supprimer leurs votes
CREATE POLICY "Users can delete their own votes" 
ON public.post_votes 
FOR DELETE 
USING (user_id = auth.uid());

-- 8. Politiques pour les COMMENTAIRES
-- Tout le monde peut voir les commentaires
CREATE POLICY "Everyone can view comments" 
ON public.comments 
FOR SELECT 
USING (true);

-- Les utilisateurs peuvent créer des commentaires
CREATE POLICY "Users can create comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (author_id = auth.uid());

-- Les auteurs peuvent modifier leurs commentaires
CREATE POLICY "Authors can update their own comments" 
ON public.comments 
FOR UPDATE 
USING (author_id = auth.uid());

-- Les auteurs peuvent supprimer leurs commentaires
CREATE POLICY "Authors can delete their own comments" 
ON public.comments 
FOR DELETE 
USING (author_id = auth.uid());

-- 9. Politiques pour les VOTES SUR COMMENTAIRES
-- Tout le monde peut voir les votes sur commentaires
CREATE POLICY "Everyone can view comment votes" 
ON public.comment_votes 
FOR SELECT 
USING (true);

-- Les utilisateurs peuvent voter sur les commentaires
CREATE POLICY "Users can vote on comments" 
ON public.comment_votes 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Les utilisateurs peuvent modifier leurs votes sur commentaires
CREATE POLICY "Users can update their own comment votes" 
ON public.comment_votes 
FOR UPDATE 
USING (user_id = auth.uid());

-- Les utilisateurs peuvent supprimer leurs votes sur commentaires
CREATE POLICY "Users can delete their own comment votes" 
ON public.comment_votes 
FOR DELETE 
USING (user_id = auth.uid());

-- 10. Politiques pour les FOLLOWS
-- Les utilisateurs peuvent voir qui ils suivent et qui les suit
CREATE POLICY "Users can view follow relationships" 
ON public.user_follows 
FOR SELECT 
USING (follower_id = auth.uid() OR following_id = auth.uid());

-- Les utilisateurs peuvent suivre d'autres utilisateurs
CREATE POLICY "Users can follow others" 
ON public.user_follows 
FOR INSERT 
WITH CHECK (follower_id = auth.uid());

-- Les utilisateurs peuvent arrêter de suivre
CREATE POLICY "Users can unfollow others" 
ON public.user_follows 
FOR DELETE 
USING (follower_id = auth.uid());

-- 11. Politiques pour les FAVORIS
-- Les utilisateurs peuvent voir leurs propres favoris
CREATE POLICY "Users can view their own bookmarks" 
ON public.bookmarks 
FOR SELECT 
USING (user_id = auth.uid());

-- Les utilisateurs peuvent ajouter des favoris
CREATE POLICY "Users can create bookmarks" 
ON public.bookmarks 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Les utilisateurs peuvent supprimer leurs favoris
CREATE POLICY "Users can delete their own bookmarks" 
ON public.bookmarks 
FOR DELETE 
USING (user_id = auth.uid());

-- 12. Politiques pour les NOTIFICATIONS
-- Les utilisateurs peuvent voir leurs propres notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (user_id = auth.uid());

-- Les utilisateurs peuvent marquer leurs notifications comme lues
CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (user_id = auth.uid());

-- Les utilisateurs peuvent supprimer leurs notifications
CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (user_id = auth.uid());

-- Le système peut créer des notifications
CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- 13. Politiques pour les ÉVÉNEMENTS ANALYTICS
-- Les utilisateurs peuvent voir leurs propres événements
CREATE POLICY "Users can view their own analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (user_id = auth.uid());

-- Le système peut créer des événements analytics
CREATE POLICY "System can create analytics events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- 14. Politiques pour les STATISTIQUES UTILISATEUR
-- Les utilisateurs peuvent voir leurs propres stats
CREATE POLICY "Users can view their own stats" 
ON public.user_stats 
FOR SELECT 
USING (user_id = auth.uid());

-- Les utilisateurs peuvent créer leurs stats
CREATE POLICY "Users can create their own stats" 
ON public.user_stats 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Les utilisateurs peuvent mettre à jour leurs stats
CREATE POLICY "Users can update their own stats" 
ON public.user_stats 
FOR UPDATE 
USING (user_id = auth.uid());

-- Trigger pour créer automatiquement les stats utilisateur
CREATE OR REPLACE FUNCTION public.create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_create_stats
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_user_stats();