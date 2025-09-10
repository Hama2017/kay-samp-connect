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

      const newBookmarks = (data as Bookmark[]) || [];
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