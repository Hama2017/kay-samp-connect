-- Ajouter un enum pour les badges d'espaces
CREATE TYPE public.space_badge AS ENUM ('kaaysamp', 'factcheck', 'evenement');

-- Ajouter le champ badge à la table spaces
ALTER TABLE public.spaces 
ADD COLUMN badge public.space_badge;

-- Ajouter un champ pour définir qui peut publier dans l'espace
ALTER TABLE public.spaces 
ADD COLUMN who_can_publish TEXT[] DEFAULT ARRAY['subscribers']::TEXT[];

-- Créer un index pour améliorer les performances
CREATE INDEX idx_spaces_badge ON public.spaces(badge);
CREATE INDEX idx_spaces_who_can_publish ON public.spaces USING GIN(who_can_publish);