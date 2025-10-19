-- Ajouter une contrainte d'unicité sur le username
-- D'abord, identifier et supprimer les doublons potentiels en gardant le plus ancien

-- Supprimer les doublons en gardant le premier créé
DELETE FROM profiles a
USING profiles b
WHERE a.id > b.id 
AND a.username = b.username;

-- Ajouter la contrainte d'unicité
ALTER TABLE profiles
ADD CONSTRAINT profiles_username_unique UNIQUE (username);