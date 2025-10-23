import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center space-y-8 animate-fade-in-up max-w-md">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center">
          <SearchX className="h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Page introuvable
          </h2>
          <p className="text-muted-foreground">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        {/* Action */}
        <Button
          onClick={() => navigate("/")}
          variant="senegal"
          size="lg"
          className="gap-2"
        >
          <Home className="h-4 w-4" />
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
