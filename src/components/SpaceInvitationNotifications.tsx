import { useEffect, useState } from 'react';
import { Check, X, Bell, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useSpaceInvitations } from '@/hooks/useSpaceInvitations';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

export function SpaceInvitationNotifications() {
  const [open, setOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { invitations, isLoading, fetchMyInvitations, respondToInvitation } = useSpaceInvitations();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMyInvitations();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    fetchMyInvitations();
    
    // DemaySAMP aux nouvelles invitations en temps réel
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
        <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[85vh] p-0">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b">
            <div className="flex items-center justify-between gap-6">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Invitations de SAMP Zones</span>
                <span className="sm:hidden">Invitations</span>
                {invitations.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {invitations.length}
                  </Badge>
                )}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
                className="h-9 px-3 gap-2 flex-shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-xs">Rafraîchir</span>
              </Button>
            </div>
          </DialogHeader>

          <div className="px-4 sm:px-6 py-4">
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 sm:h-16 bg-muted rounded-lg" />
                ))}
              </div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucune invitation</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[calc(85vh-120px)] pr-2">
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <div 
                      key={invitation.id}
                      className="flex flex-col gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-2 w-full">
                        <div>
                          <p className="font-medium text-sm leading-relaxed">
                            <span className="text-primary">@{invitation.inviter_profile?.username}</span>
                            {' '}vous invite dans{' '}
                            <span className="font-semibold">{invitation.spaces?.name}</span>
                          </p>
                          {invitation.message && (
                            <p className="text-xs text-muted-foreground mt-1.5 italic line-clamp-2">
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
                            className="bg-green-600 hover:bg-green-700 text-white flex-1 h-9"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Accepter
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDecline(invitation.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50 flex-1 h-9"
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Refuser
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}