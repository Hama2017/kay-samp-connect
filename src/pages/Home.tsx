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
import { PostCommentsModal } from "@/components/PostCommentsModal";

const categories = ["Tous", "Sport", "Culture", "Cuisine", "Technologie", "Religion"];

const sortFilters = [
  { id: "recent", label: "Plus récents", icon: Clock, short: "Récents" },
  { id: "viral", label: "Plus viraux", icon: TrendingUp, short: "Viraux" },
  { id: "popular", label: "Plus populaires", icon: Flame, short: "Populaires" },
  { id: "discussed", label: "Plus discutés", icon: MessageCircle, short: "Discutés" },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { posts, isLoading, fetchPosts, loadMorePosts, votePost, incrementViews, hasMore } = usePosts();
  const { spaces } = useSpaces();
  const { trackClick, trackLike, trackShare } = useInteractionTracking();
  
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedFilter, setSelectedFilter] = useState("viral");
  const [selectedPost, setSelectedPost] = useState<any>(null);

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

  const handlePostClick = (post: any) => {
    setSelectedPost(post);
  };

  const filteredAndSortedPosts = useMemo(() => {
    let filteredPosts = selectedCategory === "Tous" 
      ? posts 
      : posts.filter(post => 
          post.categories?.includes(selectedCategory) || 
          post.spaces?.categories?.includes(selectedCategory)
        );
    
    return filteredPosts;
  }, [posts, selectedCategory]);

  return (
    <div className="w-full min-h-full">
      {/* 🎯 CONTENEUR MOBILE OPTIMISÉ */}
      <div className="px-3 py-4 sm:px-6 sm:py-6 max-w-screen-sm mx-auto">
        
        {/* 👋 SECTION BIENVENUE - MOBILE COMPACT */}
        <div className="text-center mb-4 animate-fade-in-up">
          <h1 className="text-lg sm:text-2xl font-bold mb-1 bg-gradient-primary bg-clip-text text-transparent leading-tight">
            Bienvenue sur KaaySamp
          </h1>
          <p className="text-sm text-muted-foreground px-2 leading-relaxed">
           L’actualité n’a jamais été aussi proche de toi.
          </p>
        </div>

        {/* 📂 FILTRES CATÉGORIES - BADGES COMPACTS */}
        <div className="mb-3">
          <div className="flex gap-1.5 overflow-x-auto pb-2 mobile-scroll">
            <div className="flex gap-1.5 px-1">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "senegal" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap text-xs h-8 px-2.5 flex-shrink-0 min-w-fit font-medium"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 🔄 FILTRES DE TRI - BADGES COMPACTS */}
        <div className="mb-4">
          <div className="flex gap-1.5 overflow-x-auto pb-2 mobile-scroll">
            <div className="flex gap-1.5 px-1">
              {sortFilters.map((filter) => {
                const Icon = filter.icon;
                return (
                  <Button
                    key={filter.id}
                    variant={selectedFilter === filter.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter.id)}
                    className="whitespace-nowrap gap-1 text-[11px] h-8 px-2 flex-shrink-0 min-w-fit font-medium"
                  >
                    <Icon className="h-3 w-3 flex-shrink-0" />
                    {/* Texte responsive */}
                    <span className="hidden sm:inline">{filter.label}</span>
                    <span className="sm:hidden">{filter.short}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 📱 FEED POSTS - MOBILE OPTIMISÉ */}
        <div className="mobile-scroll">
          {isLoading && posts.length === 0 ? (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" text="Chargement des posts..." />
            </div>
          ) : filteredAndSortedPosts.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-primary/50" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Aucun post trouvé</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Soyez le premier à publier dans cette catégorie !
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <InfinitePostsList
                posts={filteredAndSortedPosts}
                onLoadMore={loadMorePosts}
                onVote={handleVote}
                onIncrementViews={incrementViews}
                onPostClick={handlePostClick}
                hasMore={hasMore}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      </div>

      {/* 💬 MODAL COMMENTAIRES - MOBILE FRIENDLY */}
      <PostCommentsModal
        onVote={handleVote}
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
}