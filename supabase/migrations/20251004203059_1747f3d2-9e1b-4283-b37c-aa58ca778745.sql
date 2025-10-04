-- Ajouter une politique pour permettre aux créateurs d'espaces de supprimer les abonnés
CREATE POLICY "Space creators can remove subscribers"
ON space_subscriptions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM spaces
    WHERE spaces.id = space_subscriptions.space_id
    AND spaces.creator_id = auth.uid()
  )
);