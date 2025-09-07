import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    verificationCode: ""
  });
  
  const { sendVerificationCode, verifyPhoneAndSignUp, isLoading, verificationStep, setVerificationStep } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validatePhoneForm = () => {
    if (!formData.username.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom d'utilisateur est requis",
        variant: "destructive",
      });
      return false;
    }
    
    if (formData.username.length < 3) {
      toast({
        title: "Erreur", 
        description: "Le nom d'utilisateur doit contenir au moins 3 caractères",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Erreur",
        description: "Le numéro de téléphone est requis",
        variant: "destructive",
      });
      return false;
    }

    if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ''))) {
      toast({
        title: "Erreur",
        description: "Le numéro de téléphone n'est pas valide",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const validateCodeForm = () => {
    if (!formData.verificationCode || formData.verificationCode.length !== 6) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir le code de vérification à 6 chiffres",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhoneForm()) return;

    const { error } = await sendVerificationCode(formData.phone, formData.username);
    
    if (!error) {
      toast({
        title: "Code envoyé !",
        description: "Vérifiez votre téléphone pour le code de vérification",
      });
    } else {
      toast({
        title: "Erreur d'envoi",
        description: error,
        variant: "destructive",
      });
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCodeForm()) return;

    const { error } = await verifyPhoneAndSignUp(formData.phone, formData.verificationCode, formData.username);
    
    if (!error) {
      toast({
        title: "Inscription réussie !",
        description: "Votre compte a été créé avec succès",
      });
      navigate("/");
    } else {
      toast({
        title: "Erreur de vérification",
        description: error,
        variant: "destructive",
      });
    }
  };

  const handleBackToPhone = () => {
    setVerificationStep('phone');
    setFormData(prev => ({ ...prev, verificationCode: '' }));
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
            Créer un compte
          </CardTitle>
          <CardDescription>
            Rejoignez la communauté KaaySamp
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {verificationStep === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  Nom d'utilisateur
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="votreusername"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                />
              </div>

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
                  "Envoyer le code de vérification"
                )}
              </Button>
            </form>
          )}

          {verificationStep === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="verificationCode" className="text-sm font-medium text-foreground">
                  Code de vérification
                </label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={formData.verificationCode}
                  onChange={(e) => handleInputChange('verificationCode', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Un code à 6 chiffres a été envoyé au {formData.phone}
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleBackToPhone}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
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
                    "Vérifier et créer le compte"
                  )}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Vous avez déjà un compte ?{" "}
              <Link 
                to="/login" 
                className="text-primary hover:underline font-medium"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}