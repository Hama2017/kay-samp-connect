import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, ChevronUp, ChevronDown, Send, X, Image } from "lucide-react";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerClose 
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useComments } from "@/hooks/useComments";
import { useIsMobile } from "@/hooks/use-mobile";
import GifSelector from "@/components/GifSelector";
import { CommentImageUpload } from "@/components/CommentImageUpload";

interface Post {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  votes_up: number;
  votes_down: number;
  comments_count: number;
  profiles: {
    id: string;
    username: string;
    profile_picture_url?: string;
    is_verified?: boolean;
  };
}

interface PostCommentsModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PostCommentsModal({ post, isOpen, onClose }: PostCommentsModalProps) {
  const [newComment, setNewComment] = useState("");
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showGifSelector, setShowGifSelector] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: boolean }>({});

  const { comments, isLoading, hasMore, fetchComments, loadMoreComments, createComment, voteComment } = useComments();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isLoadingMore = useRef(false);

  const isMobile = useIsMobile();

  // Chargement initial
  useEffect(() => {
    if (post?.id && isOpen) fetchComments(post.id, 1, false);
  }, [post?.id, isOpen, fetchComments]);

  // Reset quand modal fermé
  useEffect(() => {
    if (!isOpen) {
      setNewComment("");
      setSelectedGif(null);
      setSelectedImage(null);
      setShowGifSelector(false);
      setReplyingTo(null);
      setReplyContent("");
      setIsSubmitting(false);
      setExpandedReplies({});
    }
  }, [isOpen]);

  // Scroll infini automatique
  const handleScroll = useCallback(async (e: React.UIEvent<HTMLDivElement>) => {
    if (!hasMore || isLoading || isLoadingMore.current || !post?.id) return;

    const target = e.target as HTMLDivElement;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 200) {
      isLoadingMore.current = true;
      try { await loadMoreComments(post.id); } 
      finally { isLoadingMore.current = false; }
    }
  }, [hasMore, isLoading, post?.id, loadMoreComments]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffInMinutes < 1) return "à l'instant";
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}j`;
  };

  const removeMedia = () => { setSelectedGif(null); setSelectedImage(null); };

  const handleSubmitComment = async () => {
    if ((!newComment.trim() && !selectedGif && !selectedImage) || !post?.id || isSubmitting) return;
    setIsSubmitting(true);
    try { await createComment({ postId: post.id, content: newComment.trim(), gifUrl: selectedImage || selectedGif || undefined }); }
    finally { setNewComment(""); setSelectedGif(null); setSelectedImage(null); setIsSubmitting(false); }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !post?.id || !replyingTo || isSubmitting) return;
    setIsSubmitting(true);
    try { await createComment({ postId: post.id, content: replyContent.trim(), parentCommentId: replyingTo }); }
    finally { setReplyContent(""); setReplyingTo(null); setIsSubmitting(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); action(); } };
  const handleGifSelect = (gifUrl: string) => { setSelectedGif(gifUrl); setSelectedImage(null); setShowGifSelector(false); };

  const CommentActions = ({ comment, isReply = false }: { comment: any; isReply?: boolean }) => (
    <div className="flex items-center gap-3">
      <button onClick={() => voteComment(comment.id, 'up')} className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 px-2 py-1 rounded" disabled={isSubmitting}>
        <ChevronUp className="h-3 w-3" /> {comment.votes_up || 0}
      </button>
      <button onClick={() => voteComment(comment.id, 'down')} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 px-2 py-1 rounded" disabled={isSubmitting}>
        <ChevronDown className="h-3 w-3" /> {comment.votes_down || 0}
      </button>
      {!isReply && (
        <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 px-2 py-1 rounded" disabled={isSubmitting}>
          <MessageCircle className="h-3 w-3" /> Répondre
        </button>
      )}
    </div>
  );

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0 border-b py-3">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold">Commentaires ({post?.comments_count || 0})</DrawerTitle>
            <DrawerClose asChild><Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button></DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 relative overflow-auto" onScroll={handleScroll} ref={scrollAreaRef}>
          <ScrollArea className="h-full">
            <div className="px-4 py-4 space-y-4">
              {comments.length === 0 && isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin h-6 w-6 border-2 border-green-600 border-t-transparent rounded-full mb-3"></div>
                  <span>Chargement...</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-16 text-gray-500"><MessageCircle className="mx-auto h-12 w-12 mb-2" />Aucun commentaire</div>
              ) : (
                comments.map(comment => {
                  const repliesToShow = expandedReplies[comment.id] ? comment.replies : comment.replies?.slice(0,2);
                  const hiddenRepliesCount = comment.replies?.length ? comment.replies.length - (repliesToShow?.length || 0) : 0;

                  return (
                    <div key={comment.id} className="space-y-2">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8"><AvatarImage src={comment.profiles?.profile_picture_url} /><AvatarFallback>{comment.profiles?.username?.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                        <div className="flex-1 bg-gray-50 rounded p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.profiles?.username}</span>
                            {comment.profiles?.is_verified && <Badge className="bg-green-600 text-white text-xs">✓</Badge>}
                            <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                          {comment.comment_media?.map(media => <img key={media.id} src={media.media_url} alt="" className="mt-2 max-h-32 rounded border" />)}
                          <CommentActions comment={comment} />
                          {replyingTo === comment.id && (
                            <div className="mt-2">
                              <Textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} onKeyDown={e => handleKeyDown(e, handleSubmitReply)} rows={2} className="w-full border-gray-200" disabled={isSubmitting} placeholder={`Répondre à @${comment.profiles.username}`} />
                              <div className="flex justify-end gap-2 mt-1">
                                <Button onClick={() => setReplyingTo(null)} variant="ghost" size="sm">Annuler</Button>
                                <Button onClick={handleSubmitReply} size="sm" disabled={!replyContent.trim() || isSubmitting}>Répondre</Button>
                              </div>
                            </div>
                          )}
                          {repliesToShow?.length > 0 && (
                            <div className="ml-10 mt-2 space-y-2 border-l-2 border-gray-200 pl-3">
                              {repliesToShow.map(reply => (
                                <div key={reply.id} className="flex items-start gap-2">
                                  <Avatar className="h-6 w-6"><AvatarImage src={reply.profiles?.profile_picture_url} /><AvatarFallback>{reply.profiles?.username?.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                                  <div className="flex-1 bg-gray-50 rounded p-2">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-xs">{reply.profiles?.username}</span>
                                      <span className="text-xs text-gray-400">{formatDate(reply.created_at)}</span>
                                    </div>
                                    <p className="text-xs">{reply.content}</p>
                                    <CommentActions comment={reply} isReply />
                                  </div>
                                </div>
                              ))}
                              {hiddenRepliesCount > 0 && (
                                <Button variant="ghost" size="sm" className="text-xs mt-1" onClick={() => setExpandedReplies({...expandedReplies, [comment.id]: true})}>
                                  Voir {hiddenRepliesCount} réponses
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {isLoadingMore.current && <div className="flex justify-center py-3 text-gray-500">Chargement...</div>}
            </div>
          </ScrollArea>
        </div>

        {/* Zone de saisie */}
        <div className="flex-shrink-0 bg-white border-t p-4 space-y-3">
          {(selectedGif || selectedImage) && (
            <div className="p-2 bg-gray-50 rounded border flex justify-between items-center">
              <span className="text-xs">{selectedGif ? 'GIF sélectionné' : 'Image sélectionnée'}</span>
              <Button size="sm" variant="ghost" onClick={removeMedia}><X className="h-3 w-3" /></Button>
            </div>
          )}
          <Textarea value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => handleKeyDown(e, handleSubmitComment)} rows={2} className="border-gray-200" disabled={isSubmitting} placeholder="Ajouter un commentaire..." />
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowGifSelector(true)} disabled={isSubmitting}><Image className="h-4 w-4 mr-1" />GIF</Button>
              <CommentImageUpload selectedImage={selectedImage} onImageUploaded={(url)=>{setSelectedImage(url); setSelectedGif(null)}} onRemoveImage={()=>setSelectedImage(null)} />
            </div>
            <Button onClick={handleSubmitComment} disabled={(!newComment.trim() && !selectedGif && !selectedImage) || isSubmitting}><Send className="h-4 w-4 mr-1" />Publier</Button>
          </div>
          <p className="text-xs text-gray-500 text-center">Cmd+Entrée pour publier</p>
          <GifSelector isOpen={showGifSelector} onClose={() => setShowGifSelector(false)} onSelectGif={handleGifSelect} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
