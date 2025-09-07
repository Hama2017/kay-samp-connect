import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const { signUp, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateUsername = (username: string) => {
    if (!username.trim()) {
      return "Le nom d'utilisateur est requis";
    }
    if (username.length < 3) {
      return "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }
    if (username.length > 20) {
      return "Le nom d'utilisateur ne peut pas dépasser 20 caractères";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores";
    }
    return null;
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return "L'adresse email est requise";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "L'adresse email n'est pas valide";
    }
    return null;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Le mot de passe est requis";
    }
    if (password.length < 6) {
      return "Le mot de passe doit contenir au moins 6 caractères";
    }
    return null;
  };

  const validatePhone = (phone: string) => {
    if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ''))) {
      return "Le numéro de téléphone n'est pas valide";
    }
    return null;
  };

  const checkEmailExists = async (email: string) => {
    try {
      console.log('Checking email:', email);
      const { data, error } = await supabase.rpc('check_email_exists', { 
        email_input: email 
      });
      
      console.log('Email check result:', { data, error });
      
      if (error) {
        console.error('Error checking email:', error);
        return false;
      }
      
      return data === true;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const checkUsernameExists = async (username: string) => {
    try {
      console.log('Checking username:', username);
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', username)
        .single();
      
      console.log('Username check result:', { data, error });
      
      if (error && error.code === 'PGRST116') {
        // Code PGRST116 = "The result contains 0 rows"
        return false; // Nom d'utilisateur disponible
      }
      
      if (data) {
        return true; // Nom d'utilisateur déjà pris
      }
      
      return false;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  const validateForm = async () => {
    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      toast({
        title: "Erreur",
        description: usernameError,
        variant: "destructive",
      });
      return false;
    }

    // Vérifier si le nom d'utilisateur existe déjà
    const usernameExists = await checkUsernameExists(formData.username);
    if (usernameExists) {
      toast({
        title: "Erreur",
        description: "Ce nom d'utilisateur est déjà pris",
        variant: "destructive",
      });
      return false;
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      toast({
        title: "Erreur",
        description: emailError,
        variant: "destructive",
      });
      return false;
    }

    // Vérifier si l'email existe déjà
    const emailExists = await checkEmailExists(formData.email);
    if (emailExists) {
      toast({
        title: "Erreur",
        description: "Un compte existe déjà avec cet email",
        variant: "destructive",
      });
      return false;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      toast({
        title: "Erreur",
        description: passwordError,
        variant: "destructive",
      });
      return false;
    }

    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      toast({
        title: "Erreur",
        description: phoneError,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) return;

    const { error } = await signUp(formData.email, formData.password, formData.username, formData.phone);
    
    if (!error) {
      toast({
        title: "Inscription réussie !",
        description: "Vérifiez votre email pour confirmer votre compte",
      });
      navigate("/login");
    } else {
      let errorMessage = error;
      
      // Gestion des erreurs spécifiques
      if (error.includes("User already registered") || error.includes("already registered")) {
        errorMessage = "Un compte existe déjà avec cet email";
      } else if (error.includes("Invalid email")) {
        errorMessage = "L'adresse email n'est pas valide";
      } else if (error.includes("Password")) {
        errorMessage = "Le mot de passe ne respecte pas les critères requis";
      } else if (error.includes("signup is disabled")) {
        errorMessage = "L'inscription est temporairement désactivée";
      }
      
      toast({
        title: "Erreur d'inscription",
        description: errorMessage,
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
            Créer un compte
          </CardTitle>
          <CardDescription>
            Rejoignez la communauté KaaySamp
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Nom d'utilisateur
              </label>
              <Input
                id="username"
                type="text"
                placeholder="votreusername"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Adresse email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemple.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">
                Numéro de téléphone <span className="text-muted-foreground">(optionnel)</span>
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+221 77 123 45 67"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
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
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pr-12"
                  required
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
              <p className="text-xs text-muted-foreground">
                Minimum 6 caractères
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Vous avez déjà un compte ?{" "}
              <Link 
                to="/login" 
                className="text-primary hover:underline font-medium"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}