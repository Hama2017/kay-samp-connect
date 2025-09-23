import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to auth page with return url
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user needs onboarding (skip for onboarding pages)
  if (!location.pathname.startsWith('/onboarding')) {
    const userOnboardingKey = `onboarding_completed_${user.id}`;
    const hasCompletedOnboarding = localStorage.getItem(userOnboardingKey) === 'true' || 
                                 localStorage.getItem('onboarding_completed') === 'true';
    
    if (!hasCompletedOnboarding) {
      return <Navigate to="/onboarding/name" replace />;
    }
  }

  return <>{children}</>;
}