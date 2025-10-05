import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, MessageCircle, ArrowUp, Eye, Crown, Trophy, Hash, Users, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePosts } from "@/hooks/usePosts";
import { useSpaces } from "@/hooks/useSpaces";
import { useTopContributors } from "@/hooks/useTopContributors";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PostActions } from "@/components/PostActions";
import PostMediaDisplay from "@/components/PostMediaDisplay";
import { useAuth } from "@/contexts/AuthContext";

// Mock data for trending
const mockTrendingData = {
  daily: {
    topPosts: [
      {
        position: 1,
        id: "post_789",
        author: "AmadouD",
        space: "Lions du Sénégal 🦁",
        content: "On va affronter le Nigeria demain ! J'espère qu'on va avoir une bonne formation avec Mané en pointe.",
        interactionScore: 176,
        votesUp: 23,
        comments: 8,
        views: 145,
        hashtags: ["#CAN2024", "#LionsDuSenegal"]
      },
      {
        position: 2,
        id: "post_892",
        author: "MoussaK",
        space: "Religion & Société",
        content: "Nouvelle mosquée inaugurée à Touba, c'est vraiment magnifique l'architecture !",
        interactionScore: 134,
        votesUp: 19,
        comments: 12,
        views: 103,
        hashtags: ["#Touba", "#Mosquee"]
      },
      {
        position: 3,
        id: "post_456",
        author: "AminaD",
        space: "Cuisine Sénégalaise",
        content: "Ma recette spéciale thiébou dieune avec des légumes frais du marché. Qui veut la recette ?",
        interactionScore: 98,
        votesUp: 15,
        comments: 6,
        views: 77,
        hashtags: ["#ThiebouDieune", "#CuisineSenegalaise"]
      },
    ],
    topSpaces: [
      {
        position: 1,
        id: "space_001",
        name: "Lions du Sénégal 🦁",
        category: "Sport",
        subscribersCount: 1247,
        postsToday: 23,
        activeMembers: 89,
        isVerified: true,
      },
      {
        position: 2,
        id: "space_002",
        name: "Cuisine Sénégalaise",
        category: "Cuisine", 
        subscribersCount: 634,
        postsToday: 15,
        activeMembers: 67,
        isVerified: true,
      },
      {
        position: 3,
        id: "space_003",
        name: "Tech Dakar",
        category: "Technologie",
        subscribersCount: 453,
        postsToday: 12,
        activeMembers: 45,
        isVerified: false,
      },
    ],
    topContributors: [
      {
        position: 1,
        username: "AmadouD",
        photo: "",
        activityScore: 45,
        postsPublished: 3,
        commentsWritten: 12,
        votesGiven: 30,
      },
      {
        position: 2,
        username: "AissatouN",
        photo: "",
        activityScore: 38,
        postsPublished: 2,
        commentsWritten: 15,
        votesGiven: 21,
      },
      {
        position: 3,
        username: "MoussaK",
        photo: "",
        activityScore: 32,
        postsPublished: 1,
        commentsWritten: 18,
        votesGiven: 13,
      },
    ],
  },
};

const timePeriods = [
  { value: "day", label: "Jour" },
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
];

