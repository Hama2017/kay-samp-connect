import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [formData, setFormData] = useState({
    phone: "",
    otpCode: ""
  });
  
  const { sendOTP, verifyOTP, isLoading, otpStep, setOtpStep, pendingPhone } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/";

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre numéro de téléphone",
        variant: "destructive",
      });
      return;
    }

    const { error } = await sendOTP(formData.phone, false);
    
    if (!error) {
      toast({
        title: "Code OTP envoyé !",
        description: "Vérifiez votre téléphone pour recevoir le code OTP",
      });
    } else {
      toast({
        title: "Erreur d'envoi",
        description: error,
        variant: "destructive",
      });
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.otpCode || formData.otpCode.length !== 6) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir le code OTP à 6 chiffres",
        variant: "destructive",
      });
      return;
    }

    const { error } = await verifyOTP(formData.phone, formData.otpCode, false);
    
    if (!error) {
      toast({
        title: "Connexion réussie !",
        description: "Bienvenue sur KaaySamp",
      });
      navigate(from, { replace: true });
    } else {
      toast({
        title: "Erreur de connexion",
        description: error,
        variant: "destructive",
      });
    }
  };

  const handleBackToPhone = () => {
    setOtpStep('phone');
    setFormData(prev => ({ ...prev, otpCode: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/src/assets/kaaysamp-logo.jpg" 
              alt="KaaySamp" 
              className="h-16 w-16 rounded-full object-cover"
            />
          </div>
          <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
            Connexion
          </CardTitle>
          <CardDescription>
            Connectez-vous à votre compte KaaySamp
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {otpStep === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Numéro de téléphone
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+221 77 123 45 67"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
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
                    Envoi du code...
                  </>
                ) : (
                  "Envoyer le code OTP"
                )}
              </Button>
            </form>
          )}

          {otpStep === 'code' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="otpCode" className="text-sm font-medium text-foreground">
                  Code OTP
                </label>
                <Input
                  id="otpCode"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={formData.otpCode}
                  onChange={(e) => handleInputChange('otpCode', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Un code OTP à 6 chiffres a été envoyé au {pendingPhone || formData.phone}
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleBackToPhone}
                  disabled={isLoading}
                >
                  Retour
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Vous n'avez pas de compte ?{" "}
              <Link 
                to="/register" 
                className="text-primary hover:underline font-medium"
              >
                Créer un compte
              </Link>
            </p>
          </div>

          <div className="bg-muted/50 border rounded-lg p-4">
            <h3 className="font-medium text-sm mb-2">Authentification par téléphone :</h3>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Créez d'abord votre compte avec votre numéro de téléphone</p>
              <p>Puis connectez-vous avec le même numéro</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}