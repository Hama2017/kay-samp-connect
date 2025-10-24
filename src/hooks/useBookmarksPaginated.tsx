import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Bookmark {
  id: string;
  item_id: string;
  item_type: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  user_id: string;
  metadata?: any;
  created_at: string;
  // Post complet si item_type = 'post'
  post?: any;
}

export function useBookmarksPaginated() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const BOOKMARKS_PER_PAGE = 10;

  const fetchBookmarks = useCallback(async (filters?: {
    item_type?: string;
  }, page = 1, append = false) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    const limit = BOOKMARKS_PER_PAGE;
    const offset = (page - 1) * limit;

    try {
      let query = supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.item_type) {
        query = query.eq('item_type', filters.item_type);
      }

      const { data, error } = await query;

      if (error) throw error;

      let newBookmarks = (data as Bookmark[]) || [];
      
      // Si c'est un bookmark de type 'post', récupérer les posts complets
      if (filters?.item_type === 'post' && newBookmarks.length > 0) {
        const postIds = newBookmarks.map(b => b.item_id);
        
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            profiles!posts_author_id_fkey(
              id,
              username,
              full_name,
              profile_picture_url,
              is_verified
            ),
            post_media(
              id,
              media_url,
              media_type,
              media_order,
              thumbnail_url,
              youtube_video_id
            ),
            spaces(
              id,
              name,
              is_verified
            )
          `)
          .in('id', postIds);
          
        if (!postsError && postsData) {
          // Mapper les posts aux bookmarks
          newBookmarks = newBookmarks.map(bookmark => ({
            ...bookmark,
            post: postsData.find(p => p.id === bookmark.item_id)
          }));
        }
      }
      
      const hasMoreBookmarks = newBookmarks.length === limit;

      if (append && page > 1) {
        setBookmarks(prevBookmarks => {
          const existingIds = new Set(prevBookmarks.map(b => b.id));
          const uniqueBookmarks = newBookmarks.filter(b => !existingIds.has(b.id));
          return [...prevBookmarks, ...uniqueBookmarks];
        });
        setCurrentPage(page);
      } else {
        setBookmarks(newBookmarks);
        setCurrentPage(page);
      }

      setHasMore(hasMoreBookmarks);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching bookmarks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadMoreBookmarks = useCallback((filters?: { item_type?: string }) => {
    if (hasMore && !isLoading) {
      const nextPage = currentPage + 1;
      fetchBookmarks(filters, nextPage, true);
    }
  }, [hasMore, isLoading, fetchBookmarks, currentPage]);

  return {
    bookmarks,
    isLoading,
    error,
    hasMore,
    fetchBookmarks,
    loadMoreBookmarks,
  };
}