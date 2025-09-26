-- Créer la table des catégories
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  color text,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insérer les catégories de base
INSERT INTO public.categories (name, description, display_order) VALUES
  ('Religion', 'Discussions sur les sujets religieux et spirituels', 1),
  ('Politique', 'Débats et actualités politiques', 2),
  ('Sport', 'Actualités et discussions sportives', 3),
  ('Technologie', 'Innovation, tech et numérique', 4),
  ('Cinema', 'Films, séries et divertissement', 5);

-- Activer RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les catégories
CREATE POLICY "Everyone can view categories" 
ON public.categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only admins can manage categories" 
ON public.categories 
FOR ALL 
USING (false);

-- Créer la table des invitations pour espaces
CREATE TABLE public.space_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id uuid NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  inviter_id uuid NOT NULL,
  invited_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invited_at timestamp with time zone NOT NULL DEFAULT now(),
  responded_at timestamp with time zone,
  message text,
  UNIQUE(space_id, invited_user_id)
);

-- Activer RLS pour les invitations
ALTER TABLE public.space_invitations ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les invitations
CREATE POLICY "Space creators can send invitations" 
ON public.space_invitations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM spaces 
    WHERE id = space_id AND creator_id = auth.uid()
  )
);

CREATE POLICY "Invited users can view their invitations" 
ON public.space_invitations 
FOR SELECT 
USING (invited_user_id = auth.uid() OR inviter_id = auth.uid());

CREATE POLICY "Invited users can respond to invitations" 
ON public.space_invitations 
FOR UPDATE 
USING (invited_user_id = auth.uid())
WITH CHECK (invited_user_id = auth.uid());

-- Créer des triggers pour les timestamps
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Ajouter une colonne background_image_url aux espaces
ALTER TABLE public.spaces 
ADD COLUMN background_image_url text;

-- Modifier la colonne who_can_publish pour supporter les invitations
-- Supprimer l'ancienne contrainte s'il y en a une
ALTER TABLE public.spaces 
ALTER COLUMN who_can_publish SET DEFAULT ARRAY['subscribers'::text];

-- Mettre à jour les notifications pour supporter les invitations
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS related_invitation_id uuid REFERENCES public.space_invitations(id) ON DELETE CASCADE;