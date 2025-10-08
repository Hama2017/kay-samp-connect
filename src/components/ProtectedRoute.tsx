import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log('🛡️ [ProtectedRoute] Vérification:', {
    path: location.pathname,
    isLoading,
    hasUser: !!user,
    userId: user?.id,
    hasProfile: !!user?.profile,
    username: user?.profile?.username,
    full_name: user?.profile?.full_name
  });

  if (isLoading) {
    console.log('⏳ [ProtectedRoute] En cours de chargement...');
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
    console.log('❌ [ProtectedRoute] Pas d\'utilisateur → redirection vers /auth');
    // Redirect to auth page with return url
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user needs to complete profile (skip for auth/onboarding/profile-completion pages)
  const skipProfileCheck = location.pathname.startsWith('/signup') || 
                           location.pathname.startsWith('/app-onboarding') ||
                           location.pathname.startsWith('/profile-completion') ||
                           location.pathname.startsWith('/verify-otp');
  
  if (!skipProfileCheck) {
    if (!user.profile?.is_profile_completed) {
      console.log('🔄 [ProtectedRoute] Profil incomplet → redirection vers /profile-completion');
      return <Navigate to="/profile-completion" state={{ userId: user.id }} replace />;
    }
  }

  console.log('✅ [ProtectedRoute] Accès autorisé');
  return <>{children}</>;
}