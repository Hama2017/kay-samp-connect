import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search as SearchIcon, Filter, Users, MessageSquare, Hash, X } from "lucide-react";
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

const categories = [
  "Tous", "Sport", "Politique", "Cuisine", "Technologie", "Culture", "Société", "Économie"
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { query, setQuery, filters, setFilters, searchResults, isSearching } = useSearch();
  
  const [localQuery, setLocalQuery] = useState(query);
  const [isLoading, setIsLoading] = useState(false);

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
      <div className="container mx-auto px-4 py-6 max-w-4xl animate-fade-in-up">
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
                    {categories.map((category) => (
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
        {isLoading ? (
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
                      {searchResults.posts.slice(0, 3).map((post) => (
                        <Card key={post.id} className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                          <CardContent className="p-4" onClick={() => handlePostClick(post.id)}>
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                                <AvatarImage src={post.author.profilePicture} />
                                <AvatarFallback className="bg-gradient-primary text-white">
                                  {post.author.username[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2 min-w-0">
                                <div className="flex items-center space-x-2 flex-wrap">
                                  <span className="font-medium text-sm">@{post.author.username}</span>
                                  {post.author.isVerified && <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">✓</Badge>}
                                  <span className="text-muted-foreground hidden sm:inline">•</span>
                                  <Badge variant="outline" className="text-xs">{post.space.name}</Badge>
                                  <span className="text-muted-foreground hidden sm:inline">•</span>
                                  <Badge variant="outline" className="text-xs">{post.category}</Badge>
                                </div>
                                <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    👍 {post.votesUp}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    💬 {post.commentsCount}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    👀 {post.viewsCount}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Espaces */}
                  {searchResults.spaces.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Espaces recommandés</h3>
                      {searchResults.spaces.slice(0, 2).map((space) => (
                        <Card key={space.id} className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                          <CardContent className="p-4" onClick={() => handleSpaceClick(space.id)}>
                            <div className="flex items-center justify-between">
                              <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
                                    {space.name.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h3 className="font-semibold text-sm truncate">{space.name}</h3>
                                      {space.isVerified && <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">✓</Badge>}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{space.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground ml-14">
                                  <span>{space.subscribersCount.toLocaleString()} membres</span>
                                  <Badge variant="outline" className="text-xs">{space.category}</Badge>
                                </div>
                              </div>
                              <Button 
                                variant={space.isSubscribed ? "outline" : "default"} 
                                size="sm"
                                className="ml-4 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle subscription toggle
                                }}
                              >
                                {space.isSubscribed ? "Abonné" : "S'abonner"}
                              </Button>
                            </div>
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
                    searchResults.posts.map((post) => (
                      <Card key={post.id} className="cursor-pointer hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4" onClick={() => handlePostClick(post.id)}>
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={post.author.profilePicture} />
                              <AvatarFallback>{post.author.username[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">@{post.author.username}</span>
                                {post.author.isVerified && <Badge variant="secondary" className="text-xs">✓</Badge>}
                                <span className="text-muted-foreground">•</span>
                                <Badge variant="outline">{post.space.name}</Badge>
                              </div>
                              <p className="text-sm">{post.content}</p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>{post.votesUp} votes</span>
                                <span>{post.commentsCount} commentaires</span>
                                <span>{post.viewsCount} vues</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
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
                      <Card key={space.id} className="cursor-pointer hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4" onClick={() => handleSpaceClick(space.id)}>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold">{space.name}</h3>
                                {space.isVerified && <Badge variant="secondary" className="text-xs">✓</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground">{space.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>{space.subscribersCount} abonnés</span>
                                <Badge variant="outline">{space.category}</Badge>
                              </div>
                            </div>
                            <Button variant={space.isSubscribed ? "outline" : "default"} size="sm">
                              {space.isSubscribed ? "Abonné" : "S'abonner"}
                            </Button>
                          </div>
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
                                <AvatarImage src={user.profilePicture} />
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