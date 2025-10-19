import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useUserFollow(targetUserId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Charger l'état initial du suivi et les compteurs
  useEffect(() => {
    const loadFollowStatus = async () => {
      if (!user?.id || !targetUserId || user.id === targetUserId) return;

      try {
        // Vérifier si l'utilisateur suit déjà la cible
        const { data: followData } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
          .maybeSingle();

        setIsFollowing(!!followData);

        // Charger les compteurs depuis le profil
        const { data: profileData } = await supabase
          .from('profiles')
          .select('followers_count, following_count')
          .eq('id', targetUserId)
          .maybeSingle();

        if (profileData) {
          setFollowersCount(profileData.followers_count || 0);
          setFollowingCount(profileData.following_count || 0);
        }

      } catch (error) {
        console.error('Error loading follow status:', error);
      }
    };

    if (targetUserId) {
      loadFollowStatus();
    }
  }, [user?.id, targetUserId]);

  const toggleFollow = async () => {
    if (!user?.id || !targetUserId || user.id === targetUserId) {
      toast({
        title: "Erreur",
        description: "Impossible de DemaySAMP à ce compte",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isFollowing) {
        // Se désabonner
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) throw error;

        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));

        toast({
          title: "DeSAMPNA",
          description: "Vous ne suivez plus cet utilisateur",
        });
      } else {
        // DemaySAMP
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });

        if (error) throw error;

        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);

        toast({
          title: "SAMPNA !",
          description: "Vous suivez maintenant cet utilisateur",
        });
      }

    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Méthode pour mettre à jour les compteurs depuis l'extérieur
  const updateCounts = (newFollowersCount: number, newFollowingCount: number) => {
    setFollowersCount(newFollowersCount);
    setFollowingCount(newFollowingCount);
  };

  return {
    isFollowing,
    followersCount,
    followingCount,
    isLoading,
    toggleFollow,
    updateCounts,
    canFollow: user?.id && targetUserId && user.id !== targetUserId
  };
}