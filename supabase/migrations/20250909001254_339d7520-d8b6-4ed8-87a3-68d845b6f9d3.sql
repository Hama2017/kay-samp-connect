-- Créer les triggers pour mettre à jour automatiquement les compteurs de suivi

-- Trigger pour les insertions dans user_follows
CREATE OR REPLACE TRIGGER trigger_user_follows_insert
  AFTER INSERT ON user_follows
  FOR EACH ROW
  EXECUTE FUNCTION update_user_follow_counts();

-- Trigger pour les suppressions dans user_follows  
CREATE OR REPLACE TRIGGER trigger_user_follows_delete
  AFTER DELETE ON user_follows
  FOR EACH ROW
  EXECUTE FUNCTION update_user_follow_counts();

-- Trigger pour les mises à jour dans user_follows (au cas où)
CREATE OR REPLACE TRIGGER trigger_user_follows_update
  AFTER UPDATE ON user_follows
  FOR EACH ROW
  EXECUTE FUNCTION update_user_follow_counts();