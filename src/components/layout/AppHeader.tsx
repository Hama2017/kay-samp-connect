import { Search, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SpaceInvitationNotifications } from "@/components/SpaceInvitationNotifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import kaaysampLogo from "@/assets/kaaysamp-logo.png";

interface AppHeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left side - Menu and Logo */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMenuClick}
            className="btn-mobile hover:bg-primary/5"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <img 
              src={kaaysampLogo} 
              alt="KaaySamp" 
              className="h-8 w-12 rounded-md"
            />
            <span className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent  sm:block">
              KaaySamp
            </span>
          </div>
        </div>

        {/* Right side - Mobile Actions */}
        <div className="flex items-center gap-2">
          {/* Desktop Search */}
                <Button 
            variant="ghost" 
            size="icon" 
            className="btn-mobile hover:bg-primary/5"
            onClick={() => navigate('/search')}
          >
            <Search className="h-5 w-5" />
          </Button>
          
          {/* Space Invitations */}
          <SpaceInvitationNotifications />
          
          {/* Theme Toggle - Hidden on mobile to save space */}
  {/*         <div className="hidden sm:block">
            <ThemeToggle />
          </div> */}
          
          {/* User Profile */}
       <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative btn-mobile rounded-full hover:bg-primary/5">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profile?.profile_picture_url} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">
                    {user?.profile?.username?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">@{user?.profile?.username}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
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
              {/* Theme toggle in mobile dropdown */}
             <div className="sm:hidden">
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm">Thème</span>
                  <ThemeToggle />
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> 


        </div>
      </div>
    </header>
  );
}