import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PhoneInput } from 'react-international-phone';
import { AuthLayout } from "@/components/common/AuthLayout";
import { LoadingButton } from "@/components/common/LoadingButton";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { Button } from "@/components/ui/button";
import 'react-international-phone/style.css';

export default function Login() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim()) {
      setError("Veuillez entrer votre numéro de téléphone.");
      return;
    }

    if (!phone.startsWith('+') || phone.length < 10) {
      setError("Numéro invalide. Utilisez le sélecteur de pays.");
      return;
    }

    setIsLoading(true);

    try {
      console.log('📱 [Login] Vérification si le compte existe:', phone);

      // Vérifier si le numéro a un compte
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, phone')
        .eq('phone', phone)
        .maybeSingle();

      console.log('👤 [Login] Profil trouvé:', !!profile);

      if (!profile) {
        setError("Aucun compte associé à ce numéro. Créez un compte d'abord.");
        setIsLoading(false);
        return;
      }

      // Envoyer l'OTP
      console.log('📱 [Login] Envoi OTP');
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
      });

      if (error) {
        console.error('❌ [Login] Erreur:', error);
        throw error;
      }

      console.log('✅ [Login] OTP envoyé');

      navigate('/verify-otp-login', {
        state: { phone }
      });
    } catch (error: any) {
      console.error('❌ [Login] Erreur:', error);
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
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Connexion" 
      subtitle="Entrez votre numéro pour vous connecter"
    >
      <Card className="border-2 backdrop-blur-sm bg-card/50 shadow-2xl">
        <CardContent className="pt-6 space-y-6">
          <ErrorAlert message={error} className="animate-scale-in" />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <PhoneInput 
                defaultCountry="sn" 
                value={phone} 
                onChange={value => {
                  setPhone(value);
                  setError(null);
                }} 
                disabled={isLoading} 
                placeholder="Entrez votre numéro" 
                inputClassName="!w-full !h-14 !text-base !text-foreground !bg-background !border-input !rounded-r-lg !transition-all !duration-200 focus:!ring-2 focus:!ring-primary focus:!border-primary placeholder:!text-muted-foreground" 
                countrySelectorStyleProps={{
                  buttonClassName: "!h-14 !border-input !rounded-l-lg !bg-background hover:!bg-accent !transition-all !duration-200",
                  buttonContentWrapperClassName: "!p-2"
                }} 
              />
            </div>

            <LoadingButton 
              type="submit" 
              className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
              disabled={!phone}
              isLoading={isLoading}
              loadingText="Vérification..."
            >
              Connexion
              <ArrowRight className="ml-2 h-5 w-5" />
            </LoadingButton>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => navigate('/auth')}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
