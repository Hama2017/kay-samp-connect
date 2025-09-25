import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Subscriber {
  id: string;
  user_id: string;
  username: string;
  full_name?: string;
  profile_picture_url?: string;
  is_verified?: boolean;
  subscribed_at: string;
}

export const useSpaceAdmin = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscribers = useCallback(async (spaceId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('space_subscriptions')
        .select(`
          user_id,
          subscribed_at,
          profiles!inner(
            id,
            username,
            full_name,
            profile_picture_url,
            is_verified
          )
        `)
        .eq('space_id', spaceId)
        .order('subscribed_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const formattedSubscribers = data?.map(sub => ({
        id: sub.profiles.id,
        user_id: sub.user_id,
        username: sub.profiles.username,
        full_name: sub.profiles.full_name,
        profile_picture_url: sub.profiles.profile_picture_url,
        is_verified: sub.profiles.is_verified,
        subscribed_at: sub.subscribed_at
      })) || [];

      setSubscribers(formattedSubscribers);
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    subscribers,
    isLoading,
    error,
    fetchSubscribers
  };
};