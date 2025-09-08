import { useState, useEffect } from "react";
import { MessageCircle, Heart, ChevronUp, ChevronDown, Eye, Settings, Calendar, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import { useSpaces } from "@/hooks/useSpaces";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const { posts, isLoading: postsLoading, fetchPosts } = usePosts();
  const { spaces, isLoading: spacesLoading, fetchSpaces } = useSpaces();

  useEffect(() => {
    if (user?.id) {
      fetchPosts({ author_id: user.id });
      fetchSpaces({ user_spaces: true });
    }
  }, [user?.id, fetchPosts, fetchSpaces]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-muted-foreground">Utilisateur non trouvé</p>
      </div>
    );
  }

  if (postsLoading || spacesLoading) {
    return <LoadingSpinner size="lg" text="Chargement du profil..." />;
  }

  const userPosts = posts.filter(post => post.author_id === user.id);
  const userSpaces = spaces.filter(space => space.creator_id === user.id);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Cover Image */}
      <div 
        className="h-48 bg-gradient-hero rounded-t-xl bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=300&fit=crop)' }}
      />
      
      {/* Profile Header */}
      <Card className="rounded-t-none border-t-0">
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex items-end gap-4 -mt-12">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={user.profile?.profile_picture_url} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                  {user.profile?.username?.substring(0, 2).toUpperCase() || "U"}
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
                <h1 className="text-2xl font-bold">@{user.profile?.username || "Utilisateur"}</h1>
                {user.profile?.is_verified && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    ✓ Certifié
                  </Badge>
                )}
              </div>
              
              {user.profile?.bio && (
                <p className="text-muted-foreground mb-3">{user.profile.bio}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs text-muted-foreground">
                    Rejoint le {new Date(user.profile?.created_at || new Date()).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-xl font-bold">{user.profile?.followers_count || 0}</p>
                <p className="text-sm text-muted-foreground">Abonnés</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{user.profile?.following_count || 0}</p>
                <p className="text-sm text-muted-foreground">Abonnements</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{userPosts.length}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{userSpaces.length}</p>
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
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6">
                    <p className="text-foreground mb-3 leading-relaxed">
                      {post.content}
                    </p>
                    
                    {post.hashtags && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.hashtags.map((tag) => (
                          <span key={tag} className="text-xs text-primary hover:text-primary/80 cursor-pointer">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <ChevronUp className="h-4 w-4" />
                          <span>{post.votes_up}</span>
                          <ChevronDown className="h-4 w-4 ml-1" />
                          <span>{post.votes_down}</span>
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
                      <div className="text-xs">
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun post encore</h3>
                <p className="text-muted-foreground">
                  Vous n'avez pas encore publié de posts
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* Spaces Tab */}
          <TabsContent value="spaces" className="space-y-4 mt-6">
            {userSpaces.length > 0 ? (
              userSpaces.map((space) => (
                <Card key={space.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer" 
                      onClick={() => navigate(`/space/${space.id}`)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{space.name}</h3>
                        <p className="text-muted-foreground text-sm mb-3">{space.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{space.subscribers_count} membres</span>
                          <Badge variant="outline">{space.category}</Badge>
                          {space.is_public && <Badge variant="secondary">Public</Badge>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun espace créé</h3>
                <p className="text-muted-foreground">
                  Vous n'avez pas encore créé d'espaces
                </p>
              </div>
            )}
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