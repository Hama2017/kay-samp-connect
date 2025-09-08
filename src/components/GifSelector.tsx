import { useState } from "react";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GifSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (gifUrl: string) => void;
}

interface GifData {
  id: string;
  images: {
    fixed_height: {
      url: string;
    };
    original: {
      url: string;
    };
  };
}

export default function GifSelector({ isOpen, onClose, onSelectGif }: GifSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState<GifData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Clé API publique Giphy (limitée mais gratuite)
  const GIPHY_API_KEY = "your_giphy_api_key_here";
  const GIPHY_BASE_URL = "https://api.giphy.com/v1/gifs";

  const searchGifs = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      // Utilisation d'une API publique gratuite alternative
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=GlVGYHkr3WSBnllca54iNt0yFbjz7L65&q=${encodeURIComponent(query)}&limit=20&rating=g`
      );
      const data = await response.json();
      setGifs(data.data || []);
    } catch (error) {
      console.error("Erreur lors de la recherche de GIFs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingGifs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=GlVGYHkr3WSBnllca54iNt0yFbjz7L65&limit=20&rating=g`
      );
      const data = await response.json();
      setGifs(data.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des GIFs tendance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    if (isOpen && gifs.length === 0) {
      loadTrendingGifs();
    }
  };

  // Charger les GIFs tendance à l'ouverture
  useState(() => {
    handleOpen();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchGifs(searchQuery);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Choisir un GIF</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des GIFs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "..." : "Rechercher"}
          </Button>
        </form>

        <ScrollArea className="h-96">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {gifs.map((gif) => (
              <div
                key={gif.id}
                className="aspect-square cursor-pointer rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                onClick={() => {
                  onSelectGif(gif.images.original.url);
                  onClose();
                }}
              >
                <img
                  src={gif.images.fixed_height.url}
                  alt="GIF"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          
          {gifs.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground py-8">
              Aucun GIF trouvé. Essayez une autre recherche.
            </div>
          )}
          
          {isLoading && (
            <div className="text-center text-muted-foreground py-8">
              Chargement des GIFs...
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}