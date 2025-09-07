import { useState } from "react";
import { TrendingUp, MessageCircle, ArrowUp, Eye, Crown, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for trending
const mockTrendingData = {
  daily: {
    topPosts: [
      {
        position: 1,
        id: "post_789",
        title: "Les Lions vont affronter le Nigeria demain !",
        author: "AmadouD",
        space: "Lions du Sénégal 🦁",
        interactionScore: 176,
        votesUp: 23,
        comments: 8,
        views: 145,
      },
      {
        position: 2,
        id: "post_892",
        title: "Nouvelle mosquée inaugurée à Touba",
        author: "MoussaK",
        space: "Religion & Société",
        interactionScore: 134,
        votesUp: 19,
        comments: 12,
        views: 103,
      },
      {
        position: 3,
        id: "post_456",
        title: "Recette spéciale thiébou dieune",
        author: "AminaD",
        space: "Cuisine Sénégalaise",
        interactionScore: 98,
        votesUp: 15,
        comments: 6,
        views: 77,
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
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Top Posts
          </TabsTrigger>
          <TabsTrigger value="contributors" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Top Contributeurs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {mockTrendingData.daily.topPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-primary/10 hover:shadow-lg transition-all duration-300 animate-fade-in-up">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Badge 
                      variant={post.position === 1 ? "default" : "secondary"}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        post.position === 1 ? "bg-gradient-primary" : ""
                      }`}
                    >
                      {post.position}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 leading-tight">
                      {post.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>par @{post.author}</span>
                      <span>•</span>
                      <span>{post.space}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {post.interactionScore}
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
                      <span>{post.votesUp}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.views}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="contributors" className="space-y-4">
          {mockTrendingData.daily.topContributors.map((contributor) => (
            <Card key={contributor.username} className="hover:shadow-primary/10 hover:shadow-lg transition-all duration-300 animate-fade-in-up">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <Badge 
                      variant={contributor.position === 1 ? "default" : "secondary"}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        contributor.position === 1 ? "bg-gradient-primary" : ""
                      }`}
                    >
                      {contributor.position}
                    </Badge>
                  </div>
                  
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={contributor.photo} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                      {contributor.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">
                      @{contributor.username}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Score d'activité: {contributor.activityScore}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-sm font-semibold text-primary">
                          {contributor.postsPublished}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Posts
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-primary">
                          {contributor.commentsWritten}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Comm.
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-primary">
                          {contributor.votesGiven}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}