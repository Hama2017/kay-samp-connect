import { Home, Search, Plus, TrendingUp, User, FileText, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-md supports-[backdrop-filter]:bg-[hsl(var(--background))] bg-[hsl(var(--background))] before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[env(safe-area-inset-bottom)] before:bg-[hsl(var(--background))]">
  <div className="flex items-center justify-around h-[6.5rem] px-2 max-w-screen-sm mx-auto pb-[calc(env(safe-area-inset-bottom)+4px)]">
    {navigationItems.map((item) => {
      const Icon = item.icon;

      if (item.isSpecial) {
        return (
          <DropdownMenu key={item.path}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="senegal"
                size="fab"
                className="btn-mobile shadow-primary relative z-10"
              >
                <Icon className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="top" className="mb-2">
              <DropdownMenuItem asChild>
                <NavLink to="/create-post" className="flex items-center gap-2 w-full">
                  <FileText className="h-4 w-4" />
                  Créer un post
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/create-space" className="flex items-center gap-2 w-full">
                  <Users className="h-4 w-4" />
                  Créer un espace
                </NavLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }

      return (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px] btn-mobile",
              isActive
                ? "text-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn("h-5 w-5", isActive && "animate-gentle-bounce")} />
              <span className="text-xs font-medium leading-tight">{item.label}</span>
            </>
          )}
        </NavLink>
      );
    })}
  </div>
</nav>
  );
}