import { Search, Menu, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNotifications } from "@/hooks/useNotifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import kaaysampLogo from "@/assets/kaaysamp-logo.jpg";

interface AppHeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  
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
              className="h-8 w-12 object-cover rounded-md"
            />
            <span className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent hidden sm:block">
              KaaySamp
            </span>
          </div>
        </div>

        {/* Right side - Search and Notifications */}
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="w-64 pl-9 border-primary/20 focus:border-primary/40"
              onFocus={() => navigate('/search')}
              readOnly
            />
          </div>
          
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/notifications')}
            className="relative hover:bg-primary/5"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                {unreadCount}
              </Badge>
            )}
          </Button>
          
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary/5">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {user?.username?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">@{user?.username}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.phone}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Mon profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="icon" className="sm:hidden hover:bg-primary/5">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}