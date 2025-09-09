import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUserProfile } = useAuth();

  const { phone, username, from } = location.state || {};

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Redirect if no phone number
  useEffect(() => {
    if (!phone) {
      navigate('/phone-login');
    }
  }, [phone, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer le code à 6 chiffres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { 
          phone: phone,
          otp: otp,
          username: username
        }
      });

      if (error) throw error;

      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté à votre compte.",
      });

      // Update user profile in context
      await updateUserProfile();

      // Redirect to intended page or home
      const redirectTo = from?.pathname || '/';
      navigate(redirectTo, { replace: true });

    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Erreur",
        description: error.message || "Code invalide ou expiré. Veuillez réessayer.",
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

    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: phone }
      });

      if (error) throw error;

      toast({
        title: "Code renvoyé",
        description: "Un nouveau code a été envoyé sur votre téléphone.",
      });
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      toast({
        title: "Erreur",
        description: "Impossible de renvoyer le code. Veuillez réessayer.",
        variant: "destructive",
      });
      setCanResend(true);
      setCountdown(0);
    } finally {
      setIsLoading(false);
    }
  };

  if (!phone) {
    return null; // Will redirect via useEffect
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
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