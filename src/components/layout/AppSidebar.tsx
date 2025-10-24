import { X, Users } from "lucide-react";
import { SampZonesIcon } from "@/components/ui/SampZonesIcon";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useSpaces } from "@/hooks/useSpaces";

interface AppSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppSidebar({ open, onOpenChange }: AppSidebarProps) {
  const navigate = useNavigate();
  const { spaces, fetchSpaces, isLoading } = useSpaces();
  
  // Fetch spaces when sidebar opens
  useEffect(() => {
    if (open) {
      fetchSpaces();
    }
  }, [open, fetchSpaces]);

  // Filter only subscribed spaces
  const subscribedSpaces = spaces.filter(space => space.is_subscribed);
  
  if (!open) return null;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" 
        onClick={() => onOpenChange(false)}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] bg-card border-r shadow-xl animate-slide-in-right md:static md:animate-none safe-area-top">
        {/* Header with safe area */}
        <div className="flex items-center justify-between p-4 border-b h-16 md:mt-0">
          <h2 className="font-semibold text-foreground">Mes SAMP Zones</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="btn-mobile"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Spaces List - Mobile optimized scroll */}
        <div className="h-[calc(100vh-8rem)] mobile-scroll">
          <div className="p-4 space-y-2">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-32 mx-auto mb-2"></div>
                  <div className="h-3 bg-muted rounded w-24 mx-auto"></div>
                </div>
              </div>
            ) : subscribedSpaces.length > 0 ? (
              subscribedSpaces.map((space) => (
                <div
                  key={space.id}
                  className="card-mobile p-3 hover:bg-primary/5 cursor-pointer transition-all duration-200 group active:scale-95"
                  onClick={() => {
                    navigate(`/space/${space.id}`);
                    onOpenChange(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {space.name}
                        </h3>
                        {space.is_verified && (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary shrink-0">
                            ✓
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground truncate flex-1">
                          {space.categories && space.categories.join(" • ")}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {space.subscribers_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8 px-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SampZonesIcon size={32} className="text-primary/50" />
                </div>
                <p className="font-medium mb-2">Aucune SAMP Zone SAMPNA</p>
                <p className="text-sm leading-relaxed">
                  Explorez et abonnez-vous à des SAMP Zones pour les voir ici
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}