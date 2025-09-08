import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TopContributor {
  user_id: string;
  username: string;
  profile_picture_url?: string;
  is_verified?: boolean;
  posts_count: number;
  comments_count: number;
  votes_given: number;
  activity_score: number;
}

export function useTopContributors() {
  const [contributors, setContributors] = useState<TopContributor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopContributors = useCallback(async (period: 'day' | 'week' | 'month' = 'day') => {
    setIsLoading(true);
    setError(null);

    try {
      // Get date range based on period
      const now = new Date();
      let dateFilter = new Date();
      
      switch (period) {
        case 'day':
          dateFilter.setDate(now.getDate() - 1);
          break;
        case 'week':
          dateFilter.setDate(now.getDate() - 7);
          break;
        case 'month':
          dateFilter.setMonth(now.getMonth() - 1);
          break;
      }

      // Get top contributors based on recent activity
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          profile_picture_url,
          is_verified,
          posts:posts!author_id(count),
          comments:comments!author_id(count),
          given_votes:post_votes!user_id(count),
          comment_votes:comment_votes!user_id(count)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Calculate activity scores and format data
      const contributorsWithScores = (data || []).map((profile: any) => ({
        user_id: profile.id,
        username: profile.username,
        profile_picture_url: profile.profile_picture_url,
        is_verified: profile.is_verified,
        posts_count: profile.posts?.[0]?.count || 0,
        comments_count: profile.comments?.[0]?.count || 0,
        votes_given: (profile.given_votes?.[0]?.count || 0) + (profile.comment_votes?.[0]?.count || 0),
        activity_score: (
          (profile.posts?.[0]?.count || 0) * 3 + 
          (profile.comments?.[0]?.count || 0) * 2 + 
          ((profile.given_votes?.[0]?.count || 0) + (profile.comment_votes?.[0]?.count || 0))
        )
      }))
      .filter(c => c.activity_score > 0)
      .sort((a, b) => b.activity_score - a.activity_score)
      .slice(0, 5);

      setContributors(contributorsWithScores);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching top contributors:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    contributors,
    isLoading,
    error,
    fetchTopContributors,
  };
}