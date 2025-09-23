-- Nettoyer toutes les données utilisateur mais garder les catégories de base

-- Supprimer tous les médias de commentaires
DELETE FROM comment_media;

-- Supprimer tous les votes de commentaires  
DELETE FROM comment_votes;

-- Supprimer tous les commentaires
DELETE FROM comments;

-- Supprimer tous les médias de posts
DELETE FROM post_media;

-- Supprimer tous les votes de posts
DELETE FROM post_votes;

-- Supprimer tous les posts
DELETE FROM posts;

-- Supprimer toutes les notifications
DELETE FROM notifications;

-- Supprimer tous les bookmarks
DELETE FROM bookmarks;

-- Supprimer toutes les relations de suivi
DELETE FROM user_follows;

-- Supprimer toutes les subscriptions aux espaces
DELETE FROM space_subscriptions;

-- Supprimer tous les modérateurs d'espaces
DELETE FROM space_moderators;

-- Supprimer tous les espaces
DELETE FROM spaces;

-- Supprimer toutes les stats utilisateur
DELETE FROM user_stats;

-- Supprimer tous les profils (cela cascade les auth.users via le trigger)
DELETE FROM profiles;

-- Supprimer les anciens codes OTP
DELETE FROM phone_otp;

-- Supprimer les limites de taux OTP
DELETE FROM otp_rate_limits;

-- Supprimer les événements analytics
DELETE FROM analytics_events;