-- Modifier la politique RLS pour permettre la création de notifications lors des invitations
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

CREATE POLICY "Users can create notifications for invitations"
ON notifications
FOR INSERT
WITH CHECK (
  -- Permettre aux utilisateurs de créer des notifications lors d'invitations
  EXISTS (
    SELECT 1 FROM space_invitations
    WHERE space_invitations.inviter_id = auth.uid()
    AND space_invitations.invited_user_id = notifications.user_id
    AND notifications.type = 'space_invitation'
  )
  OR
  -- Permettre au système de créer d'autres types de notifications
  auth.uid() = user_id
);