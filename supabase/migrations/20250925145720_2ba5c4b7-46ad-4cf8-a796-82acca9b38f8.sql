-- Modification majeure : passage d'une catégorie unique à plusieurs catégories par espace
-- et ajout de catégories pour les posts

-- 1. Ajouter la nouvelle colonne categories (array) pour les espaces
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS categories text[];

-- 2. Migrer les données existantes de category vers categories
UPDATE public.spaces 
SET categories = ARRAY[category] 
WHERE category IS NOT NULL AND categories IS NULL;

-- 3. Supprimer l'ancienne colonne category après migration
ALTER TABLE public.spaces DROP COLUMN IF EXISTS category;

-- 4. Ajouter une contrainte pour s'assurer qu'il y a au moins une catégorie
ALTER TABLE public.spaces ADD CONSTRAINT check_at_least_one_category 
CHECK (categories IS NOT NULL AND array_length(categories, 1) > 0);

-- 5. Ajouter le champ categories pour les posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS categories text[];

-- 6. Index pour améliorer les performances de recherche sur les catégories
CREATE INDEX IF NOT EXISTS idx_spaces_categories ON public.spaces USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_posts_categories ON public.posts USING GIN(categories);