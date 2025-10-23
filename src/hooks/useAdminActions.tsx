import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAdminActions = () => {
  const [isLoading, setIsLoading] = useState(false);

  const banUser = useCallback(async (
    userId: string,
    reason: string
  ) => {
    setIsLoading(true);
    try {
      const bannedAt = new Date();
      
      // @ts-ignore - banned fields exist in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          banned: true,
          banned_at: bannedAt.toISOString(),
          banned_reason: reason
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Utilisateur banni définitivement');
      return true;
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Erreur lors du bannissement');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unbanUser = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      // @ts-ignore - banned fields exist in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          banned: false,
          banned_at: null,
          banned_reason: null
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Utilisateur débanni');
      return true;
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast.error('Erreur lors du débannissement');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast.success('Post supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Erreur lors de la suppression du post');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyUser = useCallback(async (userId: string, verified: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: verified })
        .eq('id', userId);

      if (error) throw error;

      toast.success(verified ? 'Utilisateur vérifié' : 'Vérification retirée');
      return true;
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Erreur lors de la mise à jour');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifySpace = useCallback(async (spaceId: string, verified: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('spaces')
        .update({ is_verified: verified })
        .eq('id', spaceId);

      if (error) throw error;

      toast.success(verified ? 'SAMP Zone vérifiée' : 'Vérification retirée');
      return true;
    } catch (error) {
      console.error('Error updating space verification:', error);
      toast.error('Erreur lors de la mise à jour');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    banUser,
    unbanUser,
    deletePost,
    verifyUser,
    verifySpace
  };
};
