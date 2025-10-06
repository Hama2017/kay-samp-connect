import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchFilters {
  type: 'all' | 'posts' | 'spaces' | 'users';
  category: string;
  sortBy: 'relevance' | 'recent' | 'popular';
}

export interface SearchResult {
  posts: any[];
  spaces: any[];
  users: any[];
  totalResults: number;
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    category: 'Tous',
    sortBy: 'relevance'
  });
  const [searchResults, setSearchResults] = useState<SearchResult>({
    posts: [],
    spaces: [],
    users: [],
    totalResults: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const performSearch = async (searchQuery: string, searchFilters: SearchFilters) => {
    if (!searchQuery.trim()) {
      setSearchResults({
        posts: [],
        spaces: [],
        users: [],
        totalResults: 0
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search', {
        body: {
          query: searchQuery,
          type: searchFilters.type,
          category: searchFilters.category,
          sortBy: searchFilters.sortBy,
          limit: 50
        }
      });

      if (error) throw error;

      // Transform data to match expected format with safety checks
      const transformedData = {
        posts: (data.posts || [])
          .filter((post: any) => post && post.profiles) // Filtrer les posts sans profil
          .map((post: any) => ({
            id: post.id,
            content: post.content,
            publicationDate: post.created_at,
            votesUp: post.votes_up || 0,
            votesDown: post.votes_down || 0,
            commentsCount: post.comments_count || 0,
            viewsCount: post.views_count || 0,
            hashtags: post.hashtags || [],
            category: post.spaces?.category || 'Général',
            author: {
              username: post.profiles?.username || 'Utilisateur',
              profilePicture: post.profiles?.profile_picture_url || '',
              isVerified: post.profiles?.is_verified || false,
            },
            space: {
              name: post.spaces?.name || 'Général',
              id: post.spaces?.id || 'general',
            }
          })),
        spaces: (data.spaces || []).map((space: any) => ({
          id: space.id,
          name: space.name || 'Espace',
          description: space.description || '',
          category: space.categories ? space.categories.join(", ") : "",
          subscribersCount: space.subscribers_count || 0,
          isVerified: space.is_verified || false,
          lastActivity: space.updated_at,
          isSubscribed: space.is_subscribed || false,
        })),
        users: (data.users || [])
          .filter((user: any) => user && user.username) // Filtrer les utilisateurs invalides
          .map((user: any) => ({
            id: user.id,
            username: user.username || 'Utilisateur',
            bio: user.bio || '',
            profilePicture: user.profile_picture_url || '',
            isVerified: user.is_verified || false,
            followersCount: user.followers_count || 0,
            followingCount: user.following_count || 0,
          })),
        totalResults: data.totalResults || 0
      };

      setSearchResults(transformedData);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({
        posts: [],
        spaces: [],
        users: [],
        totalResults: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to trigger search when query or filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query, filters);
      } else {
        setSearchResults({
          posts: [],
          spaces: [],
          users: [],
          totalResults: 0
        });
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(debounceTimer);
  }, [query, filters]);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    searchResults,
    isSearching: query.trim().length > 0,
    isLoading,
    performSearch
  };
}