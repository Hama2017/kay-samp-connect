import { useState, useEffect } from "react";
import { MessageCircle, ChevronUp, ChevronDown, Eye, Send, X } from "lucide-react";
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
  const { comments, isLoading, fetchComments, createComment } = useComments();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (post?.id && isOpen) {
      fetchComments(post.id);
    }
  }, [post?.id, isOpen, fetchComments]);

  if (!post) return null;

  const handleSubmitComment = async () => {
    if (newComment.trim() && post?.id) {
      try {
        await createComment({
          postId: post.id,
          content: newComment.trim()
        });
        setNewComment("");
      } catch (error) {
        console.error("Error creating comment:", error);
      }
    }
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
      <DrawerContent className="max-h-[90vh] flex flex-col">
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
                <div key={comment.id} className="flex items-start gap-3 py-2">
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
                    
                    {/* Votes pour commentaires - plus compacts */}
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 px-2 text-xs hover:text-green-600 hover:bg-green-50"
                      >
                        <ChevronUp className="h-3 w-3 mr-1" />
                        {comment.votes_up}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 px-2 text-xs hover:text-red-600 hover:bg-red-50"
                      >
                        <ChevronDown className="h-3 w-3 mr-1" />
                        {comment.votes_down || 0}
                      </Button>
                    </div>
                  </div>
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

        {/* Zone d'ajout de commentaire - fixe en bas */}
        <div className="flex-shrink-0 p-4 pt-3 border-t bg-background/95 backdrop-blur-sm">
          <div className="flex gap-3 items-end">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">
                Moi
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 flex gap-2 items-end">
              <Textarea
                placeholder="Votre commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[44px] max-h-24 resize-none flex-1 text-sm"
                rows={2}
              />
              
              <Button 
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isLoading}
                size="icon"
                className="rounded-full h-11 w-11 flex-shrink-0 bg-gradient-primary hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}