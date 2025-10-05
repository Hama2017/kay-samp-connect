import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Hash, Plus, MessageCircle, ChevronUp, ChevronDown, Eye, TrendingUp, Clock, Flame, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSpaces } from "@/hooks/useSpaces";
import { usePosts } from "@/hooks/usePosts";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PostActions } from "@/components/PostActions";
import { PostModal } from "@/components/PostModal";
import { SpaceBadge } from '@/components/SpaceBadge';
import { canUserPostInSpace } from '@/utils/spacePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const sortFilters = [
  { id: "recent", label: "Plus récents", icon: Clock },
  { id: "viral", label: "Plus viraux", icon: TrendingUp },
  { id: "popular", label: "Plus populaires", icon: Flame },
  { id: "discussed", label: "Plus discutés", icon: MessageCircle },
];

export default function SpaceDetail() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState("recent");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Toutes");
  const [hasAcceptedInvitation, setHasAcceptedInvitation] = useState(false);
  const { spaces, fetchSpaces, subscribeToSpace, unsubscribeFromSpace, isLoading: spacesLoading } = useSpaces();
  const { posts, fetchPosts, votePost, isLoading: postsLoading } = usePosts();

  // All useMemo hooks MUST be before any conditional returns
  const space = spaces.find(s => s.id === spaceId);
  const spacePosts = useMemo(() => {
    console.log('spacePosts useMemo called', { 
      postsLength: posts.length, 
      spaceId, 
      selectedCategory,
      posts: posts.map(p => ({ id: p.id, categories: p.categories, space_id: p.space_id }))
    });
    
    let filteredPosts = posts.filter(post => post.space_id === spaceId);
    console.log('Posts in space:', filteredPosts.map(p => ({ id: p.id, categories: p.categories })));
    
    // Filter by category if a specific category is selected
    if (selectedCategory !== "Toutes") {
      const beforeFilter = filteredPosts.length;
      filteredPosts = filteredPosts.filter(post => {
        const postCategories = post.categories || [];
        const hasCategory = postCategories.includes(selectedCategory);
        console.log(`Post ${post.id} has category ${selectedCategory}:`, hasCategory, 'Post categories:', post.categories);
        return hasCategory;
      });
      console.log(`Category filter: ${beforeFilter} -> ${filteredPosts.length} posts`);
    }
    
    return filteredPosts;
  }, [posts, spaceId, selectedCategory]);

  const sortedPosts = useMemo(() => {
    console.log('sortedPosts useMemo called', { spacePostsLength: spacePosts.length, selectedFilter });
    const posts = [...spacePosts];
    
    switch (selectedFilter) {
      case "recent":
        return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case "viral":
        return posts.sort((a, b) => (b.votes_up + b.views_count) - (a.votes_up + a.views_count));
      case "popular":
        return posts.sort((a, b) => b.votes_up - a.votes_up);
      case "discussed":
        return posts.sort((a, b) => b.comments_count - a.comments_count);
      default:
        return posts;
    }
  }, [spacePosts, selectedFilter]);

  // All functions that depend on state/props should be defined with useCallback
  const handleSubscriptionToggle = useCallback(async () => {
    if (!space) return;
    try {
      if (space.is_subscribed) {
        await unsubscribeFromSpace(space.id);
      } else {
        await subscribeToSpace(space.id);
      }
      fetchSpaces(); // Refresh to update subscription status
    } catch (error) {
      console.error('Error toggling subscription:', error);
    }
  }, [space, unsubscribeFromSpace, subscribeToSpace, fetchSpaces]);

  const formatDate = useCallback((dateString: string) => {
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
  }, []);

  const handleVote = useCallback(async (postId: string, voteType: 'up' | 'down') => {
    await votePost(postId, voteType);
  }, [votePost]);

  const handlePostClick = useCallback((postId: string) => {
    setSelectedPostId(postId);
  }, []);

  console.log('SpaceDetail render', { 
    spacesLength: spaces.length, 
    postsLength: posts.length, 
    spacePostsLength: spacePosts.length,
    selectedFilter,
    spaceId
  });

  // Check if user has accepted invitation for this space
  useEffect(() => {
    const checkInvitation = async () => {
      if (!user?.id || !spaceId) return;
      
      const { data, error } = await supabase
        .from('space_invitations')
        .select('status')
        .eq('space_id', spaceId)
        .eq('invited_user_id', user.id)
        .eq('status', 'accepted')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking invitation:', error);
        setHasAcceptedInvitation(false);
        return;
      }
      
      setHasAcceptedInvitation(!!data);
    };
    
    checkInvitation();
  }, [user?.id, spaceId]);

  useEffect(() => {
    if (spaceId) {
      fetchSpaces();
      fetchPosts({ space_id: spaceId });
    }
  }, [spaceId]); // eslint-disable-line react-hooks/exhaustive-deps

  // NOW we can have conditional returns after all hooks
  if (spacesLoading || postsLoading) {
    return <LoadingSpinner size="lg" text="Chargement de l'espace..." />;
  }

  if (!space) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl text-center">
        <h1 className="text-2xl font-bold mb-4">Espace introuvable</h1>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Espace</h1>
      </div>

      {/* Space header */}
      <Card className="mb-6">
        {space.background_image_url && (
          <div className="h-48 bg-gradient-primary rounded-t-lg relative overflow-hidden">
            <img 
              src={space.background_image_url} 
              alt="Background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        )}
        {space.cover_image_url && (
          <div className="h-32 bg-gradient-primary rounded-t-lg relative overflow-hidden">
            <img 
              src={space.cover_image_url} 
              alt="Cover" 
              className="w-full h-full object-cover opacity-50"
            />
          </div>
        )}
        
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Hash className="h-8 w-8 text-primary-foreground" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{space.name}</h2>
                {space.is_verified && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    ✓ Certifié
                  </Badge>
                )}
                {space.badge && (
                  <SpaceBadge badge={space.badge} />
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex flex-wrap gap-2">
              {space.categories.map((category) => (
                <Badge key={category} variant="outline">{category}</Badge>
              ))}
            </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{space.subscribers_count} membres</span>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                {space.description}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {user && space.creator_id !== user.id && (
              <Button
                variant={space.is_subscribed ? "outline" : "default"}
                className="flex-1"
                onClick={handleSubscriptionToggle}
              >
                {space.is_subscribed ? "Abonné" : "S'abonner"}
              </Button>
            )}
            
            {(() => {
              const { canPost, message } = canUserPostInSpace(
                space, 
                user?.id, 
                false, 
                hasAcceptedInvitation
              );
              
              return (
                <div className="flex gap-2">
                  {user && space.creator_id === user.id && (
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/space/${spaceId}/admin`)}
                      className="gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Administrer
                    </Button>
                  )}
                  {canPost && (
                    <Button 
                      variant="default" 
                      onClick={() => navigate(`/create/${spaceId}`)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Créer un post
                    </Button>
                  )}
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Rules section */}
      {space.rules && space.rules.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <h3 className="font-semibold">Règles de l'espace</h3>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {space.rules.map((rule, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary font-semibold">{index + 1}.</span>
                  <span className="text-muted-foreground">{rule}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Posts section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Publications</h3>
        </div>
        
        {/* Category filters - only show if space has more than one category */}
        {space.categories && space.categories.length > 1 && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={selectedCategory === "Toutes" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("Toutes")}
                className="whitespace-nowrap"
              >
                Toutes
              </Button>
              {space.categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Sort filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {sortFilters.map((filter) => {
            const Icon = filter.icon;
            return (
              <Button
                key={filter.id}
                variant={selectedFilter === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(filter.id)}
                className="whitespace-nowrap gap-2"
              >
                <Icon className="h-3 w-3" />
                {filter.label}
              </Button>
            );
          })}
        </div>
        
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post) => (
            <Card 
              key={post.id} 
              className="hover:shadow-primary/10 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handlePostClick(post.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.profiles?.profile_picture_url} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                      {post.profiles?.username?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">@{post.profiles?.username || "Utilisateur"}</span>
                      {post.profiles?.is_verified && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          ✓
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-foreground leading-relaxed mb-3">
                      {post.content}
                    </p>

                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.hashtags.map((tag) => (
                          <span key={tag} className="text-sm text-primary">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div onClick={(e) => e.stopPropagation()}>
                      <PostActions 
                        post={post}
                        onVote={handleVote}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun post dans cet espace</h3>
            <p className="text-muted-foreground">
              Soyez le premier à publier dans cet espace !
            </p>
          </div>
        )}
      </div>

      {/* Modal de post */}
      <PostModal
        postId={selectedPostId}
        isOpen={!!selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </div>
  );
}