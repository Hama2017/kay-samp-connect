import { useEffect } from 'react';
import { Check, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useSpaceInvitations } from '@/hooks/useSpaceInvitations';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function SpaceInvitationNotifications() {
  const { invitations, isLoading, fetchMyInvitations, respondToInvitation } = useSpaceInvitations();

  useEffect(() => {
    fetchMyInvitations();
  }, [fetchMyInvitations]);

  if (isLoading) {
    return (
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invitations d'espaces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return (
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invitations d'espaces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune invitation en attente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Invitations d'espaces
          <Badge variant="secondary" className="ml-auto">
            {invitations.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.map((invitation) => (
          <div 
            key={invitation.id}
            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={invitation.inviter_profile?.profile_picture_url} />
              <AvatarFallback>
                {invitation.inviter_profile?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">
                <span className="text-primary">@{invitation.inviter_profile?.username}</span>
                {' '}vous a invité à rejoindre{' '}
                <span className="font-semibold">{invitation.spaces?.name}</span>
              </p>
              {invitation.message && (
                <p className="text-xs text-muted-foreground mt-1">
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
                variant="default"
                onClick={() => handleAccept(invitation.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Accepter</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDecline(invitation.id)}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Refuser</span>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}