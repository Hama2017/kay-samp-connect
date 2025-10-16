import { useEffect, useState } from 'react';
import { Check, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useSpaceInvitations } from '@/hooks/useSpaceInvitations';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

export function SpaceInvitationNotifications() {
  const [open, setOpen] = useState(false);
  const { invitations, isLoading, fetchMyInvitations, respondToInvitation } = useSpaceInvitations();

  useEffect(() => {
    fetchMyInvitations();
    
    // S'abonner aux nouvelles invitations en temps réel
    const channel = supabase
      .channel('space-invitations-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'space_invitations'
        },
        () => {
          console.log('New invitation received, refreshing...');
          fetchMyInvitations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'space_invitations'
        },
        () => {
          console.log('Invitation updated, refreshing...');
          fetchMyInvitations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMyInvitations]);

  const handleAccept = async (invitationId: string) => {
    try {
      await respondToInvitation(invitationId, 'accepted');
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  const handleDecline = async (invitationId: string) => {
    try {
      await respondToInvitation(invitationId, 'declined');
    } catch (error) {
      console.error('Error declining invitation:', error);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative btn-mobile hover:bg-primary/5"
        onClick={() => setOpen(true)}
      >
        <Bell className="h-5 w-5" />
        {invitations.length > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {invitations.length}
          </Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Invitations de SAMP Zones
              {invitations.length > 0 && (
                <Badge variant="secondary">
                  {invitations.length}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="animate-pulse space-y-4 py-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-muted rounded-lg" />
              ))}
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune invitation en attente</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div 
                    key={invitation.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10 mt-1">
                      <AvatarImage src={invitation.inviter_profile?.profile_picture_url} />
                      <AvatarFallback>
                        {invitation.inviter_profile?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <p className="font-medium text-sm">
                          <span className="text-primary">@{invitation.inviter_profile?.username}</span>
                          {' '}vous a invité à rejoindre{' '}
                          <span className="font-semibold">{invitation.spaces?.name}</span>
                        </p>
                        {invitation.message && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            "{invitation.message}"
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(invitation.invited_at), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(invitation.id)}
                          className="bg-green-600 hover:bg-green-700 text-white flex-1"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accepter
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDecline(invitation.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50 flex-1"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Refuser
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}