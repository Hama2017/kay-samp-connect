import { useState, useEffect, useCallback, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { MessageCircle, BadgeCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import PostMediaDisplay from "@/components/PostMediaDisplay";
import { useNavigate } from "react-router-dom";
import { PostActions } from "@/components/PostActions";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useRealBookmarks } from "@/hooks/useRealBookmarks";
import { PostCommentsModal } from "@/components/PostCommentsModal";
import { sanitizeContent } from "@/utils/contentSanitizer";

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
    full_name?: string;
  } | null;
  spaces?: {
    id: string;
    name: string;
    category?: string;
  };
  post_media?: Array<{
    id: string;
    media_url: string;
    media_type: string;
    youtube_video_id?: string;
    tiktok_video_id?: string;
    thumbnail_url?: string;
  }>;
}

interface VirtualizedPostsListProps {
  posts: Post[];
  onLoadMore: () => Promise<void>;
  onVote: (postId: string, voteType: 'up' | 'down') => Promise<void>;
  onIncrementViews: (postId: string) => void;
  onPostClick?: (post: Post) => void;
  hasMore: boolean;
  isLoading: boolean;
}

export function VirtualizedPostsList({ 
  posts, 
  onLoadMore, 
  onVote, 
  onIncrementViews,
  onPostClick,
  hasMore, 
  isLoading 
}: VirtualizedPostsListProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isBookmarked, toggleBookmark } = useRealBookmarks();
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const parentRef = useRef<HTMLDivElement>(null);
  
  // États pour le modal de commentaires
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

  // Virtualizer configuration
  const virtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400, // Estimated height of each post card
    overscan: 3, // Number of items to render outside of the visible area
  });

  // Load more when scrolling near the bottom
  useEffect(() => {
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse();
    
    if (!lastItem) return;
    
    if (
      lastItem.index >= posts.length - 3 &&
      hasMore &&
      !isLoading
    ) {
      onLoadMore();
    }
  }, [virtualizer.getVirtualItems(), posts.length, hasMore, isLoading, onLoadMore]);

  const handlePostClick = (post: Post) => {
    if (onPostClick) {
      onPostClick(post);
    } else {
      navigate(`/post/${post.id}`);
    }
    onIncrementViews(post.id);
  };

  const handleOpenComments = (post: Post) => {
    setSelectedPost(post);
    setIsCommentsModalOpen(true);
    onIncrementViews(post.id);
  };

  const handleCloseComments = () => {
    setIsCommentsModalOpen(false);
    setSelectedPost(null);
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
        author: post.profiles?.username || "Utilisateur",
        likes: post.votes_up,
        comments: post.comments_count,
        category: "post",
      },
    });
  };

  return (
    <>
      <div 
        ref={parentRef}
        className="h-[calc(100vh-200px)] overflow-auto"
        style={{ contain: 'strict' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const post = posts[virtualItem.index];
            const bookmarked = isBookmarked(post.id, "post");

            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up max-w-full overflow-hidden mx-1 my-2">
                  <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <Avatar 
                          className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 ring-2 ring-[#1f9463]/10 hover:ring-[#1f9463]/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (post.profiles && user?.profile?.username === post.profiles.username) {
                              navigate('/profile');
                            } else if (post.profiles) {
                              navigate(`/user/${post.profiles.username}`);
                            }
                          }}
                        >
                          <AvatarImage src={post.profiles?.profile_picture_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-r from-[#1f9463] to-[#43ca92] text-white font-semibold text-xs sm:text-sm">
                            {post.profiles?.username?.substring(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span 
                              className="font-semibold text-xs sm:text-sm cursor-pointer hover:text-[#1f9463] transition-colors truncate"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (post.profiles && user?.profile?.username === post.profiles.username) {
                                  navigate('/profile');
                                } else if (post.profiles) {
                                  navigate(`/user/${post.profiles.username}`);
                                }
                              }}
                            >
                              @{post.profiles?.username || "Utilisateur"} 
                            </span>
                            {post.profiles?.is_verified && (
                              <BadgeCheck size={20} color="#329056ff" />
                            )}
                          </div>
                          {post.profiles?.full_name && (
                            <p className="text-xs font-medium text-foreground/80 truncate mt-0.5">
                              {post.profiles.full_name}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground truncate">
                            {post.spaces?.name ? `dans ${post.spaces.name}` : "dans Général"} • {formatDate(post.created_at)}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant={bookmarked ? "default" : "outline"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmarkToggle(post);
                        }}
                        className={`text-xs px-3 py-1.5 h-8 font-medium rounded-full transition-colors ${
                          bookmarked
                            ? "bg-[#1f9463] hover:bg-[#43ca92] text-white border-[#1f9463]"
                            : "hover:bg-[#1f9463]/10 hover:text-[#1f9463] border-muted hover:border-[#1f9463]/30"
                        }`}
                      >
                        {bookmarked ? "Sampna" : "DamaySAMP"}
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                    <div 
                      className="text-foreground mb-3 leading-relaxed max-w-full"
                      style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}
                      dangerouslySetInnerHTML={{
                        __html: sanitizeContent(getDisplayContent(post))
                      }}
                    />
                    
                    {shouldShowReadMore(post.content) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(post.id);
                        }}
                        className="text-[#1f9463] text-sm font-medium mb-3 hover:text-[#43ca92] hover:underline transition-colors"
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
                          <span key={index} className="text-xs text-[#1f9463] hover:text-[#43ca92] cursor-pointer transition-colors">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <PostActions 
                      post={post}
                      onVote={onVote}
                      onOpenComments={() => handleOpenComments(post)}
                    />
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
        
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

      <PostCommentsModal
        post={selectedPost}
        isOpen={isCommentsModalOpen}
        onClose={handleCloseComments}
        onVote={onVote}
      />
    </>
  );
}
