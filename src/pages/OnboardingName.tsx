import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function OnboardingName() {
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { userId } = location.state || {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!fullName.trim()) {
      setError("Entrez votre nom");
      return;
    }

    if (fullName.trim().length < 2) {
      setError("Nom trop court (min 2 caractères)");
      return;
    }

    if (fullName.length > 50) {
      setError("Nom trop long (max 50 caractères)");
      return;
    }

    if (!userId) {
      setError("Session invalide");
      return;
    }

    setIsLoading(true);

    try {
      // 🔥 SAUVEGARDER LE NOM COMPLET
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      console.log('✅ Nom complet sauvegardé:', fullName);

      // 🔥 PASSER À L'ÉTAPE 2: USERNAME
      navigate('/onboarding/username', { 
        replace: true,
        state: { 
          userId,
          fullName: fullName.trim()
        }
      });

    } catch (error: any) {
      console.error('Erreur:', error);
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <img 
                src="/src/assets/kaaysamp-logo.png" 
                alt="KaaySamp" 
                className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/20"
              />
              <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">
              Comment vous appelez-vous ?
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Votre nom complet (visible sur votre profil)
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Mamadou Diallo 🇸🇳"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setError(null);
                }}
                className="h-14 text-lg text-center"
                disabled={isLoading}
                autoFocus
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground text-center">
                Utilisez votre vrai nom, un surnom ou même des emojis ! 🎨✨
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold" 
              disabled={isLoading || !fullName.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Suivant...
                </>
              ) : (
                <>
                  Suivant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Étape 1/2 • Vous pourrez le modifier plus tard
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}