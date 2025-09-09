import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, UserCheck, MoreHorizontal, MessageCircle, ArrowUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePosts } from "@/hooks/usePosts";
import { useUserFollow } from "@/hooks/useUserFollow";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { posts, fetchPosts, isLoading: postsLoading } = usePosts();
  
  // Hook de suivi - sera initialisé une fois qu'on a l'ID utilisateur
  const { 
    isFollowing, 
    followersCount, 
    followingCount, 
    isLoading: followLoading, 
    toggleFollow,
    updateCounts,
    canFollow 
  } = useUserFollow(userProfile?.id || '');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) return;
      
      setIsLoading(true);
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();
          
        if (error) throw error;
        
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil utilisateur",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchUserProfile();
    }
  }, [username]); // Seulement dépendant du username

  // Separate useEffect to update counts when userProfile changes
  useEffect(() => {
    if (userProfile) {
      updateCounts(userProfile.followers_count || 0, userProfile.following_count || 0);
    }
  }, [userProfile?.id, userProfile?.followers_count, userProfile?.following_count]);

  // Separate useEffect to fetch posts when userProfile changes  
  useEffect(() => {
    if (userProfile?.id) {
      fetchPosts({ author_id: userProfile.id });
    }
  }, [userProfile?.id]);
  
  // Vérifier si c'est le profil de l'utilisateur connecté
  const isOwnProfile = currentUser?.profile?.username === username;

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

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Chargement du profil..." />;
  }

  if (!userProfile) {
    return (
      <div className="w-full mx-auto px-4 py-4 sm:py-6 max-w-2xl text-center overflow-hidden">
        <h1 className="text-2xl font-bold mb-4">Utilisateur introuvable</h1>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const userPosts = posts.filter(post => post.author_id === userProfile.id);

  return (
    <div className="w-full mx-auto px-4 py-4 sm:py-6 max-w-2xl overflow-hidden">
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
              <AvatarImage src={userProfile.profile_picture_url} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold text-xl">
                {userProfile.username?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-foreground">
                  @{userProfile.username}
                </h1>
                {userProfile.is_verified && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    ✓ Certifié
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-foreground">{followersCount}</span>
                  <span className="text-muted-foreground">abonnés</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-foreground">{followingCount}</span>
                  <span className="text-muted-foreground">abonnements</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-primary">{userPosts.length}</span>
                  <span className="text-muted-foreground">posts</span>
                </div>
              </div>
              
              {!isOwnProfile && canFollow && (
                <div className="flex items-center gap-2">
                  {!isFollowing ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={toggleFollow}
                      disabled={followLoading}
                      className="flex-1 bg-gradient-primary hover:opacity-90"
                    >
                      {followLoading ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          S'abonner
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleFollow}
                      disabled={followLoading}
                      className="flex-1 text-muted-foreground hover:text-destructive hover:border-destructive"
                    >
                      {followLoading ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Se désabonner
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {userProfile.bio && (
            <p className="text-foreground text-sm leading-relaxed bg-muted/50 p-3 rounded-lg">
              {userProfile.bio}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Posts */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-1 mb-6">
          <TabsTrigger value="posts">
            Posts ({userPosts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {postsLoading ? (
            <LoadingSpinner size="sm" text="Chargement des posts..." />
          ) : userPosts.length > 0 ? (
            userPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-primary/10 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/post/${post.id}`)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userProfile.profile_picture_url} />
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                        {userProfile.username?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm">@{userProfile.username}</span>
                        {userProfile.is_verified && (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                            ✓
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {post.spaces?.name && `dans ${post.spaces.name}`}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
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
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-green-600">
                        <ArrowUp className="h-4 w-4" />
                        {post.votes_up}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments_count}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        {post.views_count}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Aucun post encore</h3>
              <p className="text-muted-foreground">
                @{userProfile.username} n'a pas encore publié de posts
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}