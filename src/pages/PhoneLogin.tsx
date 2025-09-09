import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Phone, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function PhoneLogin() {
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'username'>('phone');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre numéro de téléphone.",
        variant: "destructive",
      });
      return;
    }

    // Format phone number to international format
    const formattedPhone = phone.startsWith('+') ? phone : `+33${phone.replace(/^0/, '')}`;

    setIsLoading(true);

    try {
      // Check if user exists with this phone number
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('phone', formattedPhone)
        .single();

      if (existingUser) {
        // User exists, send OTP directly
        await sendOTP(formattedPhone);
      } else {
        // New user, ask for username first
        setStep('username');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setIsLoading(false);
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nom d'utilisateur.",
        variant: "destructive",
      });
      return;
    }

    const formattedPhone = phone.startsWith('+') ? phone : `+33${phone.replace(/^0/, '')}`;
    await sendOTP(formattedPhone, username);
  };

  const sendOTP = async (formattedPhone: string, usernameToUse?: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: formattedPhone }
      });

      if (error) throw error;

      toast({
        title: "Code envoyé",
        description: "Un code de vérification a été envoyé sur votre téléphone.",
      });

      // Navigate to OTP verification page
      navigate('/verify-otp', { 
        state: { 
          phone: formattedPhone, 
          username: usernameToUse || username,
          from: location.state?.from 
        } 
      });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le code. Veuillez réessayer.",
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
            {step === 'phone' ? 'Connexion par SMS' : 'Créer votre profil'}
          </CardTitle>
          <CardDescription>
            {step === 'phone' 
              ? 'Entrez votre numéro de téléphone pour recevoir un code de vérification'
              : 'Choisissez un nom d\'utilisateur pour créer votre compte'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'phone' ? (
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
                    placeholder="06 12 34 56 78"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
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
          ) : (
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep('phone')}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Nom d'utilisateur
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="votre_nom_utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
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
          )}

          <div className="text-center text-sm text-muted-foreground">
            Vous préférez utiliser un email ?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Connexion classique
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}