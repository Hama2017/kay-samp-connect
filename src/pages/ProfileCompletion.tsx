import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
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
  const navigate = useNavigate();
  const location = useLocation();
  const {
    updateUserProfile
  } = useAuth();
  const {
    userId
  } = location.state || {};

  // Redirection si pas de userId
  useEffect(() => {
    if (!userId) {
      navigate('/auth', { replace: true });
    }
  }, [userId, navigate]);

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
        const trimmedUsername = username.trim().toLowerCase();
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', trimmedUsername)
          .maybeSingle();
        
        if (error) {
          console.error('Erreur check username:', error);
          setIsAvailable(null);
        } else if (data) {
          setIsAvailable(false);
          setError("Ce nom d'utilisateur est déjà pris");
        } else {
          setIsAvailable(true);
          setError(null);
        }
      } catch (error) {
        console.error('Erreur check:', error);
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    };
    const timer = setTimeout(checkUsername, 300);
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
      setError("Nom trop long (max 100 caractères)");
      return;
    }
    setStep('username');
  };
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const trimmedUsername = username.trim().toLowerCase();
    
    if (!trimmedUsername) {
      setError("Choisissez un nom d'utilisateur");
      return;
    }
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!regex.test(trimmedUsername)) {
      setError("3-20 caractères (lettres, chiffres, _)");
      return;
    }
    
    if (!userId) {
      setError("Session invalide");
      return;
    }
    
    setIsLoading(true);
    try {
      // Double vérification avant la soumission
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', trimmedUsername)
        .maybeSingle();
      
      if (existingUser) {
        setError("Ce nom d'utilisateur est déjà pris");
        setIsAvailable(false);
        setIsLoading(false);
        return;
      }
      
      const {
        error: updateError
      } = await supabase.from('profiles').update({
        full_name: fullName.trim(),
        username: trimmedUsername,
        updated_at: new Date().toISOString()
      }).eq('id', userId);
      
      if (updateError) {
        // Gestion spécifique de l'erreur de username en double
        if (updateError.code === '23505' || updateError.message.includes('profiles_username_unique')) {
          setError("Ce nom d'utilisateur vient d'être pris. Choisissez-en un autre.");
          setIsAvailable(false);
          return;
        }
        throw updateError;
      }
      
      // Mise à jour du contexte d'authentification
      await updateUserProfile();
      
      // Petit délai pour s'assurer que le contexte est mis à jour
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Redirection vers l'onboarding de l'app (sans marquer comme complété)
      navigate('/app-onboarding', {
        replace: true,
        state: { fromProfileCompletion: true }
      });
    } catch (error: any) {
      console.error('Erreur:', error);
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId) {
    return null;
  }

  return <AuthLayout showLogo={false}>
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-6">
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step === 'name' ? 'bg-primary border-primary text-primary-foreground' : 'bg-primary/10 border-primary text-primary'}`}>
              <span className="text-sm font-semibold">1</span>
            </div>
            <div className={`w-8 h-0.5 ${step === 'name' ? 'bg-border' : 'bg-primary'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step === 'username' ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-border text-muted-foreground'}`}>
              <span className="text-sm font-semibold">2</span>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">
              {step === 'name' ? "Nom d'affichage" : "Nom d'utilisateur"}
            </CardTitle>
            {step === 'name' && <CardDescription className="text-sm text-muted-foreground">
                C'est le nom que les autres verront sur votre profil
              </CardDescription>}
            {step === 'username' && <CardDescription className="text-sm text-muted-foreground">Votre identifiant unique</CardDescription>}
            {step === 'username'}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <ErrorAlert message={error} />

          {step === 'name' ? <form onSubmit={handleNameSubmit} className="space-y-5">
              <div className="space-y-2">
                <Input type="text" placeholder="ex: NanditeBii😎" value={fullName} onChange={e => {
              setFullName(e.target.value);
              setError(null);
            }} className="h-14 text-base" autoFocus maxLength={100} />
                <p className="text-xs text-muted-foreground text-center">
                  Utilisez votre nom, un surnom ou même des emojis
                </p>
              </div>

              <LoadingButton type="submit" className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" disabled={!fullName.trim()} isLoading={isLoading} loadingText="Validation...">
                Suivant
                <ArrowRight className="ml-2 h-5 w-5" />
              </LoadingButton>
            </form> : <form onSubmit={handleUsernameSubmit} className="space-y-6">
              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
                    @
                  </span>
                  <Input type="text" placeholder="" value={username} onChange={e => {
                setUsername(e.target.value.toLowerCase());
                setError(null);
              }} className="pl-10 h-14 text-lg" disabled={isLoading} autoFocus maxLength={20} />
                  {isChecking && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />}
                </div>
                
                <p className="text-xs text-muted-foreground">
                  3-20 caractères • Lettres, chiffres et underscore uniquement
                </p>
              </div>

              <div className="space-y-3">
                <LoadingButton type="submit" className="w-full h-12 text-lg font-semibold" disabled={!username || isChecking || !isAvailable} isLoading={isLoading} loadingText="Création...">
                  Continuer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </LoadingButton>

                <Button type="button" variant="ghost" onClick={() => setStep('name')} disabled={isLoading} className="w-full">
                  Retour
                </Button>
              </div>
            </form>}

        </CardContent>
      </Card>
    </AuthLayout>;
}