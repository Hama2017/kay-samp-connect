import { useState } from "react";
import { MessageCircle, ArrowUp, Heart, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Post {
  id: string;
  author: {
    username: string;
    profilePicture: string;
    isVerified: boolean;
  };
  space: {
    name: string;
    id: string;
  };
  content: string;
  publicationDate: string;
  votesUp: number;
  votesDown: number;
  commentsCount: number;
  viewsCount: number;
  category: string;
  hashtags: string[];
}

interface Comment {
  id: string;
  author: {
    username: string;
    profilePicture: string;
    isVerified: boolean;
  };
  content: string;
  date: string;
  likes: number;
}

interface PostCommentsModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

// Mock comments data
const mockComments: Comment[] = [
  {
    id: "1",
    author: {
      username: "MarieD",
      profilePicture: "",
      isVerified: true,
    },
    content: "Excellente analyse ! J'espère vraiment qu'ils vont jouer avec cette formation.",
    date: "2024-03-15T09:15:00Z",
    likes: 12,
  },
  {
    id: "2",
    author: {
      username: "OusmaneSy",
      profilePicture: "",
      isVerified: false,
    },
    content: "Mané doit absolument être titulaire ! 🔥",
    date: "2024-03-15T09:30:00Z",
    likes: 8,
  },
  {
    id: "3",
    author: {
      username: "AminaK",
      profilePicture: "",
      isVerified: false,
    },
    content: "Je pense que Sarr va faire la différence sur l'aile droite",
    date: "2024-03-15T10:00:00Z",
    likes: 5,
  },
];

export function PostCommentsModal({ post, isOpen, onClose }: PostCommentsModalProps) {
  const [newComment, setNewComment] = useState("");

  if (!post) return null;

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      // Here you would typically send the comment to your backend
      console.log("New comment:", newComment);
      setNewComment("");
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-lg font-semibold">Commentaires</DialogTitle>
        </DialogHeader>

        {/* Original Post */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.profilePicture} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                {post.author.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm">@{post.author.username}</span>
                {post.author.isVerified && (
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                    ✓
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  dans {post.space.name}
                </span>
              </div>
              
              <p className="text-foreground leading-relaxed mb-3">
                {post.content}
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-primary">
                    <ArrowUp className="h-4 w-4" />
                    <span className="text-xs ml-1">{post.votesUp}</span>
                  </Button>
                </div>
                
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-xs">{post.commentsCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <ScrollArea className="flex-1 max-h-60">
          <div className="px-6 py-4 space-y-4">
            {mockComments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author.profilePicture} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    {comment.author.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">@{comment.author.username}</span>
                    {comment.author.isVerified && (
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                        ✓
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.date)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-foreground mb-2 leading-relaxed">
                    {comment.content}
                  </p>
                  
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-muted-foreground hover:text-primary">
                    <Heart className="h-3 w-3 mr-1" />
                    <span className="text-xs">{comment.likes}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Add Comment */}
        <div className="p-6 pt-4 border-t">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                Moi
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Ajouter un commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px] resize-none"
              />
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  size="sm"
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Publier
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}