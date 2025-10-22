-- Add validation constraint to ensure full_name is not empty or just whitespace
ALTER TABLE profiles 
ADD CONSTRAINT full_name_not_empty 
CHECK (full_name IS NULL OR LENGTH(TRIM(full_name)) > 0);