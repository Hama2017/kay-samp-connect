import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useOnboarding = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkOnboardingStatus = () => {
      if (!user) {
        setHasCompletedOnboarding(null);
        setIsLoading(false);
        return;
      }

      // Vérifier dans localStorage si l'utilisateur a terminé l'onboarding
      const onboardingCompleted = localStorage.getItem('onboarding_completed');
      const userOnboardingKey = `onboarding_completed_${user.id}`;
      const userSpecificOnboarding = localStorage.getItem(userOnboardingKey);

      if (onboardingCompleted === 'true' || userSpecificOnboarding === 'true') {
        setHasCompletedOnboarding(true);
      } else {
        setHasCompletedOnboarding(false);
      }
      
      setIsLoading(false);
    };

    checkOnboardingStatus();
  }, [user]);

  const markOnboardingComplete = () => {
    if (user) {
      const userOnboardingKey = `onboarding_completed_${user.id}`;
      localStorage.setItem(userOnboardingKey, 'true');
      localStorage.setItem('onboarding_completed', 'true');
      setHasCompletedOnboarding(true);
    }
  };

  const shouldShowOnboarding = () => {
    return user && hasCompletedOnboarding === false;
  };

  return {
    hasCompletedOnboarding,
    isLoading,
    markOnboardingComplete,
    shouldShowOnboarding
  };
};