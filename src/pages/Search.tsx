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

const categories = [
  "Tous", "Sport", "Politique", "Cuisine", "Technologie", "Culture", "Société", "Économie"
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { query, setQuery, filters, setFilters, searchResults, isSearching } = useSearch();
  
  const [localQuery, setLocalQuery] = useState(query);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(localQuery);
    updateURL(localQuery, filters);
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
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Barre de recherche */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher des posts, espaces, utilisateurs..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {localQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Filtres */}
            <div className="flex flex-wrap gap-4">
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger className="w-32">
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
                <SelectTrigger className="w-40">
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
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Pertinence</SelectItem>
                  <SelectItem value="recent">Récent</SelectItem>
                  <SelectItem value="popular">Populaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Résultats */}
      {isSearching && (
        <div className="space-y-4">
          {/* Statistiques de recherche */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {searchResults.totalResults} résultat{searchResults.totalResults > 1 ? 's' : ''} pour "{query}"
            </p>
            <Badge variant="outline">
              {searchResults.posts.length} posts • {searchResults.spaces.length} espaces • {searchResults.users.length} utilisateurs
            </Badge>
          </div>

          {searchResults.totalResults === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun résultat trouvé</h3>
                <p className="text-muted-foreground">
                  Essayez des mots-clés différents ou élargissez vos critères de recherche.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  Tout ({searchResults.totalResults})
                </TabsTrigger>
                <TabsTrigger value="posts">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Posts ({searchResults.posts.length})
                </TabsTrigger>
                <TabsTrigger value="spaces">
                  <Hash className="h-4 w-4 mr-1" />
                  Espaces ({searchResults.spaces.length})
                </TabsTrigger>
                <TabsTrigger value="users">
                  <Users className="h-4 w-4 mr-1" />
                  Utilisateurs ({searchResults.users.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {/* Posts */}
                {searchResults.posts.map((post) => (
                  <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow">
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
                            <span className="text-muted-foreground">•</span>
                            <Badge variant="outline">{post.category}</Badge>
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
                ))}

                {/* Espaces */}
                {searchResults.spaces.map((space) => (
                  <Card key={space.id} className="cursor-pointer hover:shadow-md transition-shadow">
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
                ))}

                {/* Utilisateurs */}
                {searchResults.users.map((user) => (
                  <Card key={user.id} className="cursor-pointer hover:shadow-md transition-shadow">
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
                ))}
              </TabsContent>

              <TabsContent value="posts" className="space-y-4">
                {searchResults.posts.map((post) => (
                  <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow">
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
                ))}
              </TabsContent>

              <TabsContent value="spaces" className="space-y-4">
                {searchResults.spaces.map((space) => (
                  <Card key={space.id} className="cursor-pointer hover:shadow-md transition-shadow">
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
                ))}
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                {searchResults.users.map((user) => (
                  <Card key={user.id} className="cursor-pointer hover:shadow-md transition-shadow">
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
                ))}
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}

      {/* État initial sans recherche */}
      {!isSearching && (
        <Card>
          <CardContent className="p-8 text-center">
            <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Recherchez du contenu</h2>
            <p className="text-muted-foreground mb-4">
              Trouvez des posts, espaces et utilisateurs qui vous intéressent
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline">#Lions</Badge>
              <Badge variant="outline">#Tech</Badge>
              <Badge variant="outline">#Cuisine</Badge>
              <Badge variant="outline">#Culture</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}