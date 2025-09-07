import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';

export function usePageTracking() {
  const location = useLocation();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    // Track page view on route change
    const page = location.pathname;
    const search = location.search;
    
    trackPageView(page, {
      search,
      referrer: document.referrer,
      timestamp: Date.now()
    });
  }, [location, trackPageView]);
}

// Hook pour tracker les interactions spécifiques
export function useInteractionTracking() {
  const { trackInteraction } = useAnalytics();

  const trackClick = (element: string, metadata?: Record<string, any>) => {
    trackInteraction('click', element, metadata);
  };

  const trackLike = (postId: string, metadata?: Record<string, any>) => {
    trackInteraction('post_like', postId, metadata);
  };

  const trackShare = (postId: string, platform?: string) => {
    trackInteraction('post_share', postId, { platform });
  };

  const trackComment = (postId: string, metadata?: Record<string, any>) => {
    trackInteraction('comment_create', postId, metadata);
  };

  const trackFollow = (userId: string, metadata?: Record<string, any>) => {
    trackInteraction('user_follow', userId, metadata);
  };

  const trackSearch = (query: string, results?: number) => {
    trackInteraction('search', query, { results, timestamp: Date.now() });
  };

  return {
    trackClick,
    trackLike,
    trackShare,
    trackComment,
    trackFollow,
    trackSearch
  };
}