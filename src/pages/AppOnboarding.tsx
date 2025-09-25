import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Hash, ArrowRight, Check, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const onboardingSteps = [
  {
    icon: MessageSquare,
    title: "Bienvenue sur KaaySamp",
    description: "Le réseau social made in Sénégal 🇸🇳 pour connecter la diaspora et partager nos cultures",
    emoji: "👋",
  },
  {
    icon: MessageSquare,
    title: "Créez des posts",
    description: "Partagez vos idées, photos et vidéos avec la communauté. Exprimez-vous librement !",
    emoji: "✍️",
  },
  {
    icon: Hash,
    title: "Rejoignez des espaces",
    description: "Découvrez et créez des communautés autour de vos passions : sport, cuisine, tech, culture...",
    emoji: "🌍",
  },
];

export default function AppOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 🔥 MARQUER L'ONBOARDING APP COMME VU
      if (user?.id) {
        const onboardingKey = `app_onboarding_completed_${user.id}`;
        localStorage.setItem(onboardingKey, 'true');
      }
      
      // Rediriger vers l'accueil
      navigate('/', { replace: true });
    }
  };

  const handleSkip = () => {
    // 🔥 MARQUER L'ONBOARDING APP COMME VU
    if (user?.id) {
      const onboardingKey = `app_onboarding_completed_${user.id}`;
      localStorage.setItem(onboardingKey, 'true');
    }
    
    navigate('/', { replace: true });
  };

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-8 pb-6 px-6">
          {/* Logo KaaySamp en haut */}
          <div className="flex justify-center mb-6">
            <img 
              src="/src/assets/kaaysamp-logo.png" 
              alt="KaaySamp" 
              className="h-16 w-16 rounded-full object-cover ring-4 ring-primary/20"
            />
          </div>

          {/* Indicateurs de progression */}
          <div className="flex justify-center gap-2 mb-8">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'w-8 bg-primary' 
                    : index < currentStep
                    ? 'w-2 bg-primary'
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Emoji principal */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-5xl">{step.emoji}</span>
              </div>
              {currentStep === onboardingSteps.length - 1 && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Contenu */}
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {step.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed px-4">
              {step.description}
            </p>
          </div>

          {/* Illustration avec icône */}
          <div className="mb-8 flex justify-center">
            <div className="w-48 h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <Icon className="w-24 h-24 text-primary/40" />
              {currentStep === onboardingSteps.length - 1 && (
                <Sparkles className="absolute top-4 right-4 h-8 w-8 text-yellow-500 animate-pulse" />
              )}
            </div>
          </div>

          {/* Boutons */}
          <div className="space-y-3">
            <Button 
              onClick={handleNext}
              className="w-full h-12 text-lg font-semibold"
            >
              {currentStep === onboardingSteps.length - 1 ? (
                <>
                  C'est parti ! 🚀
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              ) : (
                <>
                  Suivant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            {currentStep < onboardingSteps.length - 1 && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="w-full"
              >
                Passer
              </Button>
            )}
          </div>

          {/* Compteur */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            {currentStep + 1} sur {onboardingSteps.length}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}