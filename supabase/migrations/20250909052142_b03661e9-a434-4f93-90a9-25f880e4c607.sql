-- Add unique constraint on space names (case insensitive)
CREATE UNIQUE INDEX idx_spaces_name_unique ON spaces (LOWER(name));