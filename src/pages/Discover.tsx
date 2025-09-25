import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, Hash, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpaceBadge } from '@/components/SpaceBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSpaces } from "@/hooks/useSpaces";
import { usePageTracking } from "@/hooks/usePageTracking";

// Mock data for popular spaces
const mockSpaces = [
  {
    id: "space_001",
    name: "Lions du Sénégal 🦁",
    description: "Tout sur l'équipe nationale de football",
    category: "Sport",
    subscribersCount: 1247,
    isVerified: true,
    lastActivity: "2024-03-15T09:15:00Z",
    isSubscribed: true,
  },
  {
    id: "space_002",
    name: "Pod et Marichou Fan Club",
    description: "Discussions sur la série sénégalaise",
    category: "Culture & Musique",
    subscribersCount: 892,
    isVerified: false,
    lastActivity: "2024-03-15T08:30:00Z",
    isSubscribed: false,
  },
  {
    id: "space_003",
    name: "Cuisine Sénégalaise",
    description: "Recettes traditionnelles et modernes du Sénégal",
    category: "Cuisine",
    subscribersCount: 634,
    isVerified: true,
    lastActivity: "2024-03-15T07:45:00Z",
    isSubscribed: true,
  },
  {
    id: "space_004",
    name: "Tech Dakar",
    description: "Technologie et innovation au Sénégal",
    category: "Technologie",
    subscribersCount: 453,
    isVerified: false,
    lastActivity: "2024-03-15T06:20:00Z",
    isSubscribed: false,
  },
];

const categories = ["Tous", "Sport", "Culture & Musique", "Cuisine", "Technologie", "Religion"];

const sortOptions = [
  { value: "popular", label: "Plus populaires" },
  { value: "discussed", label: "Plus discutés" },
  { value: "recent", label: "Plus récents" },
  { value: "subscribers", label: "Plus d'abonnés" },
];

export default function Discover() {
  const navigate = useNavigate();
  const { spaces, isLoading, fetchSpaces, subscribeToSpace, unsubscribeFromSpace } = useSpaces();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [sortBy, setSortBy] = useState("popular");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState("tous");

  // Track page view
  usePageTracking();

  // Fetch spaces on component mount and when filters change
  useEffect(() => {
    fetchSpaces({
      category: selectedCategory,
      search: searchQuery,
      sort_by: sortBy as any,
      verified_only: showVerifiedOnly === "verifies"
    });
  }, [fetchSpaces, selectedCategory, searchQuery, sortBy, showVerifiedOnly]);

  const handleSubscriptionToggle = async (space: any) => {
    if (space.is_subscribed) {
      await unsubscribeFromSpace(space.id);
    } else {
      await subscribeToSpace(space.id);
    }
  };

  return (
    <div className="w-full mx-auto px-4 py-4 sm:py-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-6 animate-fade-in-up">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          Découvrir
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground px-2">
          Trouve des espaces qui t'intéressent
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-4 sm:mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher des espaces..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 border-primary/20 focus:border-primary/40 text-sm sm:text-base"
        />
      </div>

      {/* Filters */}
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        {/* Category filter */}
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "senegal" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap text-xs sm:text-sm flex-shrink-0"
            >
              {category}
            </Button>
          ))}
        </div>
        
        {/* Sort and Verified filters */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Trier par..." />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={showVerifiedOnly} onValueChange={setShowVerifiedOnly}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Statut..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous</SelectItem>
              <SelectItem value="verifies">Vérifiés ✓</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Spaces list */}
      <div className="space-y-3 sm:space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des espaces...</p>
          </div>
        ) : spaces.length === 0 ? (
          <div className="text-center py-12">
            <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Aucun espace trouvé</h3>
            <p className="text-muted-foreground">
              Essayez avec d'autres mots-clés ou explorez d'autres catégories
            </p>
          </div>
        ) : (
          spaces.map((space) => (
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
                        {space.badge && (
                          <SpaceBadge badge={space.badge} className="text-xs flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex flex-wrap gap-1">
                          {space.categories && space.categories.map((category) => (
                            <Badge key={category} variant="outline" className="text-xs flex-shrink-0">
                              {category}
                            </Badge>
                          ))}
                        </div>
                        <span className="hidden sm:inline">•</span>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{space.subscribers_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant={space.is_subscribed ? "outline" : "senegal"}
                    size="sm"
                    className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubscriptionToggle(space);
                    }}
                  >
                    {space.is_subscribed ? (
                      <span className="sm:hidden">✓</span>
                    ) : (
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                    )}
                    <span className="hidden sm:inline">
                      {space.is_subscribed ? "Abonné" : "S'abonner"}
                    </span>
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
      </div>
    </div>
  );
}