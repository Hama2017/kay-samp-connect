import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src="/src/assets/kaaysamp-logo.png" 
              alt="KaaySamp" 
              className="h-16 w-16 rounded-full object-cover ring-4 ring-primary/20"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              Vérification
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Code envoyé au<br />
              <span className="font-semibold text-foreground">{phone}</span>
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
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold" 
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
                className="text-sm"
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
                className="text-sm text-muted-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Changer de numéro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}