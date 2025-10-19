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
          profiles (
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
        console.error('Supabase error:', fetchError);
        throw fetchError;
      }

      console.log('Fetched subscriptions data:', data);

      const formattedSubscribers = data?.map(sub => {
        const profile = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles;
        return {
          id: sub.user_id,
          user_id: sub.user_id,
          username: profile?.username || 'Utilisateur',
          full_name: profile?.full_name,
          profile_picture_url: profile?.profile_picture_url,
          is_verified: profile?.is_verified,
          subscribed_at: sub.subscribed_at
        };
      }) || [];

      console.log('Formatted subscribers:', formattedSubscribers);
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