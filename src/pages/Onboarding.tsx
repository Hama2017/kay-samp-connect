import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import step1Image from '@/assets/onboarding-step1.jpg';
import step2Image from '@/assets/onboarding-step2.jpg';
import step3Image from '@/assets/onboarding-step3.jpg';

const onboardingSteps = [
  {
    id: 1,
    image: step1Image,
    title: "Connectez-vous avec votre communauté",
    description: "Partagez vos pensées, commentez et likez les publications de vos amis. Créez des liens authentiques avec des personnes qui partagent vos passions."
  },
  {
    id: 2,
    image: step2Image,
    title: "Découvrez des espaces uniques",
    description: "Rejoignez ou créez des espaces thématiques pour discuter de vos sujets favoris. Chaque espace a sa communauté et ses règles."
  },
  {
    id: 3,
    image: step3Image,
    title: "Personnalisez votre expérience",
    description: "Sauvegardez vos contenus préférés, suivez les tendances qui vous intéressent et customisez votre profil pour vous démarquer."
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Rediriger si pas d'utilisateur connecté
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Marquer l'onboarding comme terminé et rediriger vers l'accueil
      localStorage.setItem('onboarding_completed', 'true');
      navigate('/');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/');
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto shadow-xl">
        <CardContent className="p-8">
          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentStep 
                      ? 'bg-primary' 
                      : index < currentStep 
                        ? 'bg-primary/60' 
                        : 'bg-muted-foreground/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-6">
            {/* Image */}
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <img 
                src={currentStepData.image} 
                alt={currentStepData.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-foreground">
              {currentStepData.title}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-8">
            {/* Previous button */}
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>

            {/* Skip button */}
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Passer
            </Button>

            {/* Next/Finish button */}
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {currentStep === onboardingSteps.length - 1 ? 'Terminer' : 'Suivant'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Step counter */}
          <div className="text-center mt-4 text-sm text-muted-foreground">
            {currentStep + 1} sur {onboardingSteps.length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}