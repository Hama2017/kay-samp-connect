import { useState } from "react";
import { MessageCircle, Heart, ChevronUp, ChevronDown, Eye, Settings, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-muted-foreground">Utilisateur non trouvé</p>
      </div>
    );
  }

  // Mock user data combined with auth data
  const userData = {
    ...user,
    coverImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=300&fit=crop",
    postsCount: 24,
    spacesCount: 3,
  };

  // Mock posts data
  const userPosts = [
    {
      id: "1",
      content: "Les Lions vont affronter le Nigeria demain ! Qui pensez-vous sera dans le onze de départ ? 🇸🇳⚽",
      space: { name: "Lions du Sénégal 🦁" },
      votesUp: 23,
      votesDown: 2,
      commentsCount: 8,
      viewsCount: 145,
      hashtags: ["#Lions", "#Nigeria", "#CAN2024"],
      publicationDate: "2024-03-15T08:30:00Z",
    },
    {
      id: "2", 
      content: "Le nouveau hub technologique à Diamniadio va changer la donne pour l'innovation au Sénégal 🚀",
      space: { name: "Tech Dakar" },
      votesUp: 31,
      votesDown: 3,
      commentsCount: 6,
      viewsCount: 187,
      hashtags: ["#TechDakar", "#Innovation", "#Diamniadio"],
      publicationDate: "2024-03-15T12:45:00Z",
    },
  ];

  const userSpaces = [
    {
      id: "1",
      name: "Lions du Sénégal 🦁",
      description: "Discussions sur l'équipe nationale de football",
      memberCount: 1250,
      category: "Sport",
      isPrivate: false,
    },
    {
      id: "2",
      name: "Tech Dakar",
      description: "Communauté tech de Dakar",
      memberCount: 856,
      category: "Technologie", 
      isPrivate: false,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Cover Image */}
      <div 
        className="h-48 bg-gradient-hero rounded-t-xl bg-cover bg-center"
        style={{ backgroundImage: `url(${userData.coverImage})` }}
      />
      
      {/* Profile Header */}
      <Card className="rounded-t-none border-t-0">
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex items-end gap-4 -mt-12">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={userData.profilePicture} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                  {userData.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => navigate("/settings")}
              >
                <Settings className="h-4 w-4" />
                Modifier le profil
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* User Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">@{userData.username}</h1>
                {userData.isVerified && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    ✓ Certifié
                  </Badge>
                )}
              </div>
              
              {userData.bio && (
                <p className="text-muted-foreground mb-3">{userData.bio}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs text-muted-foreground">
                    Rejoint le {new Date(userData.joinDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-xl font-bold">{userData.followersCount}</p>
                <p className="text-sm text-muted-foreground">Abonnés</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{userData.followingCount}</p>
                <p className="text-sm text-muted-foreground">Abonnements</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{userData.postsCount}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{userData.spacesCount}</p>
                <p className="text-sm text-muted-foreground">Espaces</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Tabs */}
      <div className="mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="spaces">Espaces</TabsTrigger>
            <TabsTrigger value="likes">Aimés</TabsTrigger>
          </TabsList>
          
          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4 mt-6">
            {userPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6">
                  <p className="text-foreground mb-3 leading-relaxed">
                    {post.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.hashtags.map((tag) => (
                      <span key={tag} className="text-xs text-primary hover:text-primary/80 cursor-pointer">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <ChevronUp className="h-4 w-4" />
                        <span>{post.votesUp}</span>
                        <ChevronDown className="h-4 w-4 ml-1" />
                        <span>{post.votesDown}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.commentsCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.viewsCount}</span>
                      </div>
                    </div>
                    <div className="text-xs">
                      dans {post.space.name}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          {/* Spaces Tab */}
          <TabsContent value="spaces" className="space-y-4 mt-6">
            {userSpaces.map((space) => (
              <Card key={space.id} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{space.name}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{space.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{space.memberCount} membres</span>
                        <Badge variant="outline">{space.category}</Badge>
                        {!space.isPrivate && <Badge variant="secondary">Public</Badge>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          {/* Likes Tab */}
          <TabsContent value="likes" className="mt-6">
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun post aimé</h3>
              <p className="text-muted-foreground">
                Les posts que vous aimez apparaîtront ici
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}