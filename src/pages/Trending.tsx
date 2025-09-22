import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, MessageCircle, ArrowUp, Eye, Crown, Trophy, Hash, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePosts } from "@/hooks/usePosts";
import { useSpaces } from "@/hooks/useSpaces";
import { useTopContributors } from "@/hooks/useTopContributors";
import { LoadingSpinner } from "@/components/LoadingSpinner";

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
  const { posts, fetchPosts, isLoading: postsLoading } = usePosts();
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
              className="hover:shadow-primary/10 hover:shadow-lg transition-all duration-300 animate-fade-in-up cursor-pointer"
              onClick={() => navigate(`/post/${post.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
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
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground mb-2 leading-relaxed">
                      {post.content}
                    </p>
                    
                    {post.hashtags && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {post.hashtags.map((tag) => (
                          <span key={tag} className="text-sm text-primary">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>par @{post.profiles?.username || "Utilisateur"}</span>
                      <span>•</span>
                      <span>{post.spaces?.name || "Espace"}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {post.votes_up + post.views_count}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      interactions
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <ArrowUp className="h-4 w-4" />
                      <span>{post.votes_up}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.views_count}</span>
                    </div>
                  </div>
                </div>
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
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">
                        {space.name}
                      </h3>
                      {space.is_verified && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {space.category}
                      </Badge>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{space.subscribers_count}</span>
                      </div>
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