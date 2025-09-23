-- Supprimer l'utilisateur de test et nettoyer le cache

-- Supprimer le profil
DELETE FROM profiles WHERE id = '0cfd1a00-b8eb-4f95-b3fb-542a9f6f96c5';

-- Supprimer les stats utilisateur si elles existent
DELETE FROM user_stats WHERE user_id = '0cfd1a00-b8eb-4f95-b3fb-542a9f6f96c5';

-- Supprimer les événements analytics de cet utilisateur
DELETE FROM analytics_events WHERE user_id = '0cfd1a00-b8eb-4f95-b3fb-542a9f6f96c5';

-- Nettoyer les codes OTP pour ce numéro
DELETE FROM phone_otp WHERE phone = '+33775791439';

-- Nettoyer les limites de taux OTP pour ce numéro
DELETE FROM otp_rate_limits WHERE phone = '+33775791439';

-- Supprimer l'utilisateur de auth.users (cela se propagera via les cascades)
DELETE FROM auth.users WHERE id = '0cfd1a00-b8eb-4f95-b3fb-542a9f6f96c5';