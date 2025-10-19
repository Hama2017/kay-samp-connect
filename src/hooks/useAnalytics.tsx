import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalyticsEvent {
  id: string;
  type: 'page_view' | 'post_create' | 'post_like' | 'post_share' | 'comment_create' | 
        'space_join' | 'space_create' | 'user_follow' | 'search' |
        'session_end' | 'click';
  timestamp: Date;
  metadata?: Record<string, any>;
  userId: string;
  sessionId: string;
}

export interface UserStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalFollowers: number;
  totalFollowing: number;
  spacesCreated: number;
  spacesJoined: number;
  profileViews: number;
  avgSessionDuration: number;
  totalSessions: number;
  dailyActiveStreak: number;
  joinDate: Date;
}

export interface EngagementStats {
  date: string;
  posts: number;
  likes: number;
  comments: number;
  shares: number;
  pageViews: number;
  sessionDuration: number;
}

// Simuler des données d'analytics
const mockUserStats: UserStats = {
  totalPosts: 47,
  totalLikes: 324,
  totalComments: 89,
  totalShares: 56,
  totalFollowers: 156,
  totalFollowing: 89,
  spacesCreated: 3,
  spacesJoined: 12,
  profileViews: 1247,
  avgSessionDuration: 8.5, // minutes
  totalSessions: 234,
  dailyActiveStreak: 12,
  joinDate: new Date('2024-01-15')
};

const generateMockEngagementData = (): EngagementStats[] => {
  const data: EngagementStats[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      posts: Math.floor(Math.random() * 5),
      likes: Math.floor(Math.random() * 20) + 5,
      comments: Math.floor(Math.random() * 10) + 2,
      shares: Math.floor(Math.random() * 8) + 1,
      pageViews: Math.floor(Math.random() * 50) + 20,
      sessionDuration: Math.floor(Math.random() * 30) + 5
    });
  }
  
  return data;
};

export function useAnalytics() {
  const { user } = useAuth();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [sessionStart] = useState(new Date());
  const [userStats, setUserStats] = useState<UserStats>(mockUserStats);
  const [engagementData, setEngagementData] = useState<EngagementStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les données d'engagement
  useEffect(() => {
    setIsLoading(true);
    // Simuler un appel API
    setTimeout(() => {
      setEngagementData(generateMockEngagementData());
      setIsLoading(false);
    }, 1000);
  }, []);

  // Envoyer les analytics à la fin de la session
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionDuration = (Date.now() - sessionStart.getTime()) / (1000 * 60); // en minutes
      track('session_end', { duration: sessionDuration });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionStart]);

  const track = useCallback((
    type: AnalyticsEvent['type'],
    metadata?: Record<string, any>
  ) => {
    if (!user) return;

    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date(),
      metadata,
      userId: user.id || 'anonymous',
      sessionId
    };

    setEvents(prev => [...prev, event]);

    // En production, envoyer à l'API d'analytics
    console.log('Analytics Event:', event);
  }, [user, sessionId]);

  const trackPageView = useCallback((page: string, metadata?: Record<string, any>) => {
    track('page_view', { page, ...metadata });
  }, [track]);

  const trackInteraction = useCallback((
    action: string,
    target: string,
    metadata?: Record<string, any>
  ) => {
    track(action as AnalyticsEvent['type'], { target, ...metadata });
  }, [track]);

  const getTopContent = useCallback(() => {
    // Simuler les contenus les plus performants
    return [
      {
        id: '1',
        type: 'post',
        title: 'Comment réussir son thiébou dieune',
        views: 1247,
        likes: 89,
        comments: 34,
        shares: 22,
        engagement: 12.5
      },
      {
        id: '2',
        type: 'post',
        title: 'Tech meetup à Dakar - Retour d\'expérience',
        views: 856,
        likes: 67,
        comments: 28,
        shares: 15,
        engagement: 10.8
      },
      {
        id: '3',
        type: 'space',
        title: 'Cuisine Sénégalaise',
        members: 234,
        posts: 45,
        engagement: 8.9
      }
    ];
  }, []);

  const getRecentActivity = useCallback(() => {
    // Simuler l'activité récente
    return [
      {
        id: '1',
        type: 'like',
        description: 'Votre post sur le thiébou dieune a reçu 12 nouveaux likes',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
        impact: '+12 likes'
      },
      {
        id: '2',
        type: 'comment',
        description: '5 nouveaux commentaires sur votre post tech',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h ago
        impact: '+5 commentaires'
      },
      {
        id: '3',
        type: 'follow',
        description: '3 nouveaux SAMPNA cette semaine',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        impact: '+3 SAMPNA'
      }
    ];
  }, []);

  const getInsights = useCallback(() => {
    const thisWeekData = engagementData.slice(-7);
    const lastWeekData = engagementData.slice(-14, -7);
    
    const thisWeekTotal = thisWeekData.reduce((sum, day) => sum + day.likes + day.comments + day.shares, 0);
    const lastWeekTotal = lastWeekData.reduce((sum, day) => sum + day.likes + day.comments + day.shares, 0);
    
    const weeklyGrowth = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0;
    
    return {
      weeklyGrowth: Math.round(weeklyGrowth),
      bestPerformingDay: thisWeekData.reduce((best, day) => 
        day.likes + day.comments + day.shares > best.likes + best.comments + best.shares ? day : best,
        thisWeekData[0]
      ),
      averageDailyEngagement: Math.round(thisWeekTotal / 7),
      recommendation: weeklyGrowth > 10 
        ? "Excellent ! Continuez sur cette lancée 🔥"
        : weeklyGrowth > 0 
        ? "Bonne progression, essayez de poster plus régulièrement 📈"
        : "Essayez d'interagir plus avec la communauté pour booster l'engagement 💪"
    };
  }, [engagementData]);

  return {
    // Données
    userStats,
    engagementData,
    events,
    isLoading,
    
    // Méthodes de tracking
    track,
    trackPageView,
    trackInteraction,
    
    // Analytics calculées
    getTopContent,
    getRecentActivity,
    getInsights,
    
    // Infos de session
    sessionId,
    sessionDuration: (Date.now() - sessionStart.getTime()) / (1000 * 60) // en minutes
  };
}