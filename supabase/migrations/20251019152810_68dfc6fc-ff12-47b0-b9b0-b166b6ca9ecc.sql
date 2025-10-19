-- Réinitialisation complète de la base de données
-- Suppression de toutes les données tout en gardant la structure

-- Désactiver temporairement les triggers pour accélérer la suppression
SET session_replication_role = 'replica';

-- Supprimer les données dans l'ordre des dépendances (du plus dépendant au moins)
TRUNCATE TABLE comment_votes CASCADE;
TRUNCATE TABLE post_votes CASCADE;
TRUNCATE TABLE bookmarks CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE user_follows CASCADE;
TRUNCATE TABLE space_invitations CASCADE;
TRUNCATE TABLE space_subscriptions CASCADE;
TRUNCATE TABLE space_moderators CASCADE;
TRUNCATE TABLE comment_media CASCADE;
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE post_media CASCADE;
TRUNCATE TABLE post_views CASCADE;
TRUNCATE TABLE posts CASCADE;
TRUNCATE TABLE spaces CASCADE;
TRUNCATE TABLE user_stats CASCADE;
TRUNCATE TABLE analytics_events CASCADE;
TRUNCATE TABLE otp_rate_limits CASCADE;
TRUNCATE TABLE phone_otp CASCADE;
TRUNCATE TABLE profiles CASCADE;

-- Réactiver les triggers
SET session_replication_role = 'origin';

-- Note: Les utilisateurs dans auth.users devront être supprimés manuellement 
-- via le dashboard Supabase si nécessaire