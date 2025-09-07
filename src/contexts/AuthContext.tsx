import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  username: string;
  phone: string | null;
  profile_picture_url: string | null;
  bio: string | null;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  created_at: string;
  updated_at: string;
}

interface AuthUser extends User {
  profile?: Profile;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  sendVerificationCode: (phone: string, username: string) => Promise<{ error?: string }>;
  verifyPhoneAndSignUp: (phone: string, code: string, username: string) => Promise<{ error?: string }>;
  signInWithPhone: (phone: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  updateProfile: (data: Partial<Profile>) => Promise<{ error?: string }>;
  verificationStep: 'phone' | 'code' | 'completed';
  setVerificationStep: (step: 'phone' | 'code' | 'completed') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStep, setVerificationStep] = useState<'phone' | 'code' | 'completed'>('phone');
  const [pendingPhone, setPendingPhone] = useState<string>('');
  const [pendingUsername, setPendingUsername] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');

  // Fetch user profile
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetching to avoid deadlock
          setTimeout(async () => {
            const profile = await fetchProfile(session.user.id);
            setUser({
              ...session.user,
              profile: profile || undefined
            });
            setIsLoading(false);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser({
          ...session.user,
          profile: profile || undefined
        });
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const sendVerificationCode = async (phone: string, username: string) => {
    setIsLoading(true);
    
    try {
      // Generate 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(code);
      setPendingPhone(phone);
      setPendingUsername(username);
      
      // Send SMS via our edge function
      const { error } = await supabase.functions.invoke('send-sms-verification', {
        body: { phone, code }
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      setVerificationStep('code');
      setIsLoading(false);
      return {};
    } catch (error: any) {
      setIsLoading(false);
      return { error: error.message };
    }
  };

  const verifyPhoneAndSignUp = async (phone: string, code: string, username: string) => {
    setIsLoading(true);
    
    try {
      if (code !== verificationCode) {
        setIsLoading(false);
        return { error: 'Code de vérification incorrect' };
      }

      // Use phone as email for Supabase auth (temporary workaround)
      const tempEmail = `${phone.replace(/[^0-9]/g, '')}@kaaysamp.temp`;
      const tempPassword = Math.random().toString(36).substring(2, 15);
      
      const { error } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          data: {
            username,
            phone,
            phone_verified: true
          }
        }
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      setVerificationStep('completed');
      setIsLoading(false);
      return {};
    } catch (error: any) {
      setIsLoading(false);
      return { error: error.message };
    }
  };

  const signInWithPhone = async (phone: string) => {
    setIsLoading(true);
    
    try {
      // For existing users, we need to find them by phone and sign them in
      const tempEmail = `${phone.replace(/[^0-9]/g, '')}@kaaysamp.temp`;
      
      // This is a simplified approach - in production you'd want a more robust system
      const { error } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: 'defaultpassword' // You'd need a better system for this
      });

      if (error) {
        setIsLoading(false);
        return { error: 'Numéro de téléphone non trouvé' };
      }

      setIsLoading(false);
      return {};
    } catch (error: any) {
      setIsLoading(false);
      return { error: error.message };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user?.id) {
      return { error: 'No user logged in' };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) {
        return { error: error.message };
      }

      // Update local user state
      if (user.profile) {
        setUser({
          ...user,
          profile: {
            ...user.profile,
            ...data
          } as Profile
        });
      }

      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const value = {
    user,
    session,
    sendVerificationCode,
    verifyPhoneAndSignUp,
    signInWithPhone,
    signOut,
    isLoading,
    updateProfile,
    verificationStep,
    setVerificationStep
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}