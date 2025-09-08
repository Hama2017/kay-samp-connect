import { useState, useEffect } from "react";
import { MessageCircle, ChevronUp, ChevronDown, Eye, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useComments, Comment } from "@/hooks/useComments";
import PostMediaDisplay from "@/components/PostMediaDisplay";

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-lg font-semibold">Commentaires</DialogTitle>
        </DialogHeader>

        {/* Post complet avec tous les détails */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.profiles?.profile_picture_url || ""} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                {post.profiles?.username?.substring(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm">@{post.profiles?.username || "Unknown"}</span>
                {post.profiles?.is_verified && (
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                    ✓
                  </Badge>
                )}
                {post.spaces && (
                  <span className="text-xs text-muted-foreground">
                    dans {post.spaces.name}
                  </span>
                )}
              </div>
              
              {/* Contenu complet du post */}
              <p className="text-foreground leading-relaxed mb-3 whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Médias si présents */}
              <PostMediaDisplay 
                media={post.post_media || []} 
                maxHeight="max-h-96"
                showControls={true}
              />

              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.hashtags.map((tag) => (
                    <span key={tag} className="text-sm text-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Statistiques complètes */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-green-600">
                    <ChevronUp className="h-4 w-4" />
                    {post.votes_up}
                  </span>
                  <span className="flex items-center gap-1 text-red-600">
                    <ChevronDown className="h-4 w-4" />
                    {post.votes_down}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  {post.comments_count} commentaires
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  {post.views_count} vues
                </span>
                <span className="text-muted-foreground">{formatDate(post.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <ScrollArea className="flex-1 max-h-60">
          <div className="px-6 py-4 space-y-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground">Chargement des commentaires...</div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profiles?.profile_picture_url || ""} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {comment.profiles?.username?.substring(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">@{comment.profiles?.username || "Unknown"}</span>
                      {comment.profiles?.is_verified && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          ✓
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground mb-2 leading-relaxed">
                      {comment.content}
                    </p>
                    
                    {/* Boutons Up/Down pour les commentaires */}
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 px-2 text-xs hover:text-green-600"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <span className="text-xs text-muted-foreground">{comment.votes_up}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 px-2 text-xs hover:text-red-600"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground">Aucun commentaire pour le moment</div>
            )}
          </div>
        </ScrollArea>

        {/* Add Comment - Fixed inside modal */}
        <div className="p-6 pt-4 border-t bg-background">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                Moi
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 flex gap-3 items-end">
              <Textarea
                placeholder="Ajouter un commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px] resize-none flex-1"
              />
              
              <Button 
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isLoading}
                size="icon"
                className="rounded-full h-10 w-10 flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}