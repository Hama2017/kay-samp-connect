import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, UserCheck, Settings, Calendar, MessageCircle, ChevronUp, ChevronDown, Eye, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { InfiniteScrollLoader } from "@/components/InfiniteScrollLoader";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/hooks/usePosts";
import { useSpacesPaginated } from "@/hooks/useSpacesPaginated";

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const { posts, isLoading: postsLoading,fetchPosts, hasMore: postsHasMore, loadMorePosts } = usePosts();
  const { spaces, isLoading: spacesLoading, hasMore: spacesHasMore, loadMoreSpaces } = useSpacesPaginated();

useEffect(() => {
  const loadUserProfile = async () => {
    if (!username) return;
    
    setIsLoading(true);
    
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
        
      if (profileError) throw profileError;
      
      setUserProfile(profile);
      setFollowersCount(profile.followers_count || 0);
      setFollowingCount(profile.following_count || 0);
      setCoverImageUrl(profile.cover_image_url || "");
      
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  loadUserProfile();
}, [username]);

// NOUVEAU useEffect séparé pour charger les posts
useEffect(() => {
  if (userProfile?.id) {
    fetchPosts({ author_id: userProfile.id });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [userProfile?.id]); // Se déclenche quand userProfile change

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser?.id || !userProfile?.id || currentUser.id === userProfile.id) {
        setIsFollowing(false);
        return;
      }

      try {
        const { data: followData } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', currentUser.id)
          .eq('following_id', userProfile.id)
          .maybeSingle();
          
        setIsFollowing(!!followData);
      } catch (error) {
        console.error('Error checking follow status:', error);
        setIsFollowing(false);
      }
    };

    checkFollowStatus();
  }, [currentUser?.id, userProfile?.id]);

  const handleFollowToggle = async () => {
    if (!currentUser?.id || !userProfile?.id || currentUser.id === userProfile.id) return;

    setFollowLoading(true);

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', userProfile.id);

        if (error) throw error;

        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: currentUser.id,
            following_id: userProfile.id
          });

        if (error) throw error;

        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const isOwnProfile = currentUser?.profile?.username === username;
  const userPosts = posts.filter(post => post.author_id === userProfile?.id);
  const userSpaces = spaces.filter(space => space.creator_id === userProfile?.id);

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Chargement du profil..." />;
  }

  if (!userProfile) {
    return (
      <div className="w-full mx-auto px-4 py-4 sm:py-6 max-w-4xl text-center">
        <h1 className="text-2xl font-bold mb-4">Utilisateur introuvable</h1>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 py-4 sm:py-6 max-w-4xl overflow-hidden">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate(-1)}
        className="mb-4 hover:bg-primary/5"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      {coverImageUrl ? (
        <div className="w-full h-48 rounded-t-lg overflow-hidden mb-0">
          <img 
            src={coverImageUrl} 
            alt="Couverture" 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-primary rounded-t-lg mb-0" />
      )}

      <Card className="rounded-t-none border-t-0">
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex items-end gap-4 -mt-12">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={userProfile.profile_picture_url} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold text-2xl">
                  {userProfile.username?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              {!isOwnProfile ? (
                <div className="flex items-center gap-2">
                  {!isFollowing ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className="bg-gradient-primary hover:opacity-90 gap-2"
                    >
                      {followLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          S'abonner
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className="gap-2"
                    >
                      {followLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4" />
                          Se désabonner
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="h-4 w-4" />
                  Modifier le profil
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">@{userProfile.username}</h1>
                {userProfile.is_verified && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    ✓ Certifié
                  </Badge>
                )}
              </div>
              
              {userProfile.bio && (
                <p className="text-muted-foreground mb-3">{userProfile.bio}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs text-muted-foreground">
                    Rejoint le {new Date(userProfile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-xl font-bold">{followersCount}</p>
                <p className="text-sm text-muted-foreground">Abonnés</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{followingCount}</p>
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

      <div className="mt-6">
        <Tabs defaultValue="posts">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="spaces">Espaces</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-4 mt-6">
            <InfiniteScrollLoader
              hasMore={postsHasMore}
              isLoading={postsLoading}
              onLoadMore={() => loadMorePosts()}
            >
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                        onClick={() => navigate(`/post/${post.id}`)}>
                    <CardContent className="pt-6">
                      <p className="text-foreground mb-3 leading-relaxed">
                        {post.content}
                      </p>
                      
                      {post.hashtags && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {post.hashtags.map((tag: string) => (
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
                    @{userProfile.username} n'a pas encore publié de posts
                  </p>
                </div>
              )}
            </InfiniteScrollLoader>
          </TabsContent>

          <TabsContent value="spaces" className="space-y-4 mt-6">
            <InfiniteScrollLoader
              hasMore={spacesHasMore}
              isLoading={spacesLoading}
              onLoadMore={() => loadMoreSpaces()}
            >
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
                    @{userProfile.username} n'a pas encore créé d'espaces
                  </p>
                </div>
              )}
            </InfiniteScrollLoader>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}