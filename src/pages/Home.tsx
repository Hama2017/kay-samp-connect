import { useState, useMemo, useEffect } from "react";
import { MessageCircle, TrendingUp, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PostCommentsModal } from "@/components/PostCommentsModal";
import PostMediaDisplay from "@/components/PostMediaDisplay";
import { useNavigate } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import { useSpaces } from "@/hooks/useSpaces";
import { usePageTracking, useInteractionTracking } from "@/hooks/usePageTracking";
import { useAuth } from "@/contexts/AuthContext";
import { PostActions } from "@/components/PostActions";

const categories = ["Tous", "Sport", "Culture", "Cuisine", "Technologie", "Religion"];

const sortFilters = [
  { id: "recent", label: "Plus récents", icon: Clock },
  { id: "viral", label: "Plus viraux", icon: TrendingUp },
  { id: "popular", label: "Plus populaires", icon: Flame },
  { id: "discussed", label: "Plus discutés", icon: MessageCircle },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { posts, isLoading, fetchPosts, votePost, incrementViews } = usePosts();
  const { spaces } = useSpaces();
  const { trackClick, trackLike, trackShare } = useInteractionTracking();
  
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedFilter, setSelectedFilter] = useState("recent");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts({ sort_by: selectedFilter as any });
  }, [fetchPosts, selectedFilter]);

  // Track page view
  usePageTracking();

  const handlePostClick = (post: any) => {
    setSelectedPost(post);
    setIsCommentsOpen(true);
    incrementViews(post.id);
    trackClick('post_view', { postId: post.id });
  };

  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    await votePost(postId, voteType);
    trackLike(postId, { voteType });
  };

  const handleCloseComments = () => {
    setIsCommentsOpen(false);
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
  
  const getDisplayContent = (post: any) => {
    if (!shouldShowReadMore(post.content) || isPostExpanded(post.id)) {
      return post.content;
    }
    return post.content.substring(0, 200) + "...";
  };

  const filteredAndSortedPosts = useMemo(() => {
    let filteredPosts = selectedCategory === "Tous" 
      ? posts 
      : posts.filter(post => post.spaces?.name === selectedCategory);
    
    // Posts are already sorted by the backend based on selectedFilter
    return filteredPosts;
  }, [posts, selectedCategory]);

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Welcome section */}
      <div className="text-center mb-4 sm:mb-6 animate-fade-in-up">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          Bienvenue sur KaaySamp
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground px-2">
          Viens t'asseoir et découvre ta communauté sénégalaise
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 mb-3 sm:mb-4 scrollbar-hide -mx-1 px-1">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "senegal" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap text-xs sm:text-sm flex-shrink-0"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Sort filters */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 mb-4 sm:mb-6 scrollbar-hide -mx-1 px-1">
        {sortFilters.map((filter) => {
          const Icon = filter.icon;
          return (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.id)}
              className="whitespace-nowrap gap-1.5 sm:gap-2 text-xs sm:text-sm flex-shrink-0"
            >
              <Icon className="h-3 w-3" />
              <span className="hidden xs:inline">{filter.label}</span>
              <span className="xs:hidden">{filter.label.split(' ')[1] || filter.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Posts feed */}
      <div className="space-y-3 sm:space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des posts...</p>
          </div>
        ) : filteredAndSortedPosts.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Aucun post trouvé</h3>
            <p className="text-muted-foreground">
              Soyez le premier à publier dans cette catégorie !
            </p>
          </div>
        ) : (
          filteredAndSortedPosts.map((post) => (
          <Card 
            key={post.id} 
            className="hover:shadow-primary/10 hover:shadow-lg transition-all duration-300 animate-fade-in-up cursor-pointer"
            onClick={() => handlePostClick(post)}
          >
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                   <Avatar 
                     className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                     onClick={(e) => {
                       e.stopPropagation();
                       // Redirect to own profile if it's the current user
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
                            // Redirect to own profile if it's the current user
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
                       {post.spaces?.name ? `dans ${post.spaces.name}` : "dans Général"}
                     </p>
                   </div>
                 </div>
                 
                 <Badge variant="outline" className="text-xs flex-shrink-0 hidden sm:block">
                   {post.spaces?.name || "Général"}
                 </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
              <div 
                className="text-foreground mb-3 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: getDisplayContent(post).replace(/#(\w+)/g, '<span style="color: hsl(var(--primary)); font-weight: 600;">#$1</span>')
                }}
              />
              
              {/* Bouton lire la suite */}
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
              
               {/* Médias si présents */}
               <PostMediaDisplay 
                 media={post.post_media || []} 
                 showControls={false}
               />
               
               {/* Hashtags */}
               {post.hashtags && post.hashtags.length > 0 && (
                 <div className="flex flex-wrap gap-1 mb-4">
                   {post.hashtags.map((tag, index) => (
                     <span key={index} className="text-xs text-primary hover:text-primary/80 cursor-pointer">
                       {tag}
                     </span>
                   ))}
                 </div>
               )}
               
               {/* Actions avec Up/Down */}
               <PostActions 
                 post={post}
                 onVote={handleVote}
                 onOpenComments={() => handlePostClick(post)}
               />
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {/* Comments Modal */}
      <PostCommentsModal 
        post={selectedPost}
        isOpen={isCommentsOpen}
        onClose={handleCloseComments}
      />
    </div>
  );
}