import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BookmarkedPost {
  id: string;
  title?: string;
  content: string;
  votes_up: number;
  votes_down: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  author_id: string;
  hashtags?: string[];
  current_user_vote?: 'up' | 'down' | null;
  profiles: {
    id: string;
    username: string;
    profile_picture_url?: string;
    is_verified?: boolean;
  } | null;
  spaces?: {
    id: string;
    name: string;
    category?: string;
  };
  post_media?: Array<{
    id: string;
    media_url: string;
    media_type: string;
  }>;
}

export function useBookmarkedPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BookmarkedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        // Récupérer les bookmarks de type post
        const { data: bookmarks, error: bookmarksError } = await supabase
          .from('bookmarks')
          .select('item_id')
          .eq('user_id', user.id)
          .eq('item_type', 'post')
          .order('created_at', { ascending: false });

        if (bookmarksError) throw bookmarksError;

        if (!bookmarks || bookmarks.length === 0) {
          setPosts([]);
          return;
        }

        // Récupérer les posts complets
        const postIds = bookmarks.map(b => b.item_id);
        
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            profiles!posts_author_id_fkey (
              id,
              username,
              profile_picture_url,
              is_verified
            ),
            spaces (
              id,
              name,
              categories
            ),
            post_media (
              id,
              media_url,
              media_type,
              media_order
            )
          `)
          .in('id', postIds)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;

        // Récupérer les votes de l'utilisateur pour ces posts
        if (user?.id && postsData) {
          const { data: votesData } = await supabase
            .from('post_votes')
            .select('post_id, vote_type')
            .eq('user_id', user.id)
            .in('post_id', postIds);

          const votesMap = new Map(
            votesData?.map(v => [v.post_id, v.vote_type]) || []
          );

          const postsWithVotes = postsData.map(post => ({
            ...post,
            current_user_vote: votesMap.get(post.id) || null
          }));

          setPosts(postsWithVotes as BookmarkedPost[]);
        } else {
          setPosts(postsData as BookmarkedPost[]);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching bookmarked posts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarkedPosts();
  }, [user?.id]);

  return { posts, isLoading, error };
}
