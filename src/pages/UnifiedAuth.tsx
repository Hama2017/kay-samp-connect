import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

export default function UnifiedAuth() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!phone.trim()) {
      setError("Veuillez entrer votre numéro de téléphone.");
      return;
    }

    // Validation basique du format international
    if (!phone.startsWith('+') || phone.length < 10) {
      setError("Numéro invalide. Utilisez le sélecteur de pays.");
      return;
    }

    setIsLoading(true);

    try {
      console.log('📱 Envoi OTP à:', phone);
      
    /*   const { data, error } = await supabase.auth.signInWithOtp({
        phone: phone,
      }); */

      if (error) {
        console.error('❌ Erreur:', error);
        throw error;
      }

     /*  console.log('✅ OTP envoyé:', data); */

      toast({
        title: "Code envoyé ✅",
        description: "Vérifiez vos SMS",
      });

      navigate('/verify-otp', { 
        state: { 
          phone: phone,
          from: location.state?.from 
        } 
      });

    } catch (error: any) {
      console.error('❌ Erreur complète:', error);
      
      let errorMessage = "Impossible d'envoyer le code. Réessayez.";
      
      if (error.message?.includes('rate limit')) {
        errorMessage = "Trop de tentatives. Attendez quelques minutes.";
      } else if (error.message?.includes('Invalid phone')) {
        errorMessage = "Numéro de téléphone invalide.";
      }
      
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src="/src/assets/kaaysamp-logo.png" 
              alt="KaaySamp" 
              className="h-20 w-20 object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Bienvenue sur KaaySamp
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Entrez votre numéro pour commencer
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Numéro de téléphone
              </label>
              <PhoneInput
                defaultCountry="sn"
                value={phone}
                onChange={(value) => {
                  setPhone(value);
                  setError(null);
                }}
                disabled={isLoading}
                inputClassName="w-full"
                countrySelectorStyleProps={{
                  buttonClassName: "border-input"
                }}
              />
              <p className="text-xs text-muted-foreground">
                Sélectionnez votre pays et entrez votre numéro
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  Continuer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}