export default function Trending() {
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { posts, fetchPosts, isLoading: postsLoading, votePost } = usePosts();
  const { spaces, fetchSpaces, isLoading: spacesLoading } = useSpaces();
  const { contributors, fetchTopContributors, isLoading: contributorsLoading } = useTopContributors();

  useEffect(() => {
    fetchPosts({ sort_by: "popular" });
    fetchSpaces({ sort_by: "popular" });
    fetchTopContributors(selectedPeriod as any);
  }, [selectedPeriod]);

  if (postsLoading || spacesLoading || contributorsLoading) {
    return <LoadingSpinner size="lg" text="Chargement des tendances..." />;
  }

  // Get top posts, spaces
  const topPosts = posts.slice(0, 5);
  const topSpaces = spaces.slice(0, 5);

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
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="text-center mb-6 animate-fade-in-up">
        <div className="flex items-center justify-center gap-2 mb-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Tendances
          </h1>
        </div>
        <p className="text-muted-foreground">
          Découvre ce qui fait vibrer la communauté
        </p>
      </div>

      {/* Time period selector */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {timePeriods.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? "senegal" : "ghost"}
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
              className="px-6"
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Top Posts
          </TabsTrigger>
          <TabsTrigger value="spaces" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Top Espaces
          </TabsTrigger>
          <TabsTrigger value="contributors" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Top Contributeurs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {topPosts.map((post, index) => (
            <Card 
              key={post.id} 
              className="hover:shadow-lg transition-all duration-300 animate-fade-in-up relative"
            >
              {/* Badge position */}
              <div className="absolute top-4 right-4 z-10">
                <Badge 
                  variant={index === 0 ? "default" : "secondary"}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    index === 0 ? "bg-gradient-primary shadow-lg" : ""
                  }`}
                >
                  {index + 1}
                </Badge>
              </div>

              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <Avatar 
                      className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 ring-2 ring-[#1f9463]/10 hover:ring-[#1f9463]/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (user?.profile?.username === post.profiles?.username) {
                          navigate('/profile');
                        } else {
                          navigate(`/user/${post.profiles?.username}`);
                        }
                      }}
                    >
                      <AvatarImage src={post.profiles?.profile_picture_url} />
                      <AvatarFallback className="bg-gradient-to-r from-[#1f9463] to-[#43ca92] text-white font-semibold text-xs sm:text-sm">
                        {post.profiles?.username?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span 
                          className="font-semibold text-xs sm:text-sm cursor-pointer hover:text-[#1f9463] transition-colors truncate"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (user?.profile?.username === post.profiles?.username) {
                              navigate('/profile');
                            } else {
                              navigate(`/user/${post.profiles?.username}`);
                            }
                          }}
                        >
                          @{post.profiles?.username || "Utilisateur"}
                        </span>
                        {post.profiles?.is_verified && (
                          <BadgeCheck size={20} color="#329056ff" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {post.spaces?.name ? `dans ${post.spaces.name}` : "dans Général"} • {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent 
                className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6 cursor-pointer"
                onClick={() => navigate(`/post/${post.id}`)}
              >
                {/* Titre si présent */}
                {post.title && (
                  <div className="text-lg font-bold text-foreground break-words mb-3">
                    {post.title}
                  </div>
                )}
                
                {/* Contenu */}
                <div 
                  className="text-foreground mb-3 leading-relaxed break-all max-w-full overflow-wrap-anywhere"
                  dangerouslySetInnerHTML={{
                    __html: post.content.replace(/#(\w+)/g, '<span style="color: #1f9463; font-weight: 600;">#$1</span>')
                  }}
                />
                
                {/* Médias */}
                {post.post_media && post.post_media.length > 0 && (
                  <PostMediaDisplay 
                    media={post.post_media} 
                    maxHeight="max-h-[60vh]"
                  />
                )}
                
                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.hashtags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="text-xs text-[#1f9463] hover:text-[#43ca92] cursor-pointer transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Actions */}
                <PostActions 
                  post={post}
                  onVote={votePost}
                  onOpenComments={() => navigate(`/post/${post.id}`)}
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="spaces" className="space-y-4">
          {topSpaces.map((space, index) => (
            <Card 
              key={space.id} 
              className="hover:shadow-primary/10 hover:shadow-lg transition-all duration-300 animate-fade-in-up cursor-pointer"
              onClick={() => navigate(`/space/${space.id}`)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <Badge 
                      variant={index === 0 ? "default" : "secondary"}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? "bg-gradient-primary" : ""
                      }`}
                    >
                      {index + 1}
                    </Badge>
                  </div>
                  
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Hash className="h-6 w-6 text-primary-foreground" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {space.name}
                      </h3>
                      {space.is_verified && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          ✓
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{space.subscribers_count}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 text-sm text-muted-foreground">
                      {space.categories.map((category) => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <div className="text-sm font-semibold text-primary">
                          {space.posts_count}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Posts
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-primary">
                          {space.subscribers_count}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Actifs
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="contributors" className="space-y-4">
          {contributors.map((contributor, index) => (
            <Card 
              key={contributor.user_id} 
              className="hover:shadow-primary/10 hover:shadow-lg transition-all duration-300 animate-fade-in-up cursor-pointer"
              onClick={() => navigate(`/user/${contributor.username}`)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <Badge 
                      variant={index === 0 ? "default" : "secondary"}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? "bg-gradient-primary" : ""
                      }`}
                    >
                      {index + 1}
                    </Badge>
                  </div>
                  
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={contributor.profile_picture_url} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                      {contributor.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-foreground">
                        @{contributor.username}
                      </div>
                      {contributor.is_verified && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Score d'activité: {contributor.activity_score}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-sm font-semibold text-primary">
                          {contributor.posts_count}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Posts
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-primary">
                          {contributor.comments_count}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Comm.
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-primary">
                          {contributor.votes_given}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Votes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {contributors.length === 0 && (
            <div className="text-center py-12">
              <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Aucun contributeur trouvé</h3>
              <p className="text-muted-foreground">
                Soyez le premier à contribuer !
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}