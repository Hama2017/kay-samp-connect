import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search as SearchIcon, Filter, Users, MessageSquare, Hash, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { SpaceBadge } from '@/components/SpaceBadge';

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
    const urlSort = searchParams.get('sort') as SearchFilters['sortBy'] || 'relevance';

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
    if (newFilters.sortBy !== 'relevance') params.set('sort', newFilters.sortBy);
    
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
        <Card className="mb-6 shadow-warm">
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

                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger className="w-28 sm:w-36 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Pertinence</SelectItem>
                    <SelectItem value="recent">Récent</SelectItem>
                    <SelectItem value="popular">Populaire</SelectItem>
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
                        <Card 
                          key={space.id} 
                          className="hover:shadow-primary/10 hover:shadow-lg transition-all duration-300 cursor-pointer"
                          onClick={() => handleSpaceClick(space.id)}
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
                                    {space.isVerified && (
                                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary flex-shrink-0">
                                        ✓
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                                    <div className="flex flex-wrap gap-1">
                                      {space.category && space.category.split(", ").map((cat: string) => (
                                        <Badge key={cat} variant="outline" className="text-xs flex-shrink-0">
                                          {cat}
                                        </Badge>
                                      ))}
                                    </div>
                                    <span className="hidden sm:inline">•</span>
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      <span>{space.subscribersCount}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <Button
                                variant={space.isSubscribed ? "outline" : "senegal"}
                                size="sm"
                                className="flex-shrink-0 text-xs sm:text-sm px-3 sm:px-4"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                {space.isSubscribed ? "Abonné" : "S'abonner"}
                              </Button>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              {space.description || "Aucune description disponible"}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Utilisateurs */}
                  {searchResults.users.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Utilisateurs suggérés</h3>
                      {searchResults.users.slice(0, 3).map((user) => (
                        <Card key={user.id} className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                          <CardContent className="p-4" onClick={() => handleUserClick(user.username)}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                                <AvatarImage src={user.profilePicture} />
                                <AvatarFallback className="bg-gradient-primary text-white">
                                    {user.username[0]?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="font-semibold text-sm truncate">@{user.username}</h3>
                                    {user.isVerified && <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">✓</Badge>}
                                  </div>
                                  {user.bio && <p className="text-xs text-muted-foreground line-clamp-1">{user.bio}</p>}
                                  <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                                    <span>{user.followersCount} abonnés</span>
                                    <span>•</span>
                                    <span>{user.followingCount} abonnements</span>
                                  </div>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="ml-4 text-xs"
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
                      <Card 
                        key={space.id} 
                        className="hover:shadow-primary/10 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        onClick={() => handleSpaceClick(space.id)}
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
                                  {space.isVerified && (
                                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary flex-shrink-0">
                                      ✓
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                                  <div className="flex flex-wrap gap-1">
                                    {space.category && space.category.split(", ").map((cat: string) => (
                                      <Badge key={cat} variant="outline" className="text-xs flex-shrink-0">
                                        {cat}
                                      </Badge>
                                    ))}
                                  </div>
                                  <span className="hidden sm:inline">•</span>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span>{space.subscribersCount}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              variant={space.isSubscribed ? "outline" : "senegal"}
                              size="sm"
                              className="flex-shrink-0 text-xs sm:text-sm px-3 sm:px-4"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              {space.isSubscribed ? "Abonné" : "S'abonner"}
                            </Button>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                            {space.description || "Aucune description disponible"}
                          </p>
                        </CardContent>
                      </Card>
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
                      <Card key={user.id} className="cursor-pointer hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4" onClick={() => handleUserClick(user.username)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src="" />
                                <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-semibold">@{user.username}</h3>
                                  {user.isVerified && <Badge variant="secondary" className="text-xs">✓</Badge>}
                                </div>
                                {user.bio && <p className="text-sm text-muted-foreground">{user.bio}</p>}
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                  <span>{user.followersCount} abonnés</span>
                                  <span>{user.followingCount} abonnements</span>
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
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