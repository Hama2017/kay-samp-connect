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

  // Check if user needs profile completion (skip for auth/onboarding pages)
  const skipOnboardingCheck = location.pathname.startsWith('/profile-completion') || 
                              location.pathname.startsWith('/app-onboarding');
  
  if (!skipOnboardingCheck) {
    if (!user.profile?.full_name || user.profile.username?.startsWith('user_')) {
      return <Navigate to="/profile-completion" replace />;
    }
  }

  return <>{children}</>;
}