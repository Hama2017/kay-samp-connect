import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    const success = await login(formData.email, formData.password);
    
    if (success) {
      toast({
        title: "Connexion réussie !",
        description: "Bienvenue sur KaaySamp"
      });
      navigate(from, { replace: true });
    } else {
      toast({
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect",
        variant: "destructive"
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
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

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center mb-2">
              Comptes de démonstration :
            </p>
            <div className="text-xs space-y-1">
              <p><strong>amadou@kaaysamp.sn</strong> (mot de passe: 123456)</p>
              <p><strong>fatima@kaaysamp.sn</strong> (mot de passe: 123456)</p>
              <p><strong>omar@kaaysamp.sn</strong> (mot de passe: 123456)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}