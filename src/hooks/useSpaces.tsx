import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Space {
  id: string;
  name: string;
  description?: string;
  category: string;
  cover_image_url?: string;
  is_verified: boolean;
  is_public: boolean;
  creator_id: string;
  subscribers_count: number;
  posts_count: number;
  rules?: string[];
  created_at: string;
  updated_at: string;
  // Relations
  profiles: {
    id: string;
    username: string;
    profile_picture_url?: string;
  };
  is_subscribed?: boolean;
  is_moderator?: boolean;
}

export interface CreateSpaceData {
  name: string;
  description?: string;
  category: string;
  cover_image_url?: string;
  is_public?: boolean;
  rules?: string[];
}

export function useSpaces() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSpaces = useCallback(async (filters?: {
    category?: string;
    search?: string;
    sort_by?: 'popular' | 'recent' | 'subscribers';
    user_spaces?: boolean;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('spaces')
        .select(`
          *,
          profiles (
            id,
            username,
            profile_picture_url
          )
        `);

      // Filter by public spaces unless viewing user's own spaces
      if (!filters?.user_spaces) {
        query = query.eq('is_public', true);
      } else if (user) {
        query = query.eq('creator_id', user.id);
      }

      // Apply category filter
      if (filters?.category && filters.category !== 'Tous') {
        query = query.eq('category', filters.category);
      }

      // Apply search filter
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply sorting
      switch (filters?.sort_by) {
        case 'subscribers':
          query = query.order('subscribers_count', { ascending: false });
          break;
        case 'popular':
          query = query.order('posts_count', { ascending: false });
          break;
        default: // recent
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      // Check subscription status for each space
      if (user && data) {
        const spaceIds = data.map(space => space.id);
        const { data: subscriptions } = await supabase
          .from('space_subscriptions')
          .select('space_id')
          .eq('user_id', user.id)
          .in('space_id', spaceIds);

        const subscribedSpaceIds = new Set(subscriptions?.map(sub => sub.space_id) || []);

        const spacesWithSubscription = data.map(space => ({
          ...space,
          is_subscribed: subscribedSpaceIds.has(space.id)
        }));

        setSpaces(spacesWithSubscription);
      } else {
        setSpaces(data || []);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching spaces:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createSpace = useCallback(async (spaceData: CreateSpaceData) => {
    if (!user) throw new Error('User must be authenticated');

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('spaces')
        .insert({
          ...spaceData,
          creator_id: user.id,
          is_public: spaceData.is_public ?? true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Espace créé !",
        description: `L'espace "${spaceData.name}" a été créé avec succès`,
      });

      // Refresh spaces
      fetchSpaces();
      return data;
    } catch (err: any) {
      setError(err.message);
      
      // Check if it's a duplicate name error
      const isDuplicateName = err.code === '23505' || 
                             err.message?.toLowerCase().includes('duplicate') ||
                             err.message?.toLowerCase().includes('idx_spaces_name_category_unique');
      
      if (isDuplicateName) {
        toast({
          title: "Nom déjà utilisé",
          description: "Un espace avec ce nom existe déjà dans cette catégorie. Choisissez un autre nom.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de créer l'espace",
          variant: "destructive",
        });
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, fetchSpaces]);

  const subscribeToSpace = useCallback(async (spaceId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('space_subscriptions')
        .insert({
          user_id: user.id,
          space_id: spaceId
        });

      if (error) throw error;

      // Update local state
      setSpaces(prev => 
        prev.map(space => 
          space.id === spaceId 
            ? { ...space, is_subscribed: true, subscribers_count: space.subscribers_count + 1 }
            : space
        )
      );

      toast({
        title: "Abonné !",
        description: "Vous êtes maintenant abonné à cet espace",
      });
    } catch (err: any) {
      console.error('Error subscribing to space:', err);
      toast({
        title: "Erreur",
        description: "Impossible de s'abonner à l'espace",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const unsubscribeFromSpace = useCallback(async (spaceId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('space_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('space_id', spaceId);

      if (error) throw error;

      // Update local state
      setSpaces(prev => 
        prev.map(space => 
          space.id === spaceId 
            ? { ...space, is_subscribed: false, subscribers_count: Math.max(0, space.subscribers_count - 1) }
            : space
        )
      );

      toast({
        title: "Désabonné",
        description: "Vous n'êtes plus abonné à cet espace",
      });
    } catch (err: any) {
      console.error('Error unsubscribing from space:', err);
      toast({
        title: "Erreur",
        description: "Impossible de se désabonner de l'espace",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const getSpaceById = useCallback(async (spaceId: string) => {
    try {
      const { data, error } = await supabase
        .from('spaces')
        .select(`
          *,
          profiles (
            id,
            username,
            profile_picture_url
          )
        `)
        .eq('id', spaceId)
        .single();

      if (error) throw error;

      // Check if user is subscribed
      if (user) {
        const { data: subscription } = await supabase
          .from('space_subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('space_id', spaceId)
          .single();

        return {
          ...data,
          is_subscribed: !!subscription
        };
      }

      return data;
    } catch (err: any) {
      console.error('Error fetching space:', err);
      throw err;
    }
  }, [user]);

  return {
    spaces,
    isLoading,
    error,
    fetchSpaces,
    createSpace,
    subscribeToSpace,
    unsubscribeFromSpace,
    getSpaceById,
  };
}