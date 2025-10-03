-- Allow space creators to view all subscribers of their spaces
CREATE POLICY "Space creators can view all space subscribers"
ON public.space_subscriptions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.spaces
    WHERE spaces.id = space_subscriptions.space_id
    AND spaces.creator_id = auth.uid()
  )
);