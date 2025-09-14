import { useState, useEffect, useCallback } from "react";
import { MessageCircle, ArrowUp, Eye } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import PostMediaDisplay from "@/components/PostMediaDisplay";
import { useNavigate } from "react-router-dom";
import { PostActions } from "@/components/PostActions";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useRealBookmarks } from "@/hooks/useRealBookmarks";

interface Post {
  id: string;
  title?: string;
  content: string;
  votes_up: number;
  votes_down: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  author_id: string;
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
    category?: string;
  };
  post_media?: Array<{
    id: string;
    media_url: string;
    media_type: string;
  }>;
}

interface InfinitePostsListProps {
  posts: Post[];
  onLoadMore: () => Promise<void>;
  onVote: (postId: string, voteType: 'up' | 'down') => Promise<void>;
  onIncrementViews: (postId: string) => void;
  onPostClick?: (post: Post) => void;
  hasMore: boolean;
  isLoading: boolean;
}

export function InfinitePostsList({ 
  posts, 
  onLoadMore, 
  onVote, 
  onIncrementViews,
  onPostClick,
  hasMore, 
  isLoading 
}: InfinitePostsListProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isBookmarked, toggleBookmark } = useRealBookmarks();
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - 1000 && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handlePostClick = (post: Post) => {
    if (onPostClick) {
      onPostClick(post);
    } else {
      navigate(`/post/${post.id}`);
    }
    onIncrementViews(post.id);
  };

  const toggleExpanded = (postId: string) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const isPostExpanded = (postId: string) => expandedPosts.has(postId);
  const shouldShowReadMore = (content: string) => content.length > 200;
  
  const getDisplayContent = (post: Post) => {
    if (!shouldShowReadMore(post.content) || isPostExpanded(post.id)) {
      return post.content;
    }
    return post.content.substring(0, 200) + "...";
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

  const handleBookmarkToggle = (post: Post) => {
    toggleBookmark({
      item_type: "post",
      item_id: post.id,
      title: post.title || post.content.slice(0, 100),
      description: post.content,
      metadata: {
        author: post.profiles.username,
        likes: post.votes_up,
        comments: post.comments_count,
        category: "post",
      },
    });
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {posts.map((post) => {
        const bookmarked = isBookmarked(post.id, "post");

        return (
        <Card 
          key={post.id} 
          className="hover:shadow-primary/10 hover:shadow-lg transition-all duration-300 animate-fade-in-up max-w-full overflow-hidden"
        >
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Avatar 
                  className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (user?.profile?.username === post.profiles.username) {
                      navigate('/profile');
                    } else {
                      navigate(`/user/${post.profiles.username}`);
                    }
                  }}
                >
                  <AvatarImage src={post.profiles.profile_picture_url} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold text-xs sm:text-sm">
                    {post.profiles.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span 
                      className="font-semibold text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors truncate"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (user?.profile?.username === post.profiles.username) {
                          navigate('/profile');
                        } else {
                          navigate(`/user/${post.profiles.username}`);
                        }
                      }}
                    >
                      @{post.profiles.username}
                    </span>
                    {post.profiles.is_verified && (
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary flex-shrink-0">
                        ✓
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {post.spaces?.name ? `dans ${post.spaces.name}` : "dans Général"} • {formatDate(post.created_at)}
                  </p>
                </div>
              </div>

              {/* Bouton favoris */}
              <Button
                variant={bookmarked ? "default" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookmarkToggle(post);
                }}
                className={`text-xs px-3 py-1.5 h-8 font-medium rounded-full ${
                  bookmarked
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary"
                    : "hover:bg-muted border-muted-foreground/20"
                }`}
              >
                {bookmarked ? "Sampna" : "DemaySamp"}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
            <div 
              className="text-foreground mb-3 leading-relaxed break-all max-w-full overflow-wrap-anywhere"
              dangerouslySetInnerHTML={{
                __html: getDisplayContent(post).replace(/#(\w+)/g, '<span style="color: hsl(var(--primary)); font-weight: 600;">#$1</span>')
              }}
            />
            
            {shouldShowReadMore(post.content) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(post.id);
                }}
                className="text-primary text-sm font-medium mb-3 hover:underline"
              >
                {isPostExpanded(post.id) ? "Lire moins" : "Lire la suite"}
              </button>
            )}
            
            <PostMediaDisplay 
              media={post.post_media || []} 
             maxHeight="max-h-[70vh]"
            />
            
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {post.hashtags.map((tag, index) => (
                  <span key={index} className="text-xs text-primary hover:text-primary/80 cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <PostActions 
              post={post}
              onVote={onVote}
              onOpenComments={() => navigate(`/post/${post.id}`)}
            />
          </CardContent>
        </Card>
      )})}
      
      {isLoading && (
        <div className="flex justify-center py-6">
          <LoadingSpinner size="sm" text="Chargement..." />
        </div>
      )}
      
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <p>Vous avez vu tous les posts disponibles</p>
        </div>
      )}
    </div>
  );
}
