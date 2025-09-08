import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BookmarksList } from "@/components/bookmarks/BookmarksList";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function Bookmarks() {
  const navigate = useNavigate();

  // Track page view
  usePageTracking();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Mes Favoris</h1>
              <p className="text-sm text-muted-foreground">
                Tout votre contenu sauvegardé en un seul endroit
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <BookmarksList />
      </div>
    </div>
  );
}