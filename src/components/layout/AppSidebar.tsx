import { X, Users, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AppSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock data for subscribed spaces
const subscribedSpaces = [
  { id: "1", name: "Lions du Sénégal 🦁", category: "Sport", memberCount: 1247, isVerified: true },
  { id: "2", name: "Pod et Marichou Fan Club", category: "Culture", memberCount: 892, isVerified: false },
  { id: "3", name: "Cuisine Sénégalaise", category: "Cuisine", memberCount: 634, isVerified: true },
  { id: "4", name: "Tech Dakar", category: "Technologie", memberCount: 453, isVerified: false },
  { id: "5", name: "Musique Wolof", category: "Musique", memberCount: 278, isVerified: false },
];

export function AppSidebar({ open, onOpenChange }: AppSidebarProps) {
  const navigate = useNavigate();
  
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/20 md:hidden" 
        onClick={() => onOpenChange(false)}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-80 bg-card border-r shadow-lg animate-slide-in-right md:static md:animate-none">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-foreground">Mes Espaces</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Spaces List */}
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="p-4 space-y-2">
            {subscribedSpaces.map((space) => (
              <div
                key={space.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors group"
                onClick={() => navigate(`/space/${space.id}`)}
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Hash className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm truncate group-hover:text-primary">
                      {space.name}
                    </h3>
                    {space.isVerified && (
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                        ✓ Certifié
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {space.category}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {space.memberCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}