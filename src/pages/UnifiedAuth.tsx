import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/common/AuthLayout";
export default function UnifiedAuth() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <AuthLayout 
      title="KaaySamp" 
      subtitle="Rejoins-nous pour suivre l'actualité, discuter et débattre."
    >
      <Card className="border-2 backdrop-blur-sm bg-card/50 shadow-2xl">
        <CardContent className="pt-8 space-y-5">
          <Button 
            onClick={handleLogin}
            className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            size="lg"
          >
            Connexion
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <Button 
            onClick={handleSignup}
            variant="outline"
            className="w-full h-14 text-base font-semibold border-2 transition-all duration-300 hover:scale-[1.02]"
            size="lg"
          >
            Créer un compte
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}