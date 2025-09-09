-- Remove duplicate spaces (keep the oldest one for each name)
DELETE FROM spaces 
WHERE id IN (
  SELECT id 
  FROM (
    SELECT id, 
           ROW_NUMBER() OVER (
             PARTITION BY LOWER(name) 
             ORDER BY created_at ASC
           ) as rn
    FROM spaces
  ) ranked
  WHERE rn > 1
);

-- Add unique constraint on space names (case insensitive)  
CREATE UNIQUE INDEX idx_spaces_name_unique ON spaces (LOWER(name));