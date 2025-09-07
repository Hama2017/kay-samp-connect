import { Home, Search, Plus, TrendingUp, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  { icon: Home, label: "Accueil", path: "/" },
  { icon: Search, label: "Découvrir", path: "/discover" },
  { icon: Plus, label: "Créer", path: "/create", isSpecial: true },
  { icon: TrendingUp, label: "Tendances", path: "/trending" },
  { icon: User, label: "Profil", path: "/profile" },
];

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t">
      <div className="flex items-center justify-around h-16 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          
          if (item.isSpecial) {
            return (
              <NavLink key={item.path} to={item.path}>
                <Button
                  variant="senegal"
                  size="fab"
                  className="shadow-primary"
                >
                  <Icon className="h-6 w-6" />
                </Button>
              </NavLink>
            );
          }
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px]",
                  isActive
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("h-5 w-5", isActive && "animate-gentle-bounce")} />
                  <span className="text-xs font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}