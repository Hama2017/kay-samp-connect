import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, User, MessageCircle, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PhoneInput } from 'react-international-phone';
import { AuthLayout } from "@/components/common/AuthLayout";
import { LoadingButton } from "@/components/common/LoadingButton";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import 'react-international-phone/style.css';

const STEPS = [
  { 
    id: 'username', 
    title: 'Choisissez votre nom d\'utilisateur',
    icon: User,
    description: 'Ce sera votre identifiant unique sur KaaySamp'
  },
  { 
    id: 'fullname', 
    title: 'Quel est votre nom complet ?',
    icon: User,
    description: 'Votre nom et prénom'
  },
  { 
    id: 'bio', 
    title: 'Parlez-nous de vous',
    icon: MessageCircle,
    description: 'Une petite description (optionnel)'
  },
  { 
    id: 'phone', 
    title: 'Votre numéro de téléphone',
    icon: Phone,
    description: 'Nous allons vérifier votre numéro'
  }
];

export default function SignUp() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    bio: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const step = STEPS[currentStep];
  const Icon = step.icon;

  const handleNext = async () => {
    setError(null);

    // Validation selon l'étape
    if (currentStep === 0) {
      if (!formData.username.trim()) {
        setError("Le nom d'utilisateur est requis.");
        return;
      }
      if (formData.username.length < 3) {
        setError("Le nom d'utilisateur doit faire au moins 3 caractères.");
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        setError("Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscore.");
        return;
      }

      // Vérifier si le username existe déjà
      setIsLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', formData.username)
        .maybeSingle();

      setIsLoading(false);

      if (data) {
        setError("Ce nom d'utilisateur est déjà pris.");
        return;
      }
    }

    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        setError("Le nom complet est requis.");
        return;
      }
    }

    if (currentStep === 3) {
      if (!formData.phone.trim()) {
        setError("Le numéro de téléphone est requis.");
        return;
      }
      if (!formData.phone.startsWith('+') || formData.phone.length < 10) {
        setError("Numéro invalide. Utilisez le sélecteur de pays.");
        return;
      }

      // Vérifier si le numéro existe déjà
      setIsLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('phone')
        .eq('phone', formData.phone)
        .maybeSingle();

      if (data) {
        setError("Ce numéro est déjà associé à un compte. Connectez-vous.");
        setIsLoading(false);
        return;
      }

      // Envoyer OTP
      try {
        const { error } = await supabase.auth.signInWithOtp({
          phone: formData.phone,
        });

        if (error) throw error;

        console.log('✅ [SignUp] OTP envoyé');

        // Passer à la vérification OTP
        navigate('/verify-otp-signup', {
          state: {
            phone: formData.phone,
            username: formData.username,
            fullName: formData.fullName,
            bio: formData.bio
          }
        });
      } catch (error: any) {
        console.error('❌ [SignUp] Erreur:', error);
        setError("Impossible d'envoyer le code. Réessayez.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Passer à l'étape suivante
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    } else {
      navigate('/auth');
    }
  };

  return (
    <AuthLayout showLogo={false}>
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-6">
          {/* Indicateurs de progression */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'w-12 bg-primary' 
                    : index < currentStep
                    ? 'w-8 bg-primary/60'
                    : 'w-8 bg-border'
                }`}
              />
            ))}
          </div>

          {/* Icône et titre */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">
                {step.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <ErrorAlert message={error} className="animate-scale-in" />

          {/* Étape 1: Username */}
          {currentStep === 0 && (
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="ex: sampeur_221"
                className="h-14 text-base"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Étape 2: Full Name */}
          {currentStep === 1 && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="ex: Moussa Diop"
                className="h-14 text-base"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Étape 3: Bio */}
          {currentStep === 2 && (
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optionnel)</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Parlez-nous de vous..."
                className="min-h-32 text-base resize-none"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Étape 4: Phone */}
          {currentStep === 3 && (
            <div className="space-y-2">
              <Label>Numéro de téléphone</Label>
              <PhoneInput 
                defaultCountry="sn" 
                value={formData.phone} 
                onChange={value => {
                  setFormData({ ...formData, phone: value });
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
          )}

          {/* Boutons */}
          <div className="space-y-3">
            <Button 
              onClick={handleBack}
              variant="outline"
              className="w-full h-14 text-base font-semibold"
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </Button>
            
            <LoadingButton 
              onClick={handleNext}
              className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              isLoading={isLoading}
              loadingText={currentStep === 3 ? "Envoi..." : "Vérification..."}
            >
              {currentStep === 3 ? 'Envoyer le code' : 'Suivant'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </LoadingButton>
          </div>

          {/* Compteur */}
          <p className="text-center text-xs text-muted-foreground">
            Étape {currentStep + 1} sur {STEPS.length}
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
