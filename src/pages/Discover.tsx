import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, Hash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export default function Discover() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const filteredSpaces = mockSpaces.filter((space) => {
    const matchesSearch = space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         space.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || space.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="text-center mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          Découvrir
        </h1>
        <p className="text-muted-foreground">
          Trouve des espaces qui t'intéressent
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher des espaces..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 border-primary/20 focus:border-primary/40"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "senegal" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Spaces list */}
      <div className="space-y-4">
        {filteredSpaces.map((space) => (
          <Card 
            key={space.id} 
            className="hover:shadow-primary/10 hover:shadow-lg transition-all duration-300 animate-fade-in-up cursor-pointer"
            onClick={() => navigate(`/space/${space.id}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Hash className="h-6 w-6 text-primary-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {space.name}
                      </h3>
                      {space.isVerified && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          ✓ Certifié
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {space.category}
                      </Badge>
                      <span>•</span>
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
                  className="flex-shrink-0"
                >
                  {space.isSubscribed ? (
                    "Abonné"
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      S'abonner
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {space.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSpaces.length === 0 && (
        <div className="text-center py-12">
          <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Aucun espace trouvé</h3>
          <p className="text-muted-foreground">
            Essaie avec d'autres mots-clés ou explore d'autres catégories
          </p>
        </div>
      )}
    </div>
  );
}