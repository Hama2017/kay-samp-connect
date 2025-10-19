import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SpaceInvitation {
  id: string;
  space_id: string;
  inviter_id: string;
  invited_user_id: string;
  status: 'pending' | 'accepted' | 'declined';
  invited_at: string;
  responded_at?: string;
  message?: string;
  // Relations
  spaces?: {
    id: string;
    name: string;
    cover_image_url?: string;
  };
  inviter_profile?: {
    id: string;
    username: string;
    profile_picture_url?: string;
  };
}

export function useSpaceInvitations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<SpaceInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyInvitations = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('space_invitations')
        .select(`
          *,
          spaces (
            id,
            name,
            cover_image_url
          ),
          inviter_profile:profiles!space_invitations_inviter_id_fkey (
            id,
            username,
            profile_picture_url
          )
        `)
        .eq('invited_user_id', user.id)
        .eq('status', 'pending')
        .order('invited_at', { ascending: false });

      if (error) throw error;

      setInvitations((data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'accepted' | 'declined',
        inviter_profile: Array.isArray(item.inviter_profile) ? item.inviter_profile[0] : item.inviter_profile
      })));
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching invitations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const sendInvitation = useCallback(async (spaceId: string, invitedUserId: string, message?: string) => {
    if (!user) throw new Error('User must be authenticated');

    console.log('Attempting to send invitation:', { spaceId, invitedUserId, message });

    try {
      // Vérifier s'il existe une invitation refusée
      const { data: existingInvitation } = await supabase
        .from('space_invitations')
        .select('id, status')
        .eq('space_id', spaceId)
        .eq('invited_user_id', invitedUserId)
        .maybeSingle();

      let invitationData;

      if (existingInvitation) {
        // Si l'invitation a été refusée, la mettre à jour
        if (existingInvitation.status === 'declined') {
          const { data, error } = await supabase
            .from('space_invitations')
            .update({
              status: 'pending',
              inviter_id: user.id,
              message,
              invited_at: new Date().toISOString(),
              responded_at: null
            })
            .eq('id', existingInvitation.id)
            .select()
            .single();

          if (error) {
            console.error('Error updating invitation:', error);
            throw error;
          }
          invitationData = data;
        } else if (existingInvitation.status === 'pending') {
          // Invitation déjà en attente
          toast({
            title: "Invitation déjà envoyée",
            description: "Cet utilisateur a déjà une invitation en attente",
            variant: "destructive",
          });
          throw new Error('Invitation already pending');
        } else {
          // Invitation déjà acceptée
          toast({
            title: "Déjà membre",
            description: "Cet utilisateur fait déjà partie de cette SAMP Zone",
            variant: "destructive",
          });
          throw new Error('User already member');
        }
      } else {
        // Créer une nouvelle invitation
        const { data, error } = await supabase
          .from('space_invitations')
          .insert({
            space_id: spaceId,
            inviter_id: user.id,
            invited_user_id: invitedUserId,
            message
          })
          .select()
          .single();

        if (error) {
          console.error('Error inserting invitation:', error);
          throw error;
        }
        invitationData = data;
      }

      console.log('Invitation created/updated:', invitationData);

      // Créer une notification pour l'utilisateur invité
      const { data: notificationData, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: invitedUserId,
          type: 'space_invitation',
          title: 'Nouvelle invitation de SAMP Zone',
          message: `Vous avez été invité à rejoindre une SAMP Zone${message ? `: ${message}` : ''}`,
          related_space_id: spaceId,
          related_invitation_id: invitationData.id,
          actor_id: user.id
        })
        .select()
        .single();

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      } else {
        console.log('Notification created:', notificationData);
      }

    } catch (err: any) {
      console.error('Error sending invitation:', err);
      
      if (err.message === 'Invitation already pending' || err.message === 'User already member') {
        // Message déjà affiché
        throw err;
      } else if (err.code === '23505') {
        toast({
          title: "Invitation déjà envoyée",
          description: "Cet utilisateur a déjà été invité à cette SAMP Zone",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'envoyer l'invitation",
          variant: "destructive",
        });
      }
      throw err;
    }
  }, [user, toast]);

  const respondToInvitation = useCallback(async (invitationId: string, response: 'accepted' | 'declined') => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { data, error } = await supabase
        .from('space_invitations')
        .update({
          status: response,
          responded_at: new Date().toISOString()
        })
        .eq('id', invitationId)
        .eq('invited_user_id', user.id)
        .select(`
          *,
          spaces (
            id,
            name
          )
        `)
        .single();

      if (error) throw error;

      // Si acceptée, s'abonner à l'espace
      if (response === 'accepted' && data.spaces) {
        const { error: subscriptionError } = await supabase
          .from('space_subscriptions')
          .insert({
            user_id: user.id,
            space_id: data.space_id
          });

        if (subscriptionError && subscriptionError.code !== '23505') {
          console.error('Error subscribing to space:', subscriptionError);
        }
      }

      // Supprimer l'invitation de la liste locale
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));

      // Afficher le toast uniquement si l'invitation a été acceptée
      if (response === 'accepted' && data.spaces) {
        /*
        toast({
          title: "Invitation acceptée !",
          description: `Vous avez rejoint la SAMP Zone "${data.spaces?.name}"`,
        }); */
      }

    } catch (err: any) {
      console.error('Error responding to invitation:', err);
      toast({
        title: "Erreur",
        description: "Impossible de répondre à l'invitation",
        variant: "destructive",
      });
      throw err;
    }
  }, [user, toast]);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, profile_picture_url')
        .ilike('username', `%${query}%`)
        .eq('profile_visible', true)
        .limit(10);

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      console.error('Error searching users:', err);
      return [];
    }
  }, []);

  return {
    invitations,
    isLoading,
    error,
    fetchMyInvitations,
    sendInvitation,
    respondToInvitation,
    searchUsers,
  };
}