-- Drop the old unique constraint on name only
DROP INDEX idx_spaces_name_unique;

-- Add unique constraint on name + category combination (case insensitive for name)
CREATE UNIQUE INDEX idx_spaces_name_category_unique ON spaces (LOWER(name), category);