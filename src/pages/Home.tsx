import { useState, useMemo, useEffect } from "react";
import { MessageCircle, TrendingUp, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import { useSpaces } from "@/hooks/useSpaces";
import { usePageTracking, useInteractionTracking } from "@/hooks/usePageTracking";
import { useAuth } from "@/contexts/AuthContext";
import { InfinitePostsList } from "@/components/InfinitePostsList";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PostModal } from "@/components/PostModal";

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
  const { posts, isLoading, fetchPosts, loadMorePosts, votePost, incrementViews, hasMore } = usePosts();
  const { spaces } = useSpaces();
  const { trackClick, trackLike, trackShare } = useInteractionTracking();
  
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedFilter, setSelectedFilter] = useState("viral");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts({ sort_by: selectedFilter as any });
  }, [selectedFilter]);

  // Track page view
  usePageTracking();

  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    await votePost(postId, voteType);
    trackLike(postId, { voteType });
  };

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
  };

  const filteredAndSortedPosts = useMemo(() => {
    let filteredPosts = selectedCategory === "Tous" 
      ? posts 
      : posts.filter(post => post.spaces?.name === selectedCategory);
    
    return filteredPosts;
  }, [posts, selectedCategory]);

  return (
    <div className="min-h-screen w-full mx-auto px-4 py-2 sm:py-6 max-w-full overflow-hidden">
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
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 mb-3 sm:mb-4 scrollbar-hide">
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
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 mb-4 sm:mb-6 scrollbar-hide">
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
              <span className="xs:hidden">{filter.label.split(" ")[1] || filter.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Posts feed */}
      {isLoading && posts.length === 0 ? (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" text="Chargement des posts..." />
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
        <InfinitePostsList
          posts={filteredAndSortedPosts}
          onLoadMore={loadMorePosts}
          onVote={handleVote}
          onIncrementViews={incrementViews}
          onPostClick={handlePostClick}
          hasMore={hasMore}
          isLoading={isLoading}
        />
      )}

      {/* Modal de post */}
      <PostModal
        postId={selectedPostId}
        isOpen={!!selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </div>
  );
}