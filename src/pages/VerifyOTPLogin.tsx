import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/common/AuthLayout";
import { LoadingButton } from "@/components/common/LoadingButton";
import { ErrorAlert } from "@/components/common/ErrorAlert";

export default function VerifyOTPLogin() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const { phone } = location.state || {};

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
      navigate('/login');
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
      console.log('🔐 [VerifyOTPLogin] Vérification OTP');
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms'
      });

      if (error) {
        console.error('❌ [VerifyOTPLogin] Erreur:', error);
        throw error;
      }

      console.log('✅ [VerifyOTPLogin] Connexion réussie');

      if (!data.user) {
        throw new Error("Erreur de connexion");
      }

      // Attendre que la session soit établie
      await new Promise(resolve => setTimeout(resolve, 500));

      // Vérifier si le profil est complété
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_profile_completed')
        .eq('id', data.user.id)
        .single();

      console.log('📋 [VerifyOTPLogin] Profil:', profile);

      if (!profile?.is_profile_completed) {
        console.log('⚠️ [VerifyOTPLogin] Profil incomplet, redirection vers profile-completion');
        toast({
          title: "Bienvenue !",
          description: "Complète ton profil pour continuer",
        });
        navigate('/profile-completion', { state: { userId: data.user.id }, replace: true });
        return;
      }

      toast({
        title: "Connexion réussie !",
        description: "Bienvenue sur KaaySamp ! 🎉",
      });

      // Rediriger vers Home
      navigate('/', { replace: true });

    } catch (error: any) {
      console.error('❌ [VerifyOTPLogin] Erreur:', error);
      
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
    <AuthLayout showLogo={false}>
      <div className="flex flex-col items-center space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Vérification
          </h1>
          <div className="space-y-1">
            <p className="text-muted-foreground text-base">Code envoyé au</p>
            <p className="font-semibold text-foreground text-lg tracking-wider">{phone}</p>
          </div>
        </div>

        <Card className="w-full border-2 backdrop-blur-sm bg-card/50 shadow-2xl">
          <CardContent className="pt-6 space-y-6">
            <ErrorAlert message={error} className="animate-scale-in" />

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

              <LoadingButton 
                type="submit" 
                className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
                disabled={otp.length !== 6}
                isLoading={isLoading}
                loadingText="Connexion..."
              >
                Se connecter
              </LoadingButton>
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
                  onClick={() => navigate('/login')}
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
    </AuthLayout>
  );
}
