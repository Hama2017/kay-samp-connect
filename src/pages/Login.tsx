import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const { signIn, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    const { error } = await signIn(email, password);
    
    if (!error) {
      toast({
        title: "Connexion réussie !",
        description: "Bienvenue sur KaaySamp",
      });
      navigate(from, { replace: true });
    } else {
      toast({
        title: "Erreur de connexion",
        description: error,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/src/assets/kaaysamp-logo.jpg" 
              alt="KaaySamp" 
              className="h-16 w-16 rounded-full object-cover"
            />
          </div>
          <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
            Connexion
          </CardTitle>
          <CardDescription>
            Connectez-vous à votre compte KaaySamp
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Adresse email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-4"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Vous n'avez pas de compte ?{" "}
              <Link 
                to="/register" 
                className="text-primary hover:underline font-medium"
              >
                Créer un compte
              </Link>
            </p>
          </div>

          <div className="bg-muted/50 border rounded-lg p-4">
            <h3 className="font-medium text-sm mb-2">Test avec votre compte :</h3>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Créez votre compte en cliquant sur "Créer un compte"</p>
              <p>Ou connectez-vous avec votre email/mot de passe</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}