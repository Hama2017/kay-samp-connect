import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface RealBookmark {
  id: string;
  user_id: string;
  item_type: string;
  item_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  metadata?: any;
  created_at: string;
}

export function useRealBookmarks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<RealBookmark[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBookmarks = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookmarks(data || []);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addBookmark = useCallback(async (item: {
    item_type: 'post' | 'space' | 'user';
    item_id: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    metadata?: any;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          ...item
        });

      if (error) throw error;

      toast({
        title: '⭐ Ajouté aux favoris',
        description: `"${item.title}" a été ajouté à vos favoris`,
        duration: 3000,
      });

      fetchBookmarks();
    } catch (err: any) {
      console.error('Error adding bookmark:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter aux favoris',
        variant: 'destructive',
      });
    }
  }, [user, toast, fetchBookmarks]);

  const removeBookmark = useCallback(async (itemId: string, itemType: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('item_type', itemType);

      if (error) throw error;

      const bookmark = bookmarks.find(b => b.item_id === itemId && b.item_type === itemType);
      if (bookmark) {
        toast({
          title: '🗑️ Retiré des favoris',
          description: `"${bookmark.title}" a été retiré de vos favoris`,
          duration: 3000,
        });
      }

      fetchBookmarks();
    } catch (err: any) {
      console.error('Error removing bookmark:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer des favoris',
        variant: 'destructive',
      });
    }
  }, [user, bookmarks, toast, fetchBookmarks]);

  const isBookmarked = useCallback((itemId: string, itemType: string) => {
    return bookmarks.some(b => b.item_id === itemId && b.item_type === itemType);
  }, [bookmarks]);

  const toggleBookmark = useCallback(async (item: {
    item_type: 'post' | 'space' | 'user';
    item_id: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    metadata?: any;
  }) => {
    const bookmarked = isBookmarked(item.item_id, item.item_type);
    
    if (bookmarked) {
      await removeBookmark(item.item_id, item.item_type);
    } else {
      await addBookmark(item);
    }
  }, [isBookmarked, addBookmark, removeBookmark]);

  const getBookmarksByType = useCallback((type: 'post' | 'space' | 'user') => {
    return bookmarks.filter(b => b.item_type === type);
  }, [bookmarks]);

  const clearAllBookmarks = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setBookmarks([]);
      toast({
        title: '🧹 Favoris supprimés',
        description: 'Tous vos favoris ont été supprimés',
        duration: 3000,
      });
    } catch (err: any) {
      console.error('Error clearing bookmarks:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer les favoris',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const getStats = useCallback(() => {
    const postCount = bookmarks.filter(b => b.item_type === 'post').length;
    const spaceCount = bookmarks.filter(b => b.item_type === 'space').length;
    const userCount = bookmarks.filter(b => b.item_type === 'user').length;
    
    const recentCount = bookmarks.filter(b => {
      const daysDiff = (Date.now() - new Date(b.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;

    return {
      total: bookmarks.length,
      posts: postCount,
      spaces: spaceCount,
      users: userCount,
      recentCount
    };
  }, [bookmarks]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return {
    bookmarks,
    isLoading,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    getBookmarksByType,
    clearAllBookmarks,
    getStats,
    fetchBookmarks,
  };
}