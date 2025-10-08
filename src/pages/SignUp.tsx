import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/common/LoadingButton';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { AuthLayout } from '@/components/common/AuthLayout';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { supabase } from '@/integrations/supabase/client';
import { Phone, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SignUp() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone || phone.length < 10) {
      setError('Numéro de téléphone invalide');
      return;
    }

    setIsLoading(true);

    try {
      console.log('📱 [SignUp] Vérification téléphone:', phone);
      const { data: existingPhone } = await supabase
        .from('profiles')
        .select('phone')
        .eq('phone', phone)
        .maybeSingle();

      if (existingPhone) {
        setError('Ce numéro est déjà associé à un compte. Connectez-vous plutôt.');
        setIsLoading(false);
        return;
      }

      console.log('📤 [SignUp] Envoi OTP...');
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: phone
      });

      if (otpError) {
        console.error('❌ [SignUp] Erreur OTP:', otpError);
        if (otpError.message.includes('rate limit')) {
          setError('Trop de tentatives. Veuillez réessayer dans quelques minutes.');
        } else {
          setError('Erreur lors de l\'envoi du code. Veuillez réessayer.');
        }
        setIsLoading(false);
        return;
      }

      console.log('✅ [SignUp] OTP envoyé, redirection vers vérification');
      navigate('/verify-otp-signup', { state: { phone } });
    } catch (err) {
      console.error('❌ [SignUp] Erreur:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Créer un compte</CardTitle>
              <CardDescription>Entre ton numéro de téléphone pour commencer</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ErrorAlert message={error} />

            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <PhoneInput
                defaultCountry="sn"
                value={phone}
                onChange={setPhone}
                disabled={isLoading}
                inputClassName="w-full"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/auth')}
                disabled={isLoading}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Retour
              </Button>
              
              <LoadingButton
                type="submit"
                isLoading={isLoading}
                loadingText="Envoi..."
                className="flex-1"
              >
                Continuer
              </LoadingButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}