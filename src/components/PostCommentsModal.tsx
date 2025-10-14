import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, ChevronDown, Send, X, Image, ChevronUp, ThumbsDown } from "lucide-react";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerClose 
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useComments } from "@/hooks/useComments";
import GifSelector from "@/components/GifSelector";
import { CommentImageUpload } from "@/components/CommentImageUpload";

interface Post {
  id: string;
  author_id: string;
  space_id?: string;
  content: string;
  title?: string;
  created_at: string;
  votes_up: number;
  votes_down: number;
  comments_count: number;
  views_count: number;
  hashtags?: string[];
  current_user_vote?: 'up' | 'down' | null;
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
  }>;
}

interface PostCommentsModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onVote: (postId: string, voteType: 'up' | 'down') => Promise<void>;
}

export function PostCommentsModal({ post, isOpen, onClose, onVote }: PostCommentsModalProps) {
  const [commentContent, setCommentContent] = useState("");
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showGifSelector, setShowGifSelector] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyingToUsername, setReplyingToUsername] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [optimisticVotes, setOptimisticVotes] = useState<Record<string, { up: number; down: number; userVote: 'up' | 'down' | null }>>({});
  
  const { comments, isLoading, hasMore, fetchComments, loadMoreComments, createComment, voteComment } = useComments();

  // Chargement initial des commentaires
  useEffect(() => {
    if (post?.id && isOpen) {
      fetchComments(post.id, 1, false);
    }
  }, [post?.id, isOpen, fetchComments]);

  // Reset des états quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      setCommentContent("");
      setSelectedGif(null);
      setSelectedImage(null);
      setShowGifSelector(false);
      setReplyingTo(null);
      setReplyingToUsername("");
      setIsSubmitting(false);
      setExpandedReplies(new Set());
      setFullscreenImage(null);
      setOptimisticVotes({});
    }
  }, [isOpen]);

  // Fonction pour gérer les votes avec mise à jour optimiste
  const handleVoteComment = useCallback(async (commentId: string, voteType: 'up' | 'down') => {
    // Trouver le commentaire actuel
    const findComment = (comments: any[]): any => {
      for (const comment of comments) {
        if (comment.id === commentId) return comment;
        if (comment.replies) {
          const found = findComment(comment.replies);
          if (found) return found;
        }
      }
      return null;
    };

    const currentComment = findComment(comments);
    if (!currentComment) return;

    const currentVote = optimisticVotes[commentId]?.userVote || currentComment.current_user_vote;
    const currentUpVotes = optimisticVotes[commentId]?.up ?? currentComment.votes_up ?? 0;
    const currentDownVotes = optimisticVotes[commentId]?.down ?? currentComment.votes_down ?? 0;

    let newUpVotes = currentUpVotes;
    let newDownVotes = currentDownVotes;
    let newUserVote: 'up' | 'down' | null = voteType;

    // Calculer les nouveaux votes
    if (currentVote === voteType) {
      // Annuler le vote
      if (voteType === 'up') {
        newUpVotes = Math.max(0, currentUpVotes - 1);
      } else {
        newDownVotes = Math.max(0, currentDownVotes - 1);
      }
      newUserVote = null;
    } else if (currentVote === null) {
      // Nouveau vote
      if (voteType === 'up') {
        newUpVotes = currentUpVotes + 1;
      } else {
        newDownVotes = currentDownVotes + 1;
      }
    } else {
      // Changer de vote
      if (voteType === 'up') {
        newUpVotes = currentUpVotes + 1;
        newDownVotes = Math.max(0, currentDownVotes - 1);
      } else {
        newDownVotes = currentDownVotes + 1;
        newUpVotes = Math.max(0, currentUpVotes - 1);
      }
    }

    // Mise à jour optimiste
    setOptimisticVotes(prev => ({
      ...prev,
      [commentId]: {
        up: newUpVotes,
        down: newDownVotes,
        userVote: newUserVote
      }
    }));

    // Appel API
    try {
      await voteComment(commentId, voteType);
    } catch (error) {
      // En cas d'erreur, revenir à l'état précédent
      setOptimisticVotes(prev => ({
        ...prev,
        [commentId]: {
          up: currentUpVotes,
          down: currentDownVotes,
          userVote: currentVote
        }
      }));
      console.error("Error voting:", error);
    }
  }, [comments, optimisticVotes, voteComment]);

  // Fonction pour obtenir les votes d'un commentaire
  const getCommentVotes = useCallback((comment: any) => {
    const optimistic = optimisticVotes[comment.id];
    if (optimistic) {
      return {
        votes_up: optimistic.up,
        votes_down: optimistic.down,
        current_user_vote: optimistic.userVote
      };
    }
    return {
      votes_up: comment.votes_up || 0,
      votes_down: comment.votes_down || 0,
      current_user_vote: comment.current_user_vote
    };
  }, [optimisticVotes]);

  // Formatage de la date
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return "à l'instant";
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}j`;
  }, []);

  // Soumission de commentaire
  const handleSubmitComment = useCallback(async () => {
    if ((!commentContent.trim() && !selectedGif && !selectedImage) || !post?.id || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const mediaUrl = selectedImage || selectedGif || undefined;
      
      await createComment({
        postId: post.id,
        content: commentContent.trim() || "",
        gifUrl: mediaUrl,
        parentCommentId: replyingTo || undefined
      });
      
      setCommentContent("");
      setSelectedGif(null);
      setSelectedImage(null);
      setShowGifSelector(false);
      setReplyingTo(null);
      setReplyingToUsername("");
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [commentContent, selectedGif, selectedImage, post?.id, replyingTo, isSubmitting, createComment]);

  // Sélection de GIF
  const handleGifSelect = useCallback((gifUrl: string) => {
    setSelectedGif(gifUrl);
    setSelectedImage(null);
    setShowGifSelector(false);
  }, []);

  // Gestion des touches
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmitComment();
    }
  }, [handleSubmitComment]);

  // Suppression des médias
  const removeMedia = useCallback(() => {
    setSelectedGif(null);
    setSelectedImage(null);
  }, []);

  // Gestion des réponses
  const handleReplyClick = useCallback((commentId: string, username: string) => {
    if (replyingTo === commentId) {
      setReplyingTo(null);
      setReplyingToUsername("");
      setCommentContent("");
    } else {
      setReplyingTo(commentId);
      setReplyingToUsername(username);
      setCommentContent("");
    }
  }, [replyingTo]);

  // Annulation de réponse
  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
    setReplyingToUsername("");
    setCommentContent("");
  }, []);

  // Toggle des réponses
  const toggleReplies = useCallback((commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  if (!post) return null;

  const getPlaceholder = () => {
    if (replyingTo && replyingToUsername) {
      return `Répondre à @${replyingToUsername}...`;
    }
    return "Ajouter un commentaire...";
  };

  const getButtonText = () => {
    if (isSubmitting) return "...";
    return replyingTo ? "Répondre" : "Publier";
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh] h-auto flex flex-col bg-background">
        {/* Header - Style TikTok */}
        <DrawerHeader className="flex-shrink-0 border-b border-border py-4 bg-background">
          <div className="flex items-center justify-center relative">
            <DrawerTitle className="text-lg font-semibold text-foreground text-center">
              {post.comments_count} commentaires
            </DrawerTitle>
            <DrawerClose asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 h-8 w-8 hover:bg-accent rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Zone de commentaires */}
        <div className="flex-1 relative overflow-auto bg-background">
          <ScrollArea className="h-full">
            <div className="px-0 py-0">
              {isLoading && comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mb-3"></div>
                  <p className="text-muted-foreground text-sm">Chargement des commentaires...</p>
                </div>
              ) : comments.length > 0 ? (
                <div className="divide-y divide-border">
                  {comments.map((comment) => (
                    <div key={comment.id} className="py-4 px-4">
                      {/* Commentaire principal - Style TikTok */}
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={comment.profiles?.profile_picture_url || ""} />
                          <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
                            {comment.profiles?.username?.substring(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          {/* Username et temps */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-base text-foreground">
                              {comment.profiles?.username || "Unknown"}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          
                          {/* Contenu du commentaire */}
                          {comment.content && (
                            <p className="text-base text-foreground mb-2 leading-normal break-all">
                              {comment.content}
                            </p>
                          )}
                          
                          {/* Médias du commentaire */}
                          {comment.comment_media && comment.comment_media.length > 0 && (
                            <div className="mb-3">
                              {comment.comment_media.map((media: any) => (
                                <img
                                  key={media.id}
                                  src={media.media_url}
                                  alt="Comment media"
                                  className="max-w-full h-auto rounded-lg max-h-40 border border-border cursor-pointer hover:opacity-90 transition-opacity"
                                  loading="lazy"
                                  onClick={() => setFullscreenImage(media.media_url)}
                                />
                              ))}
                            </div>
                          )}
                          
                          {/* Actions - Flèches au lieu du coeur */}
                          <div className="flex items-center gap-6 mt-2">
                            <button 
                              onClick={() => handleVoteComment(comment.id, 'up')}
                              className="flex items-center gap-2 text-muted-foreground hover:text-green-500 transition-colors"
                              disabled={isSubmitting}
                            >
                              <ChevronUp className={`h-4 w-4 ${getCommentVotes(comment).current_user_vote === 'up' ? 'text-green-500' : ''}`} />
                              <span className="text-sm font-medium">{getCommentVotes(comment).votes_up}</span>
                            </button>
                            
                            <button 
                              onClick={() => handleVoteComment(comment.id, 'down')}
                              className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors"
                              disabled={isSubmitting}
                            >
                              <ChevronDown className={`h-4 w-4 ${getCommentVotes(comment).current_user_vote === 'down' ? 'text-red-500' : ''}`} />
                              <span className="text-sm font-medium">{getCommentVotes(comment).votes_down}</span>
                            </button>
                            
                            <button 
                              onClick={() => handleReplyClick(comment.id, comment.profiles?.username || "Unknown")}
                              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                              disabled={isSubmitting}
                            >
                              Répondre
                            </button>
                          </div>
                          
                          {/* Bouton pour afficher/masquer les réponses - Style TikTok */}
                          {comment.replies && comment.replies.length > 0 && (
                            <button
                              onClick={() => toggleReplies(comment.id)}
                              className="flex items-center gap-2 mt-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <span className="text-sm font-medium">
                                {expandedReplies.has(comment.id) ? (
                                  `Masquer les ${comment.replies.length} réponses`
                                ) : (
                                  `Afficher les ${comment.replies.length} réponses`
                                )}
                              </span>
                              <ChevronDown className={`h-4 w-4 transition-transform ${
                                expandedReplies.has(comment.id) ? 'rotate-180' : ''
                              }`} />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Réponses - Style TikTok avec indentation */}
                      {comment.replies && comment.replies.length > 0 && expandedReplies.has(comment.id) && (
                        <div className="mt-4 space-y-4">
                          {comment.replies.map((reply: any) => (
                            <div key={reply.id} className="flex items-start gap-3 ml-8 border-l-2 border-border pl-4">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={reply.profiles?.profile_picture_url || ""} />
                                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                  {reply.profiles?.username?.substring(0, 2).toUpperCase() || "??"}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm text-foreground">
                                    {reply.profiles?.username || "Unknown"}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(reply.created_at)}
                                  </span>
                                </div>
                                
                                <p className="text-base text-foreground mb-2 leading-normal break-all">
                                  {reply.content}
                                </p>

                                {/* Médias des réponses */}
                                {reply.comment_media && reply.comment_media.length > 0 && (
                                  <div className="mb-3">
                                    {reply.comment_media.map((media: any) => (
                                      <img
                                        key={media.id}
                                        src={media.media_url}
                                        alt="Comment media"
                                        className="max-w-full h-auto rounded-lg max-h-40 border border-border cursor-pointer hover:opacity-90 transition-opacity"
                                        loading="lazy"
                                        onClick={() => setFullscreenImage(media.media_url)}
                                      />
                                    ))}
                                  </div>
                                )}

                                <div className="flex items-center gap-4 mt-2">
                                  <button 
                                    onClick={() => handleVoteComment(reply.id, 'up')}
                                    className="flex items-center gap-1.5 text-muted-foreground hover:text-green-500 transition-colors"
                                    disabled={isSubmitting}
                                  >
                                    <ChevronUp className={`h-3 w-3 ${getCommentVotes(reply).current_user_vote === 'up' ? 'text-green-500' : ''}`} />
                                    <span className="text-xs">{getCommentVotes(reply).votes_up}</span>
                                  </button>
                                  
                                  <button 
                                    onClick={() => handleVoteComment(reply.id, 'down')}
                                    className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                                    disabled={isSubmitting}
                                  >
                                    <ChevronDown className={`h-3 w-3 ${getCommentVotes(reply).current_user_vote === 'down' ? 'text-red-500' : ''}`} />
                                    <span className="text-xs">{getCommentVotes(reply).votes_down}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Bouton charger plus */}
                  {hasMore && (
                    <div className="text-center py-4">
                      <Button
                        variant="ghost"
                        onClick={() => loadMoreComments(post.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                            Chargement...
                          </>
                        ) : (
                          "Charger plus de commentaires"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground font-medium mb-1">Aucun commentaire</p>
                  <p className="text-sm text-muted-foreground">Soyez le premier à commenter !</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Zone de saisie - Style TikTok */}
        <div className="flex-shrink-0 bg-background border-t border-border p-4">
          {/* Indicateur de réponse */}
          {replyingTo && replyingToUsername && (
            <div className="mb-3 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  Réponse à <span className="font-semibold">@{replyingToUsername}</span>
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleCancelReply}
                  className="h-6 w-6 p-0 hover:bg-accent rounded-full"
                  disabled={isSubmitting}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Prévisualisation média */}
          {(selectedGif || selectedImage) && (
            <div className="mb-3 p-2 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">
                  {selectedImage ? 'Image sélectionnée' : 'GIF sélectionné'}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={removeMedia}
                  className="h-5 w-5 p-0 hover:bg-accent rounded"
                  disabled={isSubmitting}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <img
                src={selectedImage || selectedGif || ""}
                alt="Preview"
                className="max-w-full h-auto rounded max-h-20"
              />
            </div>
          )}
          
          {/* Interface de saisie avec avatar utilisateur */}
          <div className="flex items-start gap-3">
            <Avatar 
              className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 ring-2 ring-[#1f9463]/10 hover:ring-[#1f9463]/20"
            >
              <AvatarImage src={post.profiles.profile_picture_url} />
              <AvatarFallback className="bg-gradient-to-r from-[#1f9463] to-[#43ca92] text-white font-semibold text-xs sm:text-sm">
                {post.profiles.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder={getPlaceholder()}
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[44px] resize-none border-border focus:border-primary focus:ring-primary text-base bg-muted"
                rows={1}
                disabled={isSubmitting}
              />
              
              {/* Actions en bas - Seulement GIF et Image */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGifSelector(true)}
                    className="flex items-center gap-1 h-8 px-2"
                    disabled={isSubmitting}
                  >
                    <Image className="h-4 w-4" />
                    <span className="text-xs">GIF</span>
                  </Button>
                  
                  <CommentImageUpload
                    onImageUploaded={(imageUrl) => {
                      setSelectedImage(imageUrl);
                      setSelectedGif(null);
                    }}
                    selectedImage={selectedImage}
                    onRemoveImage={() => setSelectedImage(null)}
                  />
                </div>
                
                <Button 
                  onClick={handleSubmitComment}
                  disabled={(!commentContent.trim() && !selectedGif && !selectedImage) || isSubmitting}
                  variant="default"
                >
                  {getButtonText()}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sélecteur de GIF */}
        <GifSelector
          isOpen={showGifSelector}
          onClose={() => setShowGifSelector(false)}
          onSelectGif={handleGifSelect}
        />

        {/* Visionneuse plein écran pour les images */}
        {fullscreenImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-[100] rounded-sm border-2 border-black flex items-center justify-center p-14"
            onClick={() => setFullscreenImage(null)}
          >
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-8 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <img
              src={fullscreenImage}
              alt="Fullscreen view"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}