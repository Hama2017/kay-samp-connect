import { useNavigate } from "react-router-dom";
import { Users, Hash } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpaceBadge } from '@/components/SpaceBadge';

interface Space {
  id: string;
  name: string;
  description?: string;
  categories?: string[];
  subscribers_count: number;
  is_verified: boolean;
  is_subscribed?: boolean;
  badge?: 'evenement' | 'factcheck' | 'kaaysamp' | 'official' | null;
}

interface SpaceCardProps {
  space: Space;
  onSubscriptionToggle?: (space: Space) => void;
}

export function SpaceCard({ space, onSubscriptionToggle }: SpaceCardProps) {
  const navigate = useNavigate();

  const handleSubscriptionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSubscriptionToggle) {
      onSubscriptionToggle(space);
    }
  };

  return (
    <Card 
      className="hover:shadow-primary/10 hover:shadow-lg transition-all duration-300 animate-fade-in-up cursor-pointer"
      onClick={() => navigate(`/space/${space.id}`)}
    >
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
        <div className="mb-2">     
          {space.is_verified && (
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary flex-shrink-0">
              Officiel ✓
            </Badge>
          )}
          {space.badge && (
            <SpaceBadge badge={space.badge} className="text-xs flex-shrink-0" />
          )}
        </div>
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
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{space.subscribers_count}</span>
                </div>
              </div>
            </div>
          </div>
          
          {onSubscriptionToggle && (
            <Button
              variant={space.is_subscribed ? "outline" : "senegal"}
              size="sm"
              className="flex-shrink-0 text-xs sm:text-sm px-3 sm:px-4"
              onClick={handleSubscriptionClick}
            >
              {space.is_subscribed ? "SAMPNA" : "DamaySAMP"}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-2">
          {space.description || "Aucune description disponible"}
        </p>

        <div className="flex flex-wrap gap-1">
          {space.categories && space.categories.map((category) => (
            <Badge key={category} variant="outline" className="text-xs flex-shrink-0">
              {category}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
