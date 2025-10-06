import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, Hash, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SpaceCard } from "@/components/SpaceCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSpaces } from "@/hooks/useSpaces";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useCategories } from "@/hooks/useCategories";


const sortOptions = [
  { value: "popular", label: "Plus populaires" },
  { value: "discussed", label: "Plus discutés" },
  { value: "recent", label: "Plus récents" },
  { value: "subscribers", label: "Plus d'abonnés" },
];

export default function Discover() {
  const navigate = useNavigate();
  const { spaces, isLoading, fetchSpaces, subscribeToSpace, unsubscribeFromSpace } = useSpaces();
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [sortBy, setSortBy] = useState("popular");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState("tous");

  const categoryOptions = ['Tous', ...categories.map(c => c.name)];

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
          {categoryOptions.map((category) => (
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
              <SelectItem value="verifies">Vérifiés</SelectItem>
              <SelectItem value="evenement">Événement</SelectItem>
              <SelectItem value="kaaysamp">KaaySamp</SelectItem>
              <SelectItem value="factcheck">Fact Check</SelectItem>
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
            <SpaceCard
              key={space.id}
              space={space}
              onSubscriptionToggle={handleSubscriptionToggle}
            />
          ))
        )}
      </div>
    </div>
  );
}