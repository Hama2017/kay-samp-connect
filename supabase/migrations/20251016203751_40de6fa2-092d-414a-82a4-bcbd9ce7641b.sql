-- Étape 1: Supprimer les SAMP Zones en doublon en gardant la plus récente
DELETE FROM spaces 
WHERE id NOT IN (
  SELECT DISTINCT ON (name) id
  FROM spaces
  ORDER BY name, created_at DESC
);

-- Étape 2: Ajouter la contrainte d'unicité sur le nom
ALTER TABLE spaces 
ADD CONSTRAINT spaces_name_unique UNIQUE (name);