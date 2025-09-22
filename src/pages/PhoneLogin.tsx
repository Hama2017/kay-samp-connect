import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Phone, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PhoneLogin() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Formater le numéro de téléphone
  const formatPhoneNumber = (phoneInput: string): string => {
    let cleaned = phoneInput.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('0')) {
      cleaned = '+33' + cleaned.substring(1);
    }
    
    if (!cleaned.startsWith('+')) {
      cleaned = '+33' + cleaned;
    }
    
    return cleaned;
  };

  const validatePhoneNumber = (phoneInput: string): boolean => {
    const formatted = formatPhoneNumber(phoneInput);
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(formatted);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!phone.trim()) {
      setError("Veuillez entrer votre numéro de téléphone.");
      return;
    }

    if (!validatePhoneNumber(phone)) {
      setError("Numéro invalide. Format: +33612345678 ou 0612345678");
      return;
    }

    const formattedPhone = formatPhoneNumber(phone);
    setIsLoading(true);

    try {
      console.log('📱 Envoi OTP avec Supabase Auth à:', formattedPhone);
      
      // 🔥 UTILISER SUPABASE AUTH AU LIEU DES EDGE FUNCTIONS
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          // Optionnel : personnaliser le message SMS
          // channel: 'sms',
        }
      });

      if (error) {
        console.error('❌ Erreur Supabase Auth:', error);
        throw error;
      }

      console.log('✅ OTP envoyé avec succès:', data);

      toast({
        title: "Code envoyé ✅",
        description: "Vérifiez vos SMS pour le code de vérification",
      });

      // Rediriger vers la page de vérification OTP
      navigate('/verify-otp', { 
        state: { 
          phone: formattedPhone,
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
      } else if (error.message?.includes('Phone provider')) {
        errorMessage = "Service SMS non configuré dans Supabase Auth.";
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
          <CardTitle className="text-2xl font-bold">
            Connexion par SMS
          </CardTitle>
          <CardDescription>
            Entrez votre numéro de téléphone pour recevoir un code
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError(null);
                  }}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Format: +33612345678 ou 0612345678
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
                  Envoi en cours...
                </>
              ) : (
                'Envoyer le code'
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Vous préférez utiliser un email ?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Connexion classique
            </Link>
          </div>

          {/* Info de debug */}
          <div className="mt-4 p-3 bg-muted rounded-lg text-xs">
            <p className="font-medium mb-1">ℹ️ Configuration requise :</p>
            <p className="text-muted-foreground">
              Supabase → Settings → Authentication → Phone Auth doit être activé avec Twilio
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}