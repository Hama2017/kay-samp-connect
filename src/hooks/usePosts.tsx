import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  content: string;
  title?: string;
  author_id: string;
  space_id?: string;
  votes_up: number;
  votes_down: number;
  comments_count: number;
  views_count: number;
  hashtags?: string[];
  created_at: string;
  updated_at: string;
  // Relations
  profiles: {
    id: string;
    username: string;
    profile_picture_url?: string;
    is_verified?: boolean;
  };
  spaces?: {
    id: string;
    name: string;
  };
  post_media?: Array<{
    id: string;
    media_url: string;
    media_type: string;
    thumbnail_url?: string;
  }>;
}

export interface CreatePostData {
  content: string;
  title?: string;
  space_id?: string;
  hashtags?: string[];
  media_files?: File[];
}

export function usePosts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (filters?: {
    space_id?: string;
    author_id?: string;
    category?: string;
    sort_by?: 'recent' | 'popular' | 'viral' | 'discussed';
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id,
            username,
            profile_picture_url,
            is_verified
          ),
          spaces (
            id,
            name
          ),
          post_media (
            id,
            media_url,
            media_type,
            thumbnail_url
          )
        `);

      // Apply filters
      if (filters?.space_id) {
        query = query.eq('space_id', filters.space_id);
      }
      
      if (filters?.author_id) {
        query = query.eq('author_id', filters.author_id);
      }

      // Apply sorting
      switch (filters?.sort_by) {
        case 'popular':
          query = query.order('votes_up', { ascending: false });
          break;
        case 'viral':
          query = query.order('views_count', { ascending: false });
          break;
        case 'discussed':
          query = query.order('comments_count', { ascending: false });
          break;
        default: // recent
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      setPosts(data || []);
      console.log('usePosts: setPosts called', { postsLength: data?.length || 0 });
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPost = useCallback(async (postData: CreatePostData) => {
    if (!user) throw new Error('User must be authenticated');

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content: postData.content,
          title: postData.title,
          author_id: user.id,
          space_id: postData.space_id,
          hashtags: postData.hashtags
        })
        .select()
        .single();

      if (error) throw error;

      // Handle media upload if any
      if (postData.media_files && postData.media_files.length > 0) {
        for (let i = 0; i < postData.media_files.length; i++) {
          const file = postData.media_files[i];
          const fileName = `${data.id}_${i}_${file.name}`;
          
          // Upload to Supabase Storage would go here
          // For now, we'll skip actual file upload
        }
      }

      toast({
        title: "Post créé !",
        description: "Votre post a été publié avec succès",
      });

      // Refresh posts
      fetchPosts();
      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de créer le post",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, fetchPosts]);

  const votePost = useCallback(async (postId: string, voteType: 'up' | 'down') => {
    if (!user) return;

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('post_votes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if same type
          await supabase
            .from('post_votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          // Update vote type
          await supabase
            .from('post_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
        }
      } else {
        // Create new vote
        await supabase
          .from('post_votes')
          .insert({
            post_id: postId,
            user_id: user.id,
            vote_type: voteType
          });
      }

      // The trigger will automatically update the vote counts
      // Refresh posts to get updated counts from server
      fetchPosts();
    } catch (err) {
      console.error('Error voting on post:', err);
    }
  }, [user, fetchPosts]);

  const incrementViews = useCallback(async (postId: string) => {
    try {
      await supabase.rpc('increment_post_views', { post_id: postId });
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  }, []);

  return {
    posts,
    isLoading,
    error,
    fetchPosts,
    createPost,
    votePost,
    incrementViews,
  };
}