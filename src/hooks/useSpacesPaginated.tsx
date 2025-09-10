import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Space {
  id: string;
  name: string;
  description?: string;
  category: string;
  is_public: boolean;
  is_verified: boolean;
  cover_image_url?: string;
  subscribers_count: number;
  posts_count: number;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

export function useSpacesPaginated() {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const SPACES_PER_PAGE = 10;

  const fetchSpaces = useCallback(async (filters?: {
    user_spaces?: boolean;
    category?: string;
  }, page = 1, append = false) => {
    setIsLoading(true);
    setError(null);

    const limit = SPACES_PER_PAGE;
    const offset = (page - 1) * limit;

    try {
      let query = supabase
        .from('spaces')
        .select('*')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.user_spaces && user?.id) {
        query = query.eq('creator_id', user.id);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;

      if (error) throw error;

      const newSpaces = (data as Space[]) || [];
      const hasMoreSpaces = newSpaces.length === limit;

      if (append && page > 1) {
        setSpaces(prevSpaces => {
          const existingIds = new Set(prevSpaces.map(s => s.id));
          const uniqueSpaces = newSpaces.filter(s => !existingIds.has(s.id));
          return [...prevSpaces, ...uniqueSpaces];
        });
        setCurrentPage(page);
      } else {
        setSpaces(newSpaces);
        setCurrentPage(page);
      }

      setHasMore(hasMoreSpaces);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching spaces:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadMoreSpaces = useCallback((filters?: { user_spaces?: boolean; category?: string }) => {
    if (hasMore && !isLoading) {
      const nextPage = currentPage + 1;
      fetchSpaces(filters, nextPage, true);
    }
  }, [hasMore, isLoading, fetchSpaces, currentPage]);

  return {
    spaces,
    isLoading,
    error,
    hasMore,
    fetchSpaces,
    loadMoreSpaces,
  };
}