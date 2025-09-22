import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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
  const { updateUserProfile } = useAuth();

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
      navigate('/phone-login');
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
      console.log('🔐 Vérification OTP avec Supabase Auth pour:', phone);
      
      // 🔥 UTILISER SUPABASE AUTH POUR VÉRIFIER L'OTP
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms'
      });

      if (error) {
        console.error('❌ Erreur vérification OTP:', error);
        throw error;
      }

      console.log('✅ OTP vérifié avec succès:', data);

      // Vérifier si c'est un nouvel utilisateur
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', data.user.id)
          .single();

        // Si pas de profil ou username vide, rediriger vers onboarding
        if (!profile || !profile.username) {
          console.log('📝 Nouvel utilisateur, redirection vers onboarding');
          navigate('/onboarding', { replace: true });
          return;
        }
      }

      toast({
        title: "Connexion réussie ✅",
        description: "Vous êtes maintenant connecté !",
      });

      // Update user profile
      await updateUserProfile();

      // Redirect
      const redirectTo = from?.pathname || '/';
      navigate(redirectTo, { replace: true });

    } catch (error: any) {
      console.error('❌ Erreur complète:', error);
      
      let errorMessage = "Code invalide ou expiré.";
      
      if (error.message?.includes('expired')) {
        errorMessage = "Le code a expiré. Demandez-en un nouveau.";
      } else if (error.message?.includes('invalid')) {
        errorMessage = "Code incorrect. Vérifiez votre SMS.";
      }
      
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
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
      console.log('🔄 Renvoi OTP à:', phone);
      
      // 🔥 RENVOYER L'OTP AVEC SUPABASE AUTH
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone
      });

      if (error) throw error;

      toast({
        title: "Code renvoyé ✅",
        description: "Un nouveau code a été envoyé",
      });
    } catch (error: any) {
      console.error('❌ Erreur renvoi OTP:', error);
      setError("Impossible de renvoyer le code.");
      setCanResend(true);
      setCountdown(0);
    } finally {
      setIsLoading(false);
    }
  };

  if (!phone) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/src/assets/kaaysamp-logo.jpg" 
              alt="KaaySamp Logo" 
              className="h-12 w-12 rounded-full"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Vérification</CardTitle>
          <CardDescription>
            Entrez le code à 6 chiffres envoyé au<br />
            <span className="font-medium">{phone}</span>
          </CardDescription>
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
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                'Vérifier le code'
              )}
            </Button>
          </form>

          <div className="text-center space-y-4">
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

            <Button
              variant="ghost"
              onClick={() => navigate('/phone-login')}
              className="text-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Changer de numéro
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}