import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PostDetail {
  id: string;
  content: string;
  title?: string;
  hashtags: string[];
  created_at: string;
  updated_at: string;
  votes_up: number;
  votes_down: number;
  comments_count: number;
  views_count: number;
  current_user_vote: 'up' | 'down' | null;
  profiles: {
    username: string;
    profile_picture_url?: string;
    is_verified: boolean;
    bio?: string;
  } | null;
  spaces?: {
    id: string;
    name: string;
    category: string;
  };
  post_media: Array<{
    id: string;
    media_type: string;
    media_url: string;
    thumbnail_url?: string;
    youtube_video_id?: string;
    media_order: number;
  }>;
  comments: Array<{
    id: string;
    content: string;
    created_at: string;
    votes_up: number;
    votes_down: number;
    current_user_vote: 'up' | 'down' | null;
    profiles: {
      username: string;
      profile_picture_url?: string;
      is_verified: boolean;
    } | null;
    comment_media: Array<{
      id: string;
      media_type: string;
      media_url: string;
      media_order: number;
    }>;
  }>;
}

export function usePostDetail(postId: string) {
  const { user } = useAuth();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = async () => {
    if (!postId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('get-post', {
        body: { id: postId }
      });

      if (error) throw error;

      setPost(data);
      
      // Incrémenter les vues uniquement si l'utilisateur n'a pas déjà vu ce post
      if (user) {
        console.log('Tentative d\'incrémentation des vues pour post:', postId, 'user:', user.id);
        const { data: viewResult, error: viewError } = await supabase.rpc('increment_post_view_if_new', {
          p_post_id: postId,
          p_user_id: user.id
        });

        if (viewError) {
          console.error('❌ Erreur lors de l\'incrémentation des vues:', viewError);
        } else {
          console.log('✅ Résultat incrémentation:', viewResult);
        }
      } else {
        console.log('⚠️ Pas d\'utilisateur connecté, vues non incrémentées');
      }

    } catch (err: any) {
      console.error('Error fetching post:', err);
      setError(err.message || 'Erreur lors du chargement du post');
    } finally {
      setIsLoading(false);
    }
  };

  const votePost = async (voteType: 'up' | 'down') => {
    if (!user || !post) return;

    try {
      const existingVote = post.current_user_vote;

      if (existingVote === voteType) {
        // Retirer le vote
        await supabase
          .from('post_votes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);

        setPost(prev => prev ? {
          ...prev,
          votes_up: voteType === 'up' ? prev.votes_up - 1 : prev.votes_up,
          votes_down: voteType === 'down' ? prev.votes_down - 1 : prev.votes_down,
          current_user_vote: null
        } : null);
      } else {
        // Ajouter ou changer le vote
        await supabase
          .from('post_votes')
          .upsert({
            post_id: post.id,
            user_id: user.id,
            vote_type: voteType
          });

        setPost(prev => prev ? {
          ...prev,
          votes_up: voteType === 'up' 
            ? (existingVote === 'down' ? prev.votes_up + 1 : prev.votes_up + 1)
            : (existingVote === 'up' ? prev.votes_up - 1 : prev.votes_up),
          votes_down: voteType === 'down'
            ? (existingVote === 'up' ? prev.votes_down + 1 : prev.votes_down + 1)
            : (existingVote === 'down' ? prev.votes_down - 1 : prev.votes_down),
          current_user_vote: voteType
        } : null);
      }
    } catch (error) {
      console.error('Error voting on post:', error);
    }
  };

  const addComment = async (content: string) => {
    if (!user || !post || !content.trim()) return false;

    try {
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          author_id: user.id,
          content: content.trim()
        })
        .select(`
          *,
          profiles!inner(
            username,
            profile_picture_url,
            is_verified
          )
        `)
        .single();

      if (error) throw error;

      // Ajouter le commentaire à la liste
      setPost(prev => prev ? {
        ...prev,
        comments: [...prev.comments, {
          ...newComment,
          votes_up: 0,
          votes_down: 0,
          current_user_vote: null,
          comment_media: []
        }],
        comments_count: prev.comments_count + 1
      } : null);

      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      return false;
    }
  };

  const voteComment = async (commentId: string, voteType: 'up' | 'down') => {
    if (!user || !post) return;

    try {
      const comment = post.comments.find(c => c.id === commentId);
      if (!comment) return;

      const existingVote = comment.current_user_vote;

      if (existingVote === voteType) {
        // Retirer le vote
        await supabase
          .from('comment_votes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        // Ajouter ou changer le vote
        await supabase
          .from('comment_votes')
          .upsert({
            comment_id: commentId,
            user_id: user.id,
            vote_type: voteType
          });
      }

      // Mettre à jour localement
      setPost(prev => prev ? {
        ...prev,
        comments: prev.comments.map(comment => 
          comment.id === commentId ? {
            ...comment,
            votes_up: voteType === 'up' 
              ? (existingVote === 'down' ? comment.votes_up + 1 : existingVote === 'up' ? comment.votes_up - 1 : comment.votes_up + 1)
              : (existingVote === 'up' ? comment.votes_up - 1 : comment.votes_up),
            votes_down: voteType === 'down'
              ? (existingVote === 'up' ? comment.votes_down + 1 : existingVote === 'down' ? comment.votes_down - 1 : comment.votes_down + 1)
              : (existingVote === 'down' ? comment.votes_down - 1 : comment.votes_down),
            current_user_vote: existingVote === voteType ? null : voteType
          } : comment
        )
      } : null);
    } catch (error) {
      console.error('Error voting on comment:', error);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  return {
    post,
    isLoading,
    error,
    fetchPost,
    votePost,
    addComment,
    voteComment
  };
}