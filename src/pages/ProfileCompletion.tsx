import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/common/AuthLayout";
import { LoadingButton } from "@/components/common/LoadingButton";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import logo from "@/assets/kaaysamp-logo.png";

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

  // Vérifier la disponibilité du username
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

      const userOnboardingKey = `onboarding_completed_${userId}`;
      localStorage.setItem(userOnboardingKey, 'true');
      localStorage.setItem('onboarding_completed', 'true');

      await updateUserProfile();
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
    <AuthLayout showLogo={false}>
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-6">
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              step === 'name' 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'bg-primary/10 border-primary text-primary'
            }`}>
              <span className="text-sm font-semibold">1</span>
            </div>
            <div className={`w-8 h-0.5 ${step === 'name' ? 'bg-border' : 'bg-primary'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              step === 'username' 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'bg-background border-border text-muted-foreground'
            }`}>
              <span className="text-sm font-semibold">2</span>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">
              {step === 'name' ? "Nom complet" : "Choisissez votre pseudo"}
            </CardTitle>
            {step === 'username' && (
              <CardDescription className="text-sm">
                Salut {fullName} 👋 Votre identifiant unique sur KaaySamp
              </CardDescription>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <ErrorAlert message={error} />

          {step === 'name' ? (
            <form onSubmit={handleNameSubmit} className="space-y-5">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="NanditeBii😎"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setError(null);
                  }}
                  className="h-14 text-base"
                  autoFocus
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Utilisez votre nom, un surnom ou même des emojis
                </p>
              </div>

              <LoadingButton 
                type="submit" 
                className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
                disabled={!fullName.trim()}
                isLoading={isLoading}
                loadingText="Validation..."
              >
                Suivant
                <ArrowRight className="ml-2 h-5 w-5" />
              </LoadingButton>
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
                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
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
                      <CheckCircle className="h-3 w-3" />
                      Déjà pris
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <LoadingButton 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold" 
                  disabled={!username || !isAvailable}
                  isLoading={isLoading}
                  loadingText="Création..."
                >
                  Continuer 🚀
                  <ArrowRight className="ml-2 h-5 w-5" />
                </LoadingButton>

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

        </CardContent>
      </Card>
    </AuthLayout>
  );
}
