import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileCompletion() {
  const [step, setStep] = useState<'name' | 'username'>('name');
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUserProfile } = useAuth();

  const { userId } = location.state || {};

  // Vérifier la disponibilité du username en temps réel
  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username.length < 3 || step !== 'username') {
        setIsAvailable(null);
        return;
      }

      const regex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!regex.test(username)) {
        setIsAvailable(null);
        return;
      }

      setIsChecking(true);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .ilike('username', username)
          .single();

        if (error && error.code === 'PGRST116') {
          setIsAvailable(true);
        } else if (data) {
          setIsAvailable(false);
        }
      } catch (error) {
        console.error('Erreur check:', error);
      } finally {
        setIsChecking(false);
      }
    };

    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);
  }, [username, step]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!fullName.trim()) {
      setError("Entrez votre nom");
      return;
    }

    if (fullName.trim().length < 2) {
      setError("Nom trop court (min 2 caractères)");
      return;
    }

    if (fullName.length > 50) {
      setError("Nom trop long (max 50 caractères)");
      return;
    }

    setStep('username');
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!username.trim()) {
      setError("Choisissez un nom d'utilisateur");
      return;
    }

    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!regex.test(username)) {
      setError("3-20 caractères (lettres, chiffres, _)");
      return;
    }

    if (!isAvailable) {
      setError("Ce nom d'utilisateur est déjà pris");
      return;
    }

    if (!userId) {
      setError("Session invalide");
      return;
    }

    setIsLoading(true);

    try {
      // 🔥 CRÉER LE PROFIL COMPLET
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName.trim(),
          username: username.toLowerCase(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast({
        title: "Profil créé ! 🎉",
        description: `Bienvenue ${fullName} (@${username})`,
      });

      // 🔥 MARQUER L'ONBOARDING COMME TERMINÉ
      const userOnboardingKey = `onboarding_completed_${userId}`;
      localStorage.setItem(userOnboardingKey, 'true');
      localStorage.setItem('onboarding_completed', 'true');

      await updateUserProfile();
      
      // 🔥 REDIRIGER VERS L'ONBOARDING APP (carousel)
      navigate('/app-onboarding', { replace: true });

    } catch (error: any) {
      console.error('Erreur:', error);
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <img 
                src="/src/assets/kaaysamp-logo.png" 
                alt="KaaySamp" 
                className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/20"
              />
              <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">
              {step === 'name' ? "Comment vous appelez-vous ?" : "Choisissez votre pseudo"}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {step === 'name' 
                ? "Votre nom complet (visible sur votre profil)"
                : `Salut ${fullName} 👋 Votre identifiant unique sur KaaySamp`
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'name' ? (
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Mamadou Diallo 🇸🇳"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setError(null);
                  }}
                  className="h-14 text-lg text-center"
                  disabled={isLoading}
                  autoFocus
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Utilisez votre vrai nom, un surnom ou même des emojis ! 🎨✨
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold" 
                disabled={isLoading || !fullName.trim()}
              >
                Suivant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleUsernameSubmit} className="space-y-6">
              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
                    @
                  </span>
                  <Input
                    type="text"
                    placeholder="votre_pseudo"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value.toLowerCase());
                      setError(null);
                    }}
                    className="pl-10 h-14 text-lg"
                    disabled={isLoading}
                    autoFocus
                    maxLength={20}
                  />
                  {isChecking && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
                  )}
                  {!isChecking && isAvailable === true && (
                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                  {!isChecking && isAvailable === false && (
                    <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
                  )}
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    3-20 caractères • Lettres, chiffres et underscore uniquement
                  </p>
                  {isAvailable === true && (
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Disponible !
                    </p>
                  )}
                  {isAvailable === false && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Déjà pris
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold" 
                  disabled={isLoading || !username || !isAvailable}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      Continuer 🚀
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep('name')}
                  disabled={isLoading}
                  className="w-full"
                >
                  Retour
                </Button>
              </div>
            </form>
          )}

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Étape {step === 'name' ? '1' : '2'}/2 • Vous pourrez tout modifier dans les paramètres
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}