-- Nettoyer les profils orphelins (profils sans utilisateur auth correspondant)
DELETE FROM profiles
WHERE id = 'dcc378ae-6402-48b1-abd2-671457cc62ce';