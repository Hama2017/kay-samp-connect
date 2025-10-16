import { useState, useCallback } from 'react';
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
  categories?: string[];
  created_at: string;
  updated_at: string;
  current_user_vote?: 'up' | 'down' | null;
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
    categories?: string[];
  };
  post_media?: Array<{
    id: string;
    media_url: string;
    media_type: string;
    media_order: number;
  }>;
}

export interface CreatePostData {
  content: string;
  title?: string;
  space_id?: string;
  hashtags?: string[];
  categories?: string[];
  media_files?: any[];
}

export function usePosts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<any>({});

  const fetchPosts = useCallback(async (filters?: {
    space_id?: string;
    author_id?: string;
    category?: string;
    sort_by?: 'recent' | 'popular' | 'viral' | 'discussed';
  }, append = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    const page = append ? currentPage + 1 : 1;
    const limit = 10;

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
        .range((page - 1) * limit, page * limit - 1);

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

      const { data, error } = await query;

      if (error) throw error;

      const newPosts = data as Post[];
      
      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
        setCurrentPage(page);
      } else {
        setPosts(newPosts);
        setCurrentPage(1);
      }
      
      setHasMore(newPosts.length === limit);
      setCurrentFilters(filters || {});
      
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentPage]);

  const loadMorePosts = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchPosts(currentFilters, true);
  }, [fetchPosts, currentFilters, hasMore, isLoading]);

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
          hashtags: postData.hashtags,
          categories: postData.categories
        })
        .select()
        .single();

      if (error) throw error;

      // Handle media upload if any
      if (postData.media_files && postData.media_files.length > 0) {
        console.log('Traitement des médias:', postData.media_files);
        
        for (let i = 0; i < postData.media_files.length; i++) {
          const file = postData.media_files[i];
          let mediaUrl = '';
          let mediaType = 'image';
          let youtubeVideoId = '';
          
          console.log('Traitement fichier:', file);
          
          // Vérifier si c'est une vidéo YouTube
          if (file.isYouTubeUrl) {
            mediaUrl = file.url;
            mediaType = 'youtube';
            youtubeVideoId = file.videoId;
            console.log('YouTube video:', { mediaUrl, mediaType, youtubeVideoId });
          }
          // Vérifier si c'est un GIF depuis une URL (Giphy)
          else if (file.isGifUrl) {
            mediaUrl = file.url;
            mediaType = 'image'; // Les GIFs sont traités comme des images
            console.log('GIF depuis URL:', { mediaUrl, mediaType });
          } else {
            // Upload normal du fichier
            const fileExtension = file.name.split('.').pop();
            const fileName = `${user.id}/${data.id}_${i}_${Date.now()}.${fileExtension}`;
            
            console.log('Upload fichier vers storage:', { fileName, fileType: file.type });
            
            // Upload file to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('post-media')
              .upload(fileName, file);

            if (uploadError) {
              console.error('Erreur upload storage:', uploadError);
              continue;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
              .from('post-media')
              .getPublicUrl(fileName);
            
            mediaUrl = urlData.publicUrl;

            // Determine media type
            if (file.type && file.type.startsWith('video/')) {
              mediaType = 'video';
            } else if (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')) {
              mediaType = 'image'; // Les GIFs sont traités comme des images
            } else if (file.type && file.type.startsWith('image/')) {
              mediaType = 'image';
            }
          }
          
          console.log('Insertion en base:', { postId: data.id, mediaUrl, mediaType, order: i, youtubeVideoId });

          // Prepare media record for database
          const mediaRecord: any = {
            post_id: data.id,
            media_url: mediaUrl,
            media_type: mediaType,
            media_order: i
          };

          // Add YouTube video ID if it's a YouTube video
          if (mediaType === 'youtube' && youtubeVideoId) {
            mediaRecord.youtube_video_id = youtubeVideoId;
          }

          // Save media record to database
          const { error: mediaError } = await supabase
            .from('post_media')
            .insert(mediaRecord);
            
          if (mediaError) {
            console.error('Erreur insertion post_media:', mediaError);
            throw mediaError; // Arrêter si erreur
          } else {
            console.log('Média sauvegardé avec succès');
          }
        }
      }

      // Refresh posts
      fetchPosts(currentFilters);
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
  }, [user, toast, fetchPosts, currentFilters]);

  const votePost = useCallback(async (postId: string, voteType: 'up' | 'down') => {
    if (!user) return;

    try {
      // Optimistic update
      setPosts(prev => prev.map(post => {
        if (post.id !== postId) return post;
        
        const currentVote = post.current_user_vote;
        let newVotesUp = post.votes_up;
        let newVotesDown = post.votes_down;
        let newCurrentVote: 'up' | 'down' | null = voteType;

        // Handle vote logic
        if (currentVote === voteType) {
          // Remove vote
          if (voteType === 'up') newVotesUp--;
          else newVotesDown--;
          newCurrentVote = null;
        } else {
          // Change or add vote
          if (currentVote === 'up') newVotesUp--;
          else if (currentVote === 'down') newVotesDown--;
          
          if (voteType === 'up') newVotesUp++;
          else newVotesDown++;
        }

        return {
          ...post,
          votes_up: newVotesUp,
          votes_down: newVotesDown,
          current_user_vote: newCurrentVote
        };
      }));

      // Backend update
      const { data: existingVote } = await supabase
        .from('post_votes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          await supabase
            .from('post_votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          await supabase
            .from('post_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
        }
      } else {
        await supabase
          .from('post_votes')
          .insert({
            post_id: postId,
            user_id: user.id,
            vote_type: voteType
          });
      }

    } catch (err) {
      // Revert optimistic update on error
      fetchPosts(currentFilters);
      console.error('Error voting on post:', err);
    }
  }, [user, fetchPosts, currentFilters]);

  const incrementViews = useCallback(async (postId: string) => {
    try {
      await supabase.rpc('increment_post_views', { post_id: postId });
      
      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, views_count: post.views_count + 1 }
          : post
      ));
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  }, []);

  return {
    posts,
    isLoading,
    error,
    hasMore,
    fetchPosts,
    loadMorePosts,
    createPost,
    votePost,
    incrementViews,
  };
}