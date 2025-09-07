import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import kaaysampLogo from "@/assets/kaaysamp-logo.png";

interface AppHeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left side - Menu and Logo */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMenuClick}
            className="hover:bg-primary/5"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <img 
              src={kaaysampLogo} 
              alt="KaaySamp" 
              className="h-8 w-8 object-contain"
            />
            <span className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent hidden sm:block">
              KaaySamp
            </span>
          </div>
        </div>

        {/* Right side - Search */}
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des espaces..."
              className="w-64 pl-9 border-primary/20 focus:border-primary/40"
            />
          </div>
          <Button variant="ghost" size="icon" className="sm:hidden">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}