import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, UserCheck, Settings, Calendar, MessageCircle, Hash, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { InfinitePostsList } from "@/components/InfinitePostsList";
import { SpaceCard } from "@/components/SpaceCard";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/hooks/usePosts";
import { useSpacesPaginated } from "@/hooks/useSpacesPaginated";
import defaultCover from "@/assets/default-cover.png";

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const { posts, isLoading: postsLoading, fetchPosts, hasMore: postsHasMore, loadMorePosts, votePost, incrementViews } = usePosts();
  const { spaces, isLoading: spacesLoading, hasMore: spacesHasMore, loadMoreSpaces, fetchSpaces } = useSpacesPaginated();

useEffect(() => {
  const loadUserProfile = async () => {
    if (!username) return;
    
    setIsLoading(true);
    
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name, bio, profile_picture_url, cover_image_url, is_verified, followers_count, following_count, created_at, updated_at, profile_visible')
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

// useEffect séparé pour charger les posts et espaces de l'utilisateur
useEffect(() => {
  if (userProfile?.id) {
    fetchPosts({ author_id: userProfile.id });
    fetchSpaces({ user_spaces: true });
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
  // Les posts et espaces sont déjà filtrés par les hooks
  const userPosts = posts;
  const userSpaces = spaces;

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

      <div className="w-full h-48 rounded-t-lg overflow-hidden mb-0">
        <img 
          src={coverImageUrl || defaultCover} 
          alt="Couverture" 
          className="w-full h-full object-cover"
        />
      </div>

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
                          DamaySAMP
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
                          DamayBayi
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
              
              {userProfile.full_name && (
                <p className="text-lg text-foreground mb-2">
                  {userProfile.full_name}
                </p>
              )}
              
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
                <p className="text-sm text-muted-foreground">SAMPNA</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{userPosts.length}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{userSpaces.length}</p>
                <p className="text-sm text-muted-foreground">SAMP Zones</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="mt-6">
        <Tabs defaultValue="posts">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="spaces">SAMP Zones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-4 mt-6">
            {userPosts.length > 0 ? (
              <InfinitePostsList
                posts={userPosts}
                onLoadMore={loadMorePosts}
                onVote={votePost}
                onIncrementViews={incrementViews}
                onPostClick={(post) => navigate(`/post/${post.id}`)}
                hasMore={postsHasMore}
                isLoading={postsLoading}
              />
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun post encore</h3>
                <p className="text-muted-foreground">
                  @{userProfile.username} n'a pas encore publié de posts
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="spaces" className="space-y-4 mt-6">
            {spacesLoading && userSpaces.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement des SAMP Zones...</p>
              </div>
            ) : userSpaces.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {userSpaces.map((space) => (
                  <SpaceCard
                    key={space.id}
                    space={space}
                  />
                ))}
                
                {spacesHasMore && (
                  <div className="text-center py-4">
                    <Button
                      variant="outline"
                      onClick={() => loadMoreSpaces({ user_spaces: true })}
                      disabled={spacesLoading}
                      className="gap-2"
                    >
                      {spacesLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Charger plus
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune SAMP Zone créée</h3>
                <p className="text-muted-foreground">
                  @{userProfile.username} n'a pas encore créé de SAMP Zones
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}