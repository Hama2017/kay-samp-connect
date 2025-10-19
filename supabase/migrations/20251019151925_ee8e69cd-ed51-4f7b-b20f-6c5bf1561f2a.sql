-- Ajouter une contrainte de clé étrangère CASCADE sur les posts
-- Cela supprimera automatiquement les posts quand un utilisateur est supprimé

-- D'abord, supprimer les posts orphelins existants (s'il y en a)
DELETE FROM posts 
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = posts.author_id
);

-- Supprimer l'ancienne contrainte s'il y en a une
ALTER TABLE posts 
DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

-- Ajouter la nouvelle contrainte avec CASCADE
ALTER TABLE posts 
ADD CONSTRAINT posts_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Faire pareil pour les commentaires
DELETE FROM comments 
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = comments.author_id
);

ALTER TABLE comments 
DROP CONSTRAINT IF EXISTS comments_author_id_fkey;

ALTER TABLE comments 
ADD CONSTRAINT comments_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Et pour les espaces
DELETE FROM spaces 
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = spaces.creator_id
);

ALTER TABLE spaces 
DROP CONSTRAINT IF EXISTS spaces_creator_id_fkey;

ALTER TABLE spaces 
ADD CONSTRAINT spaces_creator_id_fkey 
FOREIGN KEY (creator_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;