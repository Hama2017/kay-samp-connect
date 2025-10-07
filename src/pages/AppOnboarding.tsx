import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, Hash, ArrowRight, Check, Sparkles, Users, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/common/AuthLayout";
import welcomeImage from "@/assets/onboarding-welcome.png";
import postsImage from "@/assets/onboarding-posts.png";
import sampzoneImage from "@/assets/onboarding-sampzone.png";
import newsImage from "@/assets/onboarding-news.png";
import trendingImage from "@/assets/onboarding-trending.png";
import finalImage from "@/assets/onboarding-final.png";

const onboardingSteps = [
  {
    icon: Users,
    title: "Bienvenue sur KaaySamp",
    description: "Envie de parler d'un sujet, débattre ou juste suivre toute l'actualité du Sénégal ? Loy khar kay gñu SAMP  😎 ",
  },
  {
    icon: MessageSquare,
    title: "Publiez des posts",
    description: "Tu as une info à partager ou un sujet qui te tient à cœur ? Crée ton post et fais-nous savoir ce que tu en penses !",
  },
  {
    icon: Users,
    title: "SAMP Zone",
    description: "Crée ou rejoins une SAMP Zone ! Ce sont des espaces communautaires autour de sujets qui te passionnent : football, séries, sport... Discute avec ceux qui partagent tes intérêts !",
  },
  {
    icon: Sparkles,
    title: "Ne rate plus rien",
    description: "Suis toute l'actualité du Sénégal en temps réel ! Commente, fais remonter les infos qui te plaisent ou descends celles qui t'intéressent moins. Tu peux même samper une info précise pour ne rien manquer. Alors loy khar ? Sampal gaw !",
  },
  {
    icon: Sparkles,
    title: "Découvre ce qui buzz",
    description: "Explore les sujets qui font le buzz, les SAMP Zones les plus animées et les créateurs les plus influents. Tout ce qui compte, regroupé au même endroit. Loy khar kay ?",
  },
  {
    icon: Check,
    title: "Rangg mou gaw",
    description: "Alors loy khar kay nio far nio samp ? Amoul arrêt, rang mooy gaw !",
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

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
            ) : currentStep === 1 ? (
              <div className="flex justify-center mb-2">
                <img 
                  src={postsImage} 
                  alt="Publiez des posts" 
                  className="w-64 h-64 object-contain"
                />
              </div>
            ) : currentStep === 2 ? (
              <div className="flex justify-center mb-2">
                <img 
                  src={sampzoneImage} 
                  alt="SAMP Zone" 
                  className="w-64 h-64 object-contain"
                />
              </div>
            ) : currentStep === 3 ? (
              <div className="flex justify-center mb-2">
                <img 
                  src={newsImage} 
                  alt="Ne rate plus rien" 
                  className="w-64 h-64 object-contain"
                />
              </div>
            ) : currentStep === 4 ? (
              <div className="flex justify-center mb-2">
                <img 
                  src={trendingImage} 
                  alt="Découvre ce qui buzz" 
                  className="w-64 h-64 object-contain"
                />
              </div>
            ) : currentStep === 5 ? (
              <div className="flex justify-center mb-2">
                <img 
                  src={finalImage} 
                  alt="Rangg mou gaw" 
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
            {currentStep > 0 && (
              <Button 
                onClick={handleBack}
                variant="outline"
                className="w-full h-14 text-base font-semibold"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Retour
              </Button>
            )}
            
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