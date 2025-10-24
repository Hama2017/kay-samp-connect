-- Ajouter des contraintes de longueur sur les posts
ALTER TABLE posts
ADD CONSTRAINT posts_title_length CHECK (char_length(title) <= 300),
ADD CONSTRAINT posts_content_length CHECK (char_length(content) <= 15000);

-- Ajouter des contraintes de longueur sur les spaces
ALTER TABLE spaces
ADD CONSTRAINT spaces_name_length CHECK (char_length(name) <= 100),
ADD CONSTRAINT spaces_description_length CHECK (char_length(description) <= 2000);

-- Ajouter des contraintes de longueur sur les comments
ALTER TABLE comments
ADD CONSTRAINT comments_content_length CHECK (char_length(content) <= 5000);

-- Ajouter des contraintes de longueur sur les profiles
ALTER TABLE profiles
ADD CONSTRAINT profiles_username_length CHECK (char_length(username) <= 50),
ADD CONSTRAINT profiles_full_name_length CHECK (char_length(full_name) <= 100),
ADD CONSTRAINT profiles_bio_length CHECK (char_length(bio) <= 1000);

-- Ajouter des contraintes de longueur sur les catégories
ALTER TABLE categories
ADD CONSTRAINT categories_name_length CHECK (char_length(name) <= 50),
ADD CONSTRAINT categories_description_length CHECK (char_length(description) <= 500);

-- Ajouter des contraintes de longueur sur les reports
ALTER TABLE reports
ADD CONSTRAINT reports_reason_length CHECK (char_length(reason) <= 100),
ADD CONSTRAINT reports_description_length CHECK (char_length(description) <= 2000);

-- Ajouter des contraintes de longueur sur les notifications
ALTER TABLE notifications
ADD CONSTRAINT notifications_title_length CHECK (char_length(title) <= 200),
ADD CONSTRAINT notifications_message_length CHECK (char_length(message) <= 1000);