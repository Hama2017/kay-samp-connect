import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'post' | 'system';
  title: string;
  message: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  postId?: string;
  spaceId?: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    title: 'Nouveau j\'aime',
    message: 'Aminata Ba a aimé votre post "Développement web au Sénégal"',
    userId: 'user-1',
    userName: 'Aminata Ba',
    userAvatar: '/placeholder.svg?height=40&width=40',
    postId: 'post-1',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    actionUrl: '/post/post-1'
  },
  {
    id: '2',
    type: 'comment',
    title: 'Nouveau commentaire',
    message: 'Ousmane Diallo a commenté votre post "React vs Vue.js"',
    userId: 'user-2',
    userName: 'Ousmane Diallo',
    userAvatar: '/placeholder.svg?height=40&width=40',
    postId: 'post-2',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    actionUrl: '/post/post-2'
  },
  {
    id: '3',
    type: 'follow',
    title: 'Nouvel abonné',
    message: 'Fatou Seck a commencé à vous suivre',
    userId: 'user-3',
    userName: 'Fatou Seck',
    userAvatar: '/placeholder.svg?height=40&width=40',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    actionUrl: '/profile/user-3'
  },
  {
    id: '4',
    type: 'mention',
    title: 'Vous avez été mentionné',
    message: 'Mamadou Kane vous a mentionné dans un post',
    userId: 'user-4',
    userName: 'Mamadou Kane',
    userAvatar: '/placeholder.svg?height=40&width=40',
    postId: 'post-4',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    actionUrl: '/post/post-4'
  },
  {
    id: '5',
    type: 'post',
    title: 'Nouveau post dans Tech Dakar',
    message: 'Il y a un nouveau post dans l\'espace Tech Dakar que vous suivez',
    spaceId: 'space-1',
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    actionUrl: '/space/tech-dakar'
  },
  {
    id: '6',
    type: 'system',
    title: 'Mise à jour KaaySamp',
    message: 'Découvrez les nouvelles fonctionnalités de KaaySamp v2.1',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    actionUrl: '/changelog'
  }
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // 20% chance to receive a new notification every 30 seconds
      if (Math.random() < 0.2) {
        const newNotification = createRandomNotification();
        setNotifications(prev => [newNotification, ...prev]);
        
        // Show toast for new notification
        toast({
          title: newNotification.title,
          description: newNotification.message,
          duration: 4000,
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [toast]);

  const createRandomNotification = (): Notification => {
    const types: Notification['type'][] = ['like', 'comment', 'follow', 'mention'];
    const users = ['Awa Diop', 'Seydou Fall', 'Mariam Sy', 'Ibrahima Ndiaye'];
    const type = types[Math.floor(Math.random() * types.length)];
    const user = users[Math.floor(Math.random() * users.length)];

    const messages = {
      like: `${user} a aimé votre post`,
      comment: `${user} a commenté votre post`,
      follow: `${user} a commencé à vous suivre`,
      mention: `${user} vous a mentionné dans un post`
    };

    return {
      id: `notification-${Date.now()}`,
      type,
      title: type === 'like' ? 'Nouveau j\'aime' : 
             type === 'comment' ? 'Nouveau commentaire' :
             type === 'follow' ? 'Nouvel abonné' : 'Nouvelle mention',
      message: messages[type],
      userId: `user-${Date.now()}`,
      userName: user,
      userAvatar: '/placeholder.svg?height=40&width=40',
      isRead: false,
      createdAt: new Date(),
      actionUrl: type === 'follow' ? `/profile/user-${Date.now()}` : `/post/post-${Date.now()}`
    };
  };

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  }, []);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  return {
    notifications,
    isLoading,
    unreadCount: getUnreadCount(),
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
  };
}