import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, MessageCircle, Eye, Bookmark, BookmarkCheck, Share2, ExternalLink } from "lucide-react";
import { useRealBookmarks } from "@/hooks/useRealBookmarks";
import { useToast } from "@/hooks/use-toast";

interface PostActionsProps {
  post: {
    id: string;
    title?: string;
    content: string;
    votes_up: number;
    votes_down: number;
    comments_count: number;
    views_count: number;
    profiles: {
      username: string;
    };
  };
  onVote: (postId: string, voteType: 'up' | 'down') => void;
  onOpenComments?: () => void;
}

export function PostActions({ post, onVote, onOpenComments }: PostActionsProps) {
  const { isBookmarked, toggleBookmark } = useRealBookmarks();
  const { toast } = useToast();
  
  const bookmarked = isBookmarked(post.id, 'post');

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark({
      item_type: 'post',
      item_id: post.id,
      title: post.title || post.content.slice(0, 100),
      description: post.content,
      metadata: {
        author: post.profiles.username,
        likes: post.votes_up,
        comments: post.comments_count,
        category: 'post'
      }
    });
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post de @${post.profiles.username}`,
          text: post.content.slice(0, 100) + '...',
          url: window.location.origin + `/post/${post.id}`
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      const shareText = `Découvre ce post de @${post.profiles.username} sur KaaySamp !\n\n"${post.content.slice(0, 100)}..."\n\n${window.location.origin}/post/${post.id}`;
      
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Lien copié !",
          description: "Le lien du post a été copié dans le presse-papier",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de copier le lien",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Vote buttons */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-muted-foreground hover:text-green-600"
            onClick={(e) => {
              e.stopPropagation();
              onVote(post.id, 'up');
            }}
          >
            <ChevronUp className="h-4 w-4" />
            <span className="text-xs ml-1">{post.votes_up}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-muted-foreground hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onVote(post.id, 'down');
            }}
          >
            <ChevronDown className="h-4 w-4" />
            <span className="text-xs ml-1">{post.votes_down}</span>
          </Button>
        </div>
        
        {/* Comments button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-muted-foreground hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onOpenComments?.();
          }}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-xs ml-1">{post.comments_count}</span>
        </Button>

        {/* Bookmark button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-muted-foreground hover:text-primary"
          onClick={handleBookmarkToggle}
        >
          {bookmarked ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>

        {/* Share button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-muted-foreground hover:text-primary"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Views count */}
      <div className="flex items-center gap-1 text-muted-foreground">
        <Eye className="h-3 w-3" />
        <span className="text-xs">{post.views_count}</span>
      </div>
    </div>
  );
}