-- Add validation constraint to ensure space name is not empty or just whitespace
ALTER TABLE spaces 
ADD CONSTRAINT space_name_not_empty 
CHECK (LENGTH(TRIM(name)) > 0);