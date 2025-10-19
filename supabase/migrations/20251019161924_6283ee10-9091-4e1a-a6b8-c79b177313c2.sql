-- Supprimer l'ancienne politique mal configurée
DROP POLICY IF EXISTS "Users can create notifications for invitations" ON notifications;

-- Créer une nouvelle politique qui permet la création de notifications
-- par l'utilisateur qui envoie une invitation
CREATE POLICY "Allow notification creation for space invitations"
ON notifications
FOR INSERT
WITH CHECK (
  -- Permettre à l'utilisateur d'envoyer des notifications pour ses propres invitations
  type = 'space_invitation' AND
  auth.uid() = actor_id AND
  EXISTS (
    SELECT 1 FROM spaces
    WHERE spaces.id = notifications.related_space_id
    AND spaces.creator_id = auth.uid()
  )
);

-- Ajouter une politique pour les autres types de notifications
CREATE POLICY "Users can create their own notifications"
ON notifications
FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR
  auth.uid() = actor_id
);