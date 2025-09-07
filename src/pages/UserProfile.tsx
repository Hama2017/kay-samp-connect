import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, UserCheck, MoreHorizontal, MessageCircle, ArrowUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Mock user data
const mockUserData = {
  fullName: "Aissatou Ndiaye",
  username: "AissatouN",
  bio: "Passionnée de cuisine sénégalaise et de culture wolof. Partage mes recettes traditionnelles avec amour 🍽️",
  profilePicture: "",
  isVerified: true,
  points: 2456,
  registrationDate: "2023-08-12T10:30:00Z",
  followers: 1247,
  following: 89,
  posts: [
    {
      id: "1",
      content: "Ma nouvelle recette de thiébou dieune aux légumes frais du marché de Sandaga ! Qui veut essayer ?",
      publishedDate: "2024-03-15T10:30:00Z",
      votesUp: 45,
      votesDown: 2,
      comments: 12,
      views: 234,
      hashtags: ["#ThiebouDieune", "#CuisineSenegalaise", "#Sandaga"],
      space: "Cuisine Sénégalaise"
    },
    {
      id: "2", 
      content: "Les couleurs du coucher de soleil sur la corniche de Dakar sont vraiment magnifiques aujourd'hui 🌅",
      publishedDate: "2024-03-14T18:45:00Z",
      votesUp: 67,
      votesDown: 1,
      comments: 8,
      views: 189,
      hashtags: ["#Dakar", "#Corniche", "#Sunset"],
      space: "Sénégal Photos"
    }
  ]
};

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  
  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Désabonné" : "Abonné",
      description: isFollowing 
        ? `Vous ne suivez plus @${mockUserData.username}` 
        : `Vous suivez maintenant @${mockUserData.username}`,
    });
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Back button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate(-1)}
        className="mb-4 hover:bg-primary/5"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      {/* Profile Header */}
      <Card className="mb-6 animate-fade-in-up">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={mockUserData.profilePicture} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold text-xl">
                {mockUserData.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-foreground">
                  @{mockUserData.username}
                </h1>
                {mockUserData.isVerified && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    ✓ Certifié
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-3">{mockUserData.fullName}</p>
              
              <div className="flex items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-foreground">{mockUserData.followers}</span>
                  <span className="text-muted-foreground">abonnés</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-foreground">{mockUserData.following}</span>
                  <span className="text-muted-foreground">abonnements</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-primary">{mockUserData.points}</span>
                  <span className="text-muted-foreground">points</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={isFollowing ? "outline" : "senegal"}
                  size="sm"
                  onClick={handleFollow}
                  className="flex-1"
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Abonné
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      S'abonner
                    </>
                  )}
                </Button>
                
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {mockUserData.bio && (
            <p className="text-foreground text-sm leading-relaxed bg-muted/50 p-3 rounded-lg">
              {mockUserData.bio}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Posts */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-1 mb-6">
          <TabsTrigger value="posts">
            Posts ({mockUserData.posts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {mockUserData.posts.map((post) => (
            <Card key={post.id} className="hover:shadow-primary/10 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={mockUserData.profilePicture} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                      {mockUserData.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">@{mockUserData.username}</span>
                      {mockUserData.isVerified && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          ✓
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        dans {post.space}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(post.publishedDate)}
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
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-green-600">
                      <ArrowUp className="h-4 w-4" />
                      {post.votesUp}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      {post.comments}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      {post.views}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {mockUserData.posts.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Aucun post encore</h3>
              <p className="text-muted-foreground">
                @{mockUserData.username} n'a pas encore publié de posts
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}