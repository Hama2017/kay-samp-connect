import React, { useState, useEffect } from "react";
import { MessageCircle, ChevronUp, ChevronDown, Eye, Send, X, Image } from "lucide-react";
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
import { useComments, Comment } from "@/hooks/useComments";
import PostMediaDisplay from "@/components/PostMediaDisplay";
import { useIsMobile } from "@/hooks/use-mobile";
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
  }>;
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
  const { comments, isLoading, fetchComments, createComment, voteComment } = useComments();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (post?.id && isOpen) {
      fetchComments(post.id);
    }
  }, [post?.id, isOpen, fetchComments]);

  if (!post) return null;

  const handleSubmitComment = async () => {
    if ((newComment.trim() || selectedGif || selectedImage) && post?.id) {
      try {
        // Prepare media URL (prioritize image over GIF)
        const mediaUrl = selectedImage || selectedGif || undefined;
        
        await createComment({
          postId: post.id,
          content: newComment.trim() || "",
          gifUrl: mediaUrl
        });
        
        setNewComment("");
        setSelectedGif(null);
        setSelectedImage(null);
        setShowGifSelector(false);
      } catch (error) {
        console.error("Error creating comment:", error);
      }
    }
  };

  const handleSubmitReply = async () => {
    if (replyContent.trim() && post?.id && replyingTo) {
      try {
        await createComment({
          postId: post.id,
          content: replyContent.trim(),
          parentCommentId: replyingTo
        });
        setReplyContent("");
        setReplyingTo(null);
      } catch (error) {
        console.error("Error creating reply:", error);
      }
    }
  };

  const handleGifSelect = (gifUrl: string) => {
    setSelectedGif(gifUrl);
    setSelectedImage(null); // Clear image if GIF is selected
    setShowGifSelector(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 60) {
      return `il y a ${diffInMinutes}min`;
    } else if (diffInMinutes < 1440) {
      return `il y a ${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `il y a ${Math.floor(diffInMinutes / 1440)}j`;
    }
  };

  const postImage = post.post_media?.[0]?.media_url;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[95vh] flex flex-col safe-area-bottom"
        style={{ 
          maxHeight: isMobile ? 'calc(100vh - env(keyboard-inset-height, 0px))' : '90vh' 
        }}
      >
        {/* Header avec titre et bouton fermer */}
        <DrawerHeader className="flex-shrink-0 p-4 pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold">
              Commentaires
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Post résumé optimisé pour mobile */}
        <div className="flex-shrink-0 p-4 pt-2 border-b bg-muted/20">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={post.profiles?.profile_picture_url || ""} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold text-sm">
                {post.profiles?.username?.substring(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-semibold text-sm">@{post.profiles?.username || "Unknown"}</span>
                {post.profiles?.is_verified && (
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary px-1.5 py-0.5">
                    ✓
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDate(post.created_at)}
                </span>
              </div>
              
              {/* Contenu du post - limité sur mobile */}
              <p className="text-sm text-foreground leading-relaxed mb-2 line-clamp-3">
                {post.content}
              </p>

              {/* Médias si présents - plus petits sur mobile */}
              {post.post_media && post.post_media.length > 0 && (
                <div className="mb-2">
                  <PostMediaDisplay 
                    media={post.post_media} 
                    maxHeight="max-h-32"
                    className="rounded-md"
                  />
                </div>
              )}
              
              {/* Statistiques compactes */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ChevronUp className="h-3 w-3 text-green-600" />
                  {post.votes_up}
                </span>
                <span className="flex items-center gap-1">
                  <ChevronDown className="h-3 w-3 text-red-600" />
                  {post.votes_down}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {post.comments_count}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {post.views_count}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des commentaires - scrollable */}
        <ScrollArea className="flex-1 px-4">
          <div className="py-4 space-y-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                Chargement...
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  {/* Commentaire principal */}
                  <div className="flex items-start gap-3 py-2">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={comment.profiles?.profile_picture_url || ""} />
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {comment.profiles?.username?.substring(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-sm">@{comment.profiles?.username || "Unknown"}</span>
                        {comment.profiles?.is_verified && (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary px-1 py-0">
                            ✓
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-foreground mb-2 leading-relaxed break-words">
                        {comment.content}
                      </p>
                      
                      {/* Afficher les médias du commentaire (GIFs) */}
                      {comment.comment_media && comment.comment_media.length > 0 && (
                        <div className="mb-2">
                          {comment.comment_media.map((media) => (
                            <img
                              key={media.id}
                              src={media.media_url}
                              alt="Comment GIF"
                              className="max-w-full h-auto rounded-md max-h-32"
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Actions du commentaire */}
                      <div className="flex items-center gap-2">
                         <Button 
                           variant="ghost" 
                           size="sm"
                           onClick={() => voteComment(comment.id, 'up')}
                           className="h-7 px-2 text-xs hover:text-green-600 hover:bg-green-50"
                         >
                           <ChevronUp className="h-3 w-3 mr-1" />
                           {comment.votes_up}
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="sm"
                           onClick={() => voteComment(comment.id, 'down')}
                           className="h-7 px-2 text-xs hover:text-red-600 hover:bg-red-50"
                         >
                           <ChevronDown className="h-3 w-3 mr-1" />
                           {comment.votes_down || 0}
                         </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="h-7 px-2 text-xs hover:text-primary hover:bg-primary/10"
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Répondre
                        </Button>
                      </div>
                      
                      {/* Zone de réponse */}
                      {replyingTo === comment.id && (
                        <div className="mt-3 p-3 bg-muted/30 rounded-lg border-l-2 border-primary/20">
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <Textarea
                                placeholder={`Répondre à @${comment.profiles?.username}...`}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="min-h-[32px] max-h-16 resize-none text-sm"
                                rows={1}
                              />
                            </div>
                            <Button 
                              onClick={handleSubmitReply}
                              disabled={!replyContent.trim() || isLoading}
                              size="sm"
                              className="h-8 px-3 text-xs"
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Répondre
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Affichage des réponses */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-11 space-y-2 pl-4 border-l-2 border-muted">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-3 py-2">
                          <Avatar className="h-6 w-6 flex-shrink-0">
                            <AvatarImage src={reply.profiles?.profile_picture_url || ""} />
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                              {reply.profiles?.username?.substring(0, 2).toUpperCase() || "??"}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-xs">@{reply.profiles?.username || "Unknown"}</span>
                              {reply.profiles?.is_verified && (
                                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary px-1 py-0">
                                  ✓
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatDate(reply.created_at)}
                              </span>
                            </div>
                            
                            <p className="text-xs text-foreground mb-1 leading-relaxed break-words">
                              {reply.content}
                            </p>
                            
                            {/* Médias de la réponse */}
                            {reply.comment_media && reply.comment_media.length > 0 && (
                              <div className="mb-1">
                                {reply.comment_media.map((media) => (
                                  <img
                                    key={media.id}
                                    src={media.media_url}
                                    alt="Reply GIF"
                                    className="max-w-full h-auto rounded-md max-h-24"
                                  />
                                ))}
                              </div>
                            )}
                            
                            {/* Votes pour les réponses */}
                            <div className="flex items-center gap-2">
                               <Button 
                                 variant="ghost" 
                                 size="sm"
                                 onClick={() => voteComment(reply.id, 'up')}
                                 className="h-6 px-1 text-xs hover:text-green-600 hover:bg-green-50"
                               >
                                 <ChevronUp className="h-3 w-3 mr-1" />
                                 {reply.votes_up}
                               </Button>
                               <Button 
                                 variant="ghost" 
                                 size="sm"
                                 onClick={() => voteComment(reply.id, 'down')}
                                 className="h-6 px-1 text-xs hover:text-red-600 hover:bg-red-50"
                               >
                                 <ChevronDown className="h-3 w-3 mr-1" />
                                 {reply.votes_down || 0}
                               </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm">Aucun commentaire</p>
                <p className="text-xs text-muted-foreground/70">Soyez le premier à commenter !</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Zone d'ajout de commentaire - fixe en bas et optimisée mobile */}
        <div className="flex-shrink-0 p-3 pt-2 border-t bg-background/98 backdrop-blur-sm">
          {/* Prévisualisation du GIF ou de l'image sélectionnée */}
          {(selectedGif || selectedImage) && (
            <div className="mb-2 p-2 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  {selectedImage ? 'Image sélectionnée' : 'GIF sélectionné'}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSelectedGif(null);
                    setSelectedImage(null);
                  }}
                  className="h-5 w-5 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <img
                src={selectedImage || selectedGif}
                alt={selectedImage ? "Image sélectionnée" : "GIF sélectionné"}
                className="max-w-full h-auto rounded-md max-h-16"
              />
            </div>
          )}
          
          {/* Interface de saisie optimisée sans avatar */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Textarea
                placeholder="Écrivez votre commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[42px] max-h-20 resize-none text-sm border-muted-foreground/20 focus:border-primary"
                rows={1}
              />
              
              {/* Ligne d'actions sous le textarea */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGifSelector(true)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
                  >
                    <Image className="h-3 w-3 mr-1" />
                    GIF
                  </Button>
                  
                  <CommentImageUpload
                    onImageUploaded={(imageUrl) => {
                      setSelectedImage(imageUrl);
                      setSelectedGif(null); // Clear GIF if image is selected
                    }}
                    selectedImage={selectedImage}
                    onRemoveImage={() => setSelectedImage(null)}
                  />
                </div>
                
                <Button 
                  onClick={handleSubmitComment}
                  disabled={(!newComment.trim() && !selectedGif && !selectedImage) || isLoading}
                  size="sm"
                  className="h-7 px-3 bg-gradient-primary hover:opacity-90 text-xs font-medium"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Publier
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
      </DrawerContent>
    </Drawer>
  );
}