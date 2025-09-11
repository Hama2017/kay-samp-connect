import { Space } from '@/hooks/useSpaces';

export function canUserPostInSpace(
  space: Space, 
  userId?: string, 
  isUserVerified?: boolean
): { canPost: boolean; message: string } {
  // Si l'utilisateur n'est pas connecté
  if (!userId) {
    return {
      canPost: false,
      message: 'Connectez-vous pour publier'
    };
  }

  // Si l'utilisateur est le créateur de l'espace
  if (space.creator_id === userId) {
    return {
      canPost: true,
      message: ''
    };
  }

  const whoCanPublish = space.who_can_publish || ['subscribers'];

  // Vérifier les différentes restrictions
  if (whoCanPublish.includes('creator_only')) {
    return {
      canPost: false,
      message: 'Seul le créateur de l\'espace peut publier'
    };
  }

  if (whoCanPublish.includes('verified_only')) {
    if (!isUserVerified) {
      return {
        canPost: false,
        message: 'Seuls les utilisateurs vérifiés peuvent poster'
      };
    }
  }

  if (whoCanPublish.includes('subscribers')) {
    if (!space.is_subscribed) {
      return {
        canPost: false,
        message: 'Abonnez-vous pour créer un post'
      };
    }
  }

  return {
    canPost: true,
    message: ''
  };
}

export function getPublishPermissionLabel(permission: string): string {
  const labels: Record<string, string> = {
    'subscribers': 'Abonnés',
    'verified_only': 'Utilisateurs vérifiés seulement',
    'creator_only': 'Moi seulement'
  };
  
  return labels[permission] || permission;
}