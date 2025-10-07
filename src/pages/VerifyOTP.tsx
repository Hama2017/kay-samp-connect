import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import logo from "@/assets/kaaysamp-logo.png";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const { phone, from } = location.state || {};

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  useEffect(() => {
    if (!phone) {
      navigate('/auth');
    }
  }, [phone, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (otp.length !== 6) {
      setError("Veuillez entrer le code à 6 chiffres.");
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Vérification OTP pour:', phone);
      
      // 🔥 ÉTAPE 1: Vérifier l'OTP
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms'
      });

      if (error) {
        console.error('❌ Erreur vérification:', error);
        throw error;
      }

      console.log('✅ OTP vérifié, user:', data.user);

      if (!data.user) {
        throw new Error("Erreur de connexion");
      }

      // 🔥 ÉTAPE 2: Vérifier si le profil existe et est complet
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name, phone')
        .eq('id', data.user.id)
        .single();

      console.log('📋 Profil récupéré:', profile);

      // 🔥 DÉTERMINER SI C'EST UN NOUVEAU USER
      const isNewUser = !profile || 
                       !profile.username || 
                       profile.username.startsWith('user_') ||
                       !profile.full_name;

      console.log('🆕 Nouveau user?', isNewUser);

      if (isNewUser) {
        // NOUVEAU UTILISATEUR → Compléter le profil
        toast({
          title: "Code vérifié ✅",
          description: "Créons votre profil !",
        });
        
        navigate('/profile-completion', { 
          replace: true,
          state: { userId: data.user.id }
        });
      } else {
        // UTILISATEUR EXISTANT → Connexion directe
        toast({
          title: "Connexion réussie ✅",
          description: `Content de vous revoir ${profile.full_name || '@' + profile.username} !`,
        });

        // 🔥 VÉRIFIER SI ONBOARDING APP DÉJÀ FAIT
        const onboardingKey = `app_onboarding_completed_${data.user.id}`;
        const hasSeenOnboarding = localStorage.getItem(onboardingKey);

        if (!hasSeenOnboarding) {
          // Montrer le carousel de présentation
          navigate('/app-onboarding', { replace: true });
        } else {
          // Aller directement à l'accueil
          const redirectTo = from?.pathname || '/';
          navigate(redirectTo, { replace: true });
        }
      }

    } catch (error: any) {
      console.error('❌ Erreur:', error);
      
      let errorMessage = "Code invalide ou expiré.";
      
      if (error.message?.includes('expired')) {
        errorMessage = "Le code a expiré. Demandez-en un nouveau.";
      } else if (error.message?.includes('invalid')) {
        errorMessage = "Code incorrect. Vérifiez votre SMS.";
      }
      
      setError(errorMessage);
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    setCanResend(false);
    setCountdown(60);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone
      });

      if (error) throw error;

      toast({
        title: "Code renvoyé ✅",
        description: "Vérifiez vos SMS",
      });
    } catch (error: any) {
      setError("Impossible de renvoyer le code.");
      setCanResend(true);
      setCountdown(0);
    } finally {
      setIsLoading(false);
    }
  };

  if (!phone) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <img 
              src={logo} 
              alt="KaaySamp" 
              className="relative h-24 w-24 object-contain"
            />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Vérification
            </h1>
            <div className="space-y-1">
              <p className="text-muted-foreground text-base">
                Code envoyé au
              </p>
              <p className="font-semibold text-foreground text-lg tracking-wider">{phone}</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-2 backdrop-blur-sm bg-card/50 shadow-2xl">
        <CardContent className="pt-6 space-y-6">
          {error && (
            <Alert variant="destructive" className="animate-scale-in">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  setError(null);
                }}
                disabled={isLoading}
              >
                <InputOTPGroup className="gap-1.5">
                  <InputOTPSlot index={0} className="w-12 h-14 text-xl font-semibold border-2 transition-all duration-200" />
                  <InputOTPSlot index={1} className="w-12 h-14 text-xl font-semibold border-2 transition-all duration-200" />
                  <InputOTPSlot index={2} className="w-12 h-14 text-xl font-semibold border-2 transition-all duration-200" />
                  <InputOTPSlot index={3} className="w-12 h-14 text-xl font-semibold border-2 transition-all duration-200" />
                  <InputOTPSlot index={4} className="w-12 h-14 text-xl font-semibold border-2 transition-all duration-200" />
                  <InputOTPSlot index={5} className="w-12 h-14 text-xl font-semibold border-2 transition-all duration-200" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Vérification...
                </>
              ) : (
                'Vérifier'
              )}
            </Button>
          </form>

          <div className="space-y-3">
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleResend}
                disabled={!canResend || isLoading}
                className="text-sm hover:bg-accent/50 transition-colors"
              >
                {canResend ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Renvoyer le code
                  </>
                ) : (
                  `Renvoyer dans ${countdown}s`
                )}
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => navigate('/auth')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Changer de numéro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}