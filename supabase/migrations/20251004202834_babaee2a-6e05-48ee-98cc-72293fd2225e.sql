-- Ajouter une politique pour permettre aux créateurs d'espaces de supprimer les invitations
CREATE POLICY "Space creators can delete invitations"
ON space_invitations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM spaces
    WHERE spaces.id = space_invitations.space_id
    AND spaces.creator_id = auth.uid()
  )
);