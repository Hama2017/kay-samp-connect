import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search as SearchIcon, Filter, Users, MessageSquare, Hash, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearch, SearchFilters } from "@/hooks/useSearch";
import { EmptyState } from "@/components/EmptyState";
import { SearchResultsSkeleton, FeedSkeleton } from "@/components/SkeletonLoader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PullToRefresh } from "@/components/MobileOptimized";
import { useCategories } from "@/hooks/useCategories";
import { InfinitePostsList } from "@/components/InfinitePostsList";
import { SpaceCard } from "@/components/SpaceCard";
import { Card, CardContent } from "@/components/ui/card";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { query, setQuery, filters, setFilters, searchResults, isSearching, isLoading: searchLoading } = useSearch();
  const { categories } = useCategories();
  
  const [localQuery, setLocalQuery] = useState(query);
  const [isLoading, setIsLoading] = useState(false);

  const categoryOptions = ['Tous', ...categories.map(c => c.name)];

  // Simuler le délai de recherche
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
  };

  // Initialiser la recherche depuis l'URL
  useEffect(() => {
  const urlQuery = searchParams.get('q') || '';
  const urlType = searchParams.get('type') as SearchFilters['type'] || 'all';
  const urlCategory = searchParams.get('category') || 'Tous';
  const urlSort = searchParams.get('sort') as SearchFilters['sortBy'] || 'recent';

    setQuery(urlQuery);
    setLocalQuery(urlQuery);
    setFilters({
      type: urlType,
      category: urlCategory,
      sortBy: urlSort
    });
  }, [searchParams, setQuery, setFilters]);

  // Mettre à jour l'URL quand les filtres changent
  const updateURL = (newQuery: string, newFilters: SearchFilters) => {
    const params = new URLSearchParams();
    if (newQuery) params.set('q', newQuery);
    if (newFilters.type !== 'all') params.set('type', newFilters.type);
    if (newFilters.category !== 'Tous') params.set('category', newFilters.category);
    if (newFilters.sortBy !== 'recent') params.set('sort', newFilters.sortBy);
    
    setSearchParams(params);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(localQuery);
    updateURL(localQuery, filters);
    await performSearch(localQuery);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(query, newFilters);
  };

  const clearSearch = () => {
    setLocalQuery('');
    setQuery('');
    setSearchParams({});
  };

  const handleRefresh = async () => {
    await performSearch(query);
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleSpaceClick = (spaceId: string) => {
    navigate(`/space/${spaceId}`);
  };

  const handleUserClick = (username: string) => {
    navigate(`/user/${username}`);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="w-full mx-auto px-4 py-4 sm:py-6 max-w-4xl animate-fade-in-up overflow-hidden">
        {/* Barre de recherche */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Rechercher des posts, espaces, utilisateurs..."
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  className="pl-12 pr-12 h-12 text-base bg-muted/30 border-0 focus:bg-background transition-all duration-300"
                />
                {localQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Filtres - Responsive */}
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                  <SelectTrigger className="w-24 sm:w-32 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tout</SelectItem>
                    <SelectItem value="posts">Posts</SelectItem>
                    <SelectItem value="spaces">Espaces</SelectItem>
                    <SelectItem value="users">Utilisateurs</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger className="w-32 sm:w-40 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Search button for mobile */}
                <Button type="submit" size="sm" className="sm:hidden">
                  <SearchIcon className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Résultats */}
        {searchLoading ? (
          <div className="space-y-6">
            <LoadingSpinner size="lg" text="Recherche en cours..." />
            <FeedSkeleton />
          </div>
        ) : isSearching ? (
          <div className="space-y-4 animate-fade-in-up">
            {/* Statistiques de recherche */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm text-muted-foreground">
                {searchResults.totalResults} résultat{searchResults.totalResults > 1 ? 's' : ''} pour 
                <span className="font-medium text-foreground"> "{query}"</span>
              </p>
              <Badge variant="outline" className="text-xs">
                {searchResults.posts.length} posts • {searchResults.spaces.length} espaces • {searchResults.users.length} utilisateurs
              </Badge>
            </div>

            {searchResults.totalResults === 0 ? (
              <EmptyState
                icon={SearchIcon}
                title="Aucun résultat trouvé"
                description={`Essayez des mots-clés différents ou élargissez vos critères de recherche pour "${query}".`}
                actionLabel="Effacer la recherche"
                onAction={clearSearch}
              />
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="all" className="text-xs sm:text-sm">
                    Tout ({searchResults.totalResults})
                  </TabsTrigger>
                  <TabsTrigger value="posts" className="text-xs sm:text-sm">
                    <MessageSquare className="h-4 w-4 mr-1 hidden sm:inline" />
                    Posts ({searchResults.posts.length})
                  </TabsTrigger>
                  <TabsTrigger value="spaces" className="text-xs sm:text-sm">
                    <Hash className="h-4 w-4 mr-1 hidden sm:inline" />
                    Espaces ({searchResults.spaces.length})
                  </TabsTrigger>
                  <TabsTrigger value="users" className="text-xs sm:text-sm">
                    <Users className="h-4 w-4 mr-1 hidden sm:inline" />
                    Utilisateurs ({searchResults.users.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6">
                  {/* Posts */}
                  {searchResults.posts.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Posts populaires</h3>
                      <InfinitePostsList
                        posts={searchResults.posts.slice(0, 3)}
                        onLoadMore={async () => {}}
                        onVote={async () => {}}
                        onIncrementViews={async () => {}}
                        onPostClick={(post) => navigate(`/post/${post.id}`)}
                        hasMore={false}
                        isLoading={false}
                      />
                    </div>
                  )}

                  {/* Espaces */}
                  {searchResults.spaces.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Espaces recommandés</h3>
                      {searchResults.spaces.slice(0, 2).map((space) => (
                        <SpaceCard
                          key={space.id}
                          space={{
                            id: space.id,
                            name: space.name,
                            description: space.description,
                            categories: space.category ? space.category.split(", ") : [],
                            subscribers_count: space.subscribersCount,
                            is_verified: space.isVerified,
                            is_subscribed: space.isSubscribed,
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Utilisateurs */}
                  {searchResults.users.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Utilisateurs suggérés</h3>
                      {searchResults.users.slice(0, 3).map((user) => (
                      <Card key={user.id} className="cursor-pointer hover:shadow-sm transition-all duration-200">
                          <CardContent className="p-3 sm:p-4" onClick={() => handleUserClick(user.username)}>
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                                  <AvatarImage src={user.profilePicture} />
                                  <AvatarFallback className="bg-gradient-primary text-white">
                                    {user.username[0]?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  {user.bio && <p className="text-sm font-medium truncate mb-0.5">{user.bio}</p>}
                                  <p className="text-xs sm:text-sm text-muted-foreground truncate">@{user.username}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{user.followersCount} DamaySAMP</p>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex-shrink-0 text-xs h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle follow toggle
                                }}
                              >
                                Suivre
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Individual tabs pour les résultats spécifiques */}
                <TabsContent value="posts" className="space-y-4">
                  {searchResults.posts.length === 0 ? (
                    <EmptyState
                      icon={MessageSquare}
                      title="Aucun post trouvé"
                      description={`Aucun post ne correspond à "${query}"`}
                    />
                  ) : (
                    <InfinitePostsList
                      posts={searchResults.posts}
                      onLoadMore={async () => {}}
                      onVote={async () => {}}
                      onIncrementViews={async () => {}}
                      onPostClick={(post) => navigate(`/post/${post.id}`)}
                      hasMore={false}
                      isLoading={false}
                    />
                  )}
                </TabsContent>

                <TabsContent value="spaces" className="space-y-4">
                  {searchResults.spaces.length === 0 ? (
                    <EmptyState
                      icon={Hash}
                      title="Aucun espace trouvé"
                      description={`Aucun espace ne correspond à "${query}"`}
                    />
                  ) : (
                    searchResults.spaces.map((space) => (
                      <SpaceCard
                        key={space.id}
                        space={{
                          id: space.id,
                          name: space.name,
                          description: space.description,
                          categories: space.category ? space.category.split(", ") : [],
                          subscribers_count: space.subscribersCount,
                          is_verified: space.isVerified,
                          is_subscribed: space.isSubscribed,
                        }}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                  {searchResults.users.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="Aucun utilisateur trouvé"
                      description={`Aucun utilisateur ne correspond à "${query}"`}
                    />
                  ) : (
                    searchResults.users.map((user) => (
                      <Card key={user.id} className="cursor-pointer hover:shadow-sm transition-all duration-200">
                        <CardContent className="p-3 sm:p-4" onClick={() => handleUserClick(user.username)}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                                <AvatarImage src={user.profilePicture} />
                                <AvatarFallback className="bg-gradient-primary text-white">
                                  {user.username[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                {user.bio && <p className="text-sm font-medium truncate mb-0.5">{user.bio}</p>}
                                <p className="text-xs sm:text-sm text-muted-foreground truncate">@{user.username}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{user.followersCount} DamaySAMP</p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex-shrink-0 text-xs h-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle follow toggle
                              }}
                            >
                              Suivre
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        ) : (
          <EmptyState
            icon={SearchIcon}
            title="Recherchez du contenu"
            description="Utilisez la barre de recherche pour découvrir des posts, des espaces et des utilisateurs sur KaaySamp."
            className="mt-8"
          />
        )}
      </div>
    </PullToRefresh>
  );
}