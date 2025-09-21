import { useState, useEffect } from "react";
import { MessageCircle, Heart, ChevronUp, ChevronDown, Eye, Settings, Calendar, Hash, Bookmark, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import { useSpacesPaginated } from "@/hooks/useSpacesPaginated";
import { useBookmarksPaginated } from "@/hooks/useBookmarksPaginated";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { InfiniteScrollLoader } from "@/components/InfiniteScrollLoader";
import { InfinitePostsList } from "@/components/InfinitePostsList";
import { AvatarUpload } from "@/components/AvatarUpload";
import { CoverImageUpload } from "@/components/CoverImageUpload";
import { SpaceBadge } from "@/components/SpaceBadge";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const { posts, isLoading: postsLoading, hasMore: postsHasMore, fetchPosts, loadMorePosts, votePost } = usePosts();
  const { spaces, isLoading: spacesLoading, hasMore: spacesHasMore, fetchSpaces, loadMoreSpaces } = useSpacesPaginated();
  const { bookmarks, isLoading: bookmarksLoading, hasMore: bookmarksHasMore, fetchBookmarks, loadMoreBookmarks } = useBookmarksPaginated();

  useEffect(() => {
    if (user?.id) {
      fetchPosts({ author_id: user.id });
      fetchSpaces({ user_spaces: true });
      fetchBookmarks({ item_type: 'post' });
      
      // Charger la photo de couverture
      const loadCoverImage = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('cover_image_url')
          .eq('id', user.id)
          .single();
        
        if (data?.cover_image_url) {
          setCoverImageUrl(data.cover_image_url);
        }
      };
      
      loadCoverImage();
    }
  }, [user?.id]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-muted-foreground">Utilisateur non trouvé</p>
      </div>
    );
  }

  const userPosts = posts.filter(post => post.author_id === user.id);
  const userSpaces = spaces.filter(space => space.creator_id === user.id);

  const initialLoading = (postsLoading || spacesLoading || bookmarksLoading) && 
    (posts.length === 0 && spaces.length === 0 && bookmarks.length === 0);

  if (initialLoading) {
    return <LoadingSpinner size="lg" text="Chargement du profil..." />;
  }

  return (
    <div className="w-full mx-auto px-4 py-4 sm:py-6 max-w-4xl overflow-hidden">
      {/* Cover Image */}
      <CoverImageUpload 
        currentCoverUrl={coverImageUrl}
        onUploadComplete={(url) => setCoverImageUrl(url)}
      />
      
      {/* Profile Header */}
      <Card className="rounded-t-none border-t-0">
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex items-end gap-4 -mt-12">
              <AvatarUpload
                currentAvatarUrl={user.profile?.profile_picture_url}
                fallbackText={user.profile?.username?.substring(0, 2).toUpperCase() || "U"}
                size="xl"
              />
              
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
                {user.profile?.show_email && user.email && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex gap-6">
              {user.profile?.show_followers !== false && (
                <>
                  <div className="text-center">
                    <p className="text-xl font-bold">{user.profile?.followers_count || 0}</p>
                    <p className="text-sm text-muted-foreground">Abonnés</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{user.profile?.following_count || 0}</p>
                    <p className="text-sm text-muted-foreground">Abonnements</p>
                  </div>
                </>
              )}
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
            <TabsTrigger value="bookmarks">Favoris</TabsTrigger>
          </TabsList>
          
          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4 mt-6">
            {userPosts.length > 0 ? (
              <InfinitePostsList
                posts={userPosts}
                onLoadMore={async () => loadMorePosts()}
                onVote={votePost}
                onIncrementViews={(postId) => {}}
                onPostClick={(post) => navigate(`/post/${post.id}`)}
                hasMore={postsHasMore}
                isLoading={postsLoading}
              />
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
            {spacesLoading && userSpaces.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement des espaces...</p>
              </div>
            ) : userSpaces.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {userSpaces.map((space) => (
                  <Card 
                    key={space.id} 
                    className="hover:shadow-primary/10 hover:shadow-lg transition-all duration-300 animate-fade-in-up cursor-pointer"
                    onClick={() => navigate(`/space/${space.id}`)}
                  >
                    <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                      <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                            <Hash className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 sm:gap-2 mb-1">
                              <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                                {space.name}
                              </h3>
                              {space.is_verified && (
                                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary flex-shrink-0">
                                  ✓
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                {space.category}
                              </Badge>
                              <span className="hidden sm:inline">•</span>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{space.subscribers_count}</span>
                              </div>
                              {space.is_public && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <Badge variant="secondary" className="text-xs">Public</Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                        {space.description || "Aucune description disponible"}
                      </p>
                    </CardContent>
                  </Card>
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
                <h3 className="text-lg font-semibold mb-2">Aucun espace créé</h3>
                <p className="text-muted-foreground">
                  Vous n'avez pas encore créé d'espaces
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks" className="space-y-4 mt-6">
            {bookmarksLoading && bookmarks.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement des favoris...</p>
              </div>
            ) : bookmarks.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {bookmarks.filter(bookmark => bookmark.item_type === 'post').map((bookmark) => {
                  const post = posts.find(p => p.id === bookmark.item_id);
                  if (!post) return null;
                  
                  return (
                    <InfinitePostsList
                      key={bookmark.id}
                      posts={[post]}
                      onLoadMore={async () => {}}
                      onVote={votePost}
                      onIncrementViews={(postId) => {}}
                      onPostClick={(post) => navigate(`/post/${post.id}`)}
                      hasMore={false}
                      isLoading={false}
                    />
                  );
                }).filter(Boolean)}
                
                {bookmarksHasMore && (
                  <div className="text-center py-4">
                    <Button
                      variant="outline"
                      onClick={() => loadMoreBookmarks({ item_type: 'post' })}
                      disabled={bookmarksLoading}
                      className="gap-2"
                    >
                      {bookmarksLoading ? (
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
                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun post favori</h3>
                <p className="text-muted-foreground">
                  Les posts que vous mettez en favoris apparaîtront ici
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}