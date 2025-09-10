import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_comment_id?: string;
  content: string;
  votes_up: number;
  votes_down: number;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  profiles: {
    id: string;
    username: string;
    profile_picture_url?: string;
    is_verified?: boolean;
  };
  comment_media?: Array<{
    id: string;
    media_url: string;
    media_type: string;
    media_order: number;
  }>;
  replies?: Comment[];
}

export function useComments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const COMMENTS_PER_PAGE = 20;

  const fetchComments = useCallback(async (postId: string, page = 1, append = false) => {
    setIsLoading(true);
    setError(null);

    const limit = COMMENTS_PER_PAGE;
    const offset = (page - 1) * limit;

    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (
            id,
            username,
            profile_picture_url,
            is_verified
          ),
          comment_media (
            id,
            media_url,
            media_type,
            media_order
          )
        `)
        .eq('post_id', postId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Fetch replies for each parent comment
      let organizedComments: Comment[] = [];
      if (data && data.length > 0) {
        for (const parent of data as any[]) {
          const { data: replies } = await supabase
            .from('comments')
            .select(`
              *,
              profiles (
                id,
                username,
                profile_picture_url,
                is_verified
              ),
              comment_media (
                id,
                media_url,
                media_type,
                media_order
              )
            `)
            .eq('parent_comment_id', parent.id)
            .order('created_at', { ascending: true });

          organizedComments.push({
            ...parent,
            replies: replies || []
          });
        }
      }

      const hasMoreComments = (data as any[])?.length === limit;
      
      if (append && page > 1) {
        setComments(prevComments => {
          const existingIds = new Set(prevComments.map(c => c.id));
          const newComments = organizedComments.filter(c => !existingIds.has(c.id));
          return [...prevComments, ...newComments];
        });
        setCurrentPage(page);
      } else {
        setComments(organizedComments);
        setCurrentPage(page);
      }
      
      setHasMore(hasMoreComments);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createComment = useCallback(async (data: {
    postId: string;
    content: string;
    parentCommentId?: string;
    gifUrl?: string;
  }) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert({
          post_id: data.postId,
          author_id: user.id,
          content: data.content,
          parent_comment_id: data.parentCommentId
        })
        .select('id')
        .single();

      if (error) throw error;

      // Si un GIF est sélectionné, l'ajouter comme média
      if (data.gifUrl && newComment) {
        const { error: mediaError } = await supabase
          .from('comment_media')
          .insert([{
            comment_id: newComment.id,
            media_url: data.gifUrl,
            media_type: 'image', // Les GIFs sont traités comme des images
            media_order: 0
          }]);

        if (mediaError) {
          console.error("Error adding comment media:", mediaError);
          toast({
            title: "Attention",
            description: "Commentaire créé mais le GIF n'a pas pu être ajouté",
            variant: "destructive"
          });
        }
      }

      toast({
        title: "Commentaire ajouté !",
        description: "Votre commentaire a été publié",
      });

      // Refresh comments from the beginning
      setCurrentPage(1);
      setHasMore(true);
      fetchComments(data.postId, 1, false);
      return newComment;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le commentaire",
        variant: "destructive",
      });
      throw err;
    }
  }, [user, toast, fetchComments]);

  const voteComment = useCallback(async (commentId: string, voteType: 'up' | 'down') => {
    if (!user) return;

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('comment_votes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if same type
          await supabase
            .from('comment_votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          // Update vote type
          await supabase
            .from('comment_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
        }
      } else {
        // Create new vote
        await supabase
          .from('comment_votes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            vote_type: voteType
          });
      }

      // Find the comment's post_id to refresh comments
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        setCurrentPage(1);
        setHasMore(true);
        fetchComments(comment.post_id, 1, false);
      }
    } catch (err) {
      console.error('Error voting on comment:', err);
    }
  }, [user, comments, fetchComments]);

  const updateComment = useCallback(async (commentId: string, content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ 
          content, 
          is_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('author_id', user.id);

      if (error) throw error;

      toast({
        title: "Commentaire modifié",
        description: "Votre commentaire a été mis à jour",
      });

      // Find the comment's post_id to refresh comments
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        setCurrentPage(1);
        setHasMore(true);
        fetchComments(comment.post_id, 1, false);
      }
    } catch (err: any) {
      console.error('Error updating comment:', err);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le commentaire",
        variant: "destructive",
      });
    }
  }, [user, comments, fetchComments, toast]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id);

      if (error) throw error;

      toast({
        title: "Commentaire supprimé",
        description: "Le commentaire a été supprimé",
      });

      // Find the comment's post_id to refresh comments
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        setCurrentPage(1);
        setHasMore(true);
        fetchComments(comment.post_id, 1, false);
      }
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le commentaire",
        variant: "destructive",
      });
    }
  }, [user, comments, fetchComments, toast]);

  const loadMoreComments = useCallback((postId: string) => {
    if (hasMore && !isLoading) {
      const nextPage = currentPage + 1;
      fetchComments(postId, nextPage, true);
    }
  }, [hasMore, isLoading, fetchComments, currentPage]);

  return {
    comments,
    isLoading,
    error,
    hasMore,
    fetchComments,
    loadMoreComments,
    createComment,
    voteComment,
    updateComment,
    deleteComment,
  };
}