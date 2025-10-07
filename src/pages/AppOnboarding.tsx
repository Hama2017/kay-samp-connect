import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, Hash, ArrowRight, Check, Sparkles, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/common/AuthLayout";
import welcomeImage from "@/assets/onboarding-welcome.png";

const onboardingSteps = [
  {
    icon: Users,
    title: "Bienvenue sur KaaySamp",
    description: "Connectez-vous avec la diaspora sénégalaise et découvrez l'actualité qui vous ressemble",
  },
  {
    icon: MessageSquare,
    title: "Partagez votre quotidien",
    description: "Publiez des photos, vidéos, GIFs et vos pensées. Utilisez les hashtags pour toucher plus de monde",
  },
  {
    icon: Hash,
    title: "Explorez les espaces",
    description: "Rejoignez des communautés thématiques : Sport, Tech, Culture, Cuisine et bien plus encore",
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
      if (user?.id) {
        const onboardingKey = `app_onboarding_completed_${user.id}`;
        localStorage.setItem(onboardingKey, 'true');
      }
      navigate('/', { replace: true });
    }
  };

  const handleSkip = () => {
    if (user?.id) {
      const onboardingKey = `app_onboarding_completed_${user.id}`;
      localStorage.setItem(onboardingKey, 'true');
    }
    navigate('/', { replace: true });
  };

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;

  return (
    <AuthLayout showLogo={false}>
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-6">
          {/* Indicateurs de progression */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {onboardingSteps.map((_, index) => (
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
            {currentStep === 0 ? (
              <div className="flex justify-center mb-2">
                <img 
                  src={welcomeImage} 
                  alt="Bienvenue" 
                  className="w-64 h-64 object-contain"
                />
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-10 h-10 text-primary" />
                  </div>
                  {currentStep === onboardingSteps.length - 1 && (
                    <div className="absolute -top-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">
                {step.title}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground px-4">
                {step.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Boutons */}
          <div className="space-y-3">
            <Button 
              onClick={handleNext}
              className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              {currentStep === onboardingSteps.length - 1 ? 'Commencer' : 'Suivant'}
              <ArrowRight className="ml-2 h-5 w-5" />
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
          <p className="text-center text-xs text-muted-foreground">
            Étape {currentStep + 1} sur {onboardingSteps.length}
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}