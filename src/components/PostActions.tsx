import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, MessageCircle, Eye, Bookmark, BookmarkCheck, Share2, ExternalLink } from "lucide-react";
import { useRealBookmarks } from "@/hooks/useRealBookmarks";
import { useNativeShare } from "@/hooks/useNativeShare";

interface PostActionsProps {
  post: {
    id: string;
    title?: string;
    content: string;
    votes_up: number;
    votes_down: number;
    comments_count: number;
    views_count: number;
    current_user_vote?: 'up' | 'down' | null;
    profiles: {
      username: string;
    };
  };
  onVote: (postId: string, voteType: 'up' | 'down') => void;
  onOpenComments?: () => void;
  hideCommentButton?: boolean;
}

export function PostActions({ post, onVote, onOpenComments, hideCommentButton = false }: PostActionsProps) {
  const { isBookmarked, toggleBookmark } = useRealBookmarks();
  const { share } = useNativeShare();
  
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

  await share({
    title: `Post de @${post.profiles.username}`,
    text: `Découvre ce post de @${post.profiles.username} sur KaaySamp !\n\n"${post.content.slice(0, 100)}..."`,
    url: `${window.location.origin}/post/${post.id}`,
    dialogTitle: 'Partager ce post',
  });
};


  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Vote buttons */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-8 px-2 ${
              post.current_user_vote === 'up' 
                ? 'text-green-600 bg-green-50' 
                : 'text-muted-foreground hover:text-green-600'
            }`}
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
            className={`h-8 px-2 ${
              post.current_user_vote === 'down' 
                ? 'text-red-600 bg-red-50' 
                : 'text-muted-foreground hover:text-red-600'
            }`}
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
        {!hideCommentButton && (
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
        )}

        {/* Bookmark button */}
       {/*  <Button 
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
        </Button> */}

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