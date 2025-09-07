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
  sendOTP: (phone: string, isSignUp?: boolean, username?: string) => Promise<{ error?: string }>;
  verifyOTP: (phone: string, code: string, isSignUp?: boolean, username?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  updateProfile: (data: Partial<Profile>) => Promise<{ error?: string }>;
  otpStep: 'phone' | 'code' | 'completed';
  setOtpStep: (step: 'phone' | 'code' | 'completed') => void;
  pendingPhone: string;
  setPendingPhone: (phone: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [otpStep, setOtpStep] = useState<'phone' | 'code' | 'completed'>('phone');
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

  const sendOTP = async (phone: string, isSignUp = false, username?: string) => {
    setIsLoading(true);
    
    try {
      // Generate 6-digit OTP code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(code);
      setPendingPhone(phone);
      if (username) {
        setPendingUsername(username);
      }
      
      // Send SMS via our edge function
      const { error } = await supabase.functions.invoke('send-sms-verification', {
        body: { phone, code }
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      setOtpStep('code');
      setIsLoading(false);
      return {};
    } catch (error: any) {
      setIsLoading(false);
      return { error: error.message };
    }
  };

  const verifyOTP = async (phone: string, code: string, isSignUp = false, username?: string) => {
    setIsLoading(true);
    
    try {
      if (code !== verificationCode) {
        setIsLoading(false);
        return { error: 'Code OTP incorrect' };
      }

      if (isSignUp) {
        // Create new account
        const tempEmail = `${phone.replace(/[^0-9]/g, '')}@kaaysamp.temp`;
        const tempPassword = `pwd_${phone.replace(/[^0-9]/g, '')}_${Date.now()}`;
        
        const { error } = await supabase.auth.signUp({
          email: tempEmail,
          password: tempPassword,
          options: {
            data: {
              username: username || `user_${phone.slice(-4)}`,
              phone,
              phone_verified: true
            }
          }
        });

        if (error) {
          setIsLoading(false);
          return { error: error.message };
        }
      } else {
        // Sign in existing user
        const tempEmail = `${phone.replace(/[^0-9]/g, '')}@kaaysamp.temp`;
        
        // First, try to get the user's stored password from their profile or use a pattern
        const tempPassword = `pwd_${phone.replace(/[^0-9]/g, '')}_*`;
        
        // This is a simplified approach - you'd need a better system in production
        const { error } = await supabase.auth.signInWithPassword({
          email: tempEmail,
          password: tempPassword
        });

        if (error) {
          setIsLoading(false);
          return { error: 'Utilisateur non trouvé. Créez d\'abord un compte.' };
        }
      }

      setOtpStep('completed');
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
    sendOTP,
    verifyOTP,
    signOut,
    isLoading,
    updateProfile,
    otpStep,
    setOtpStep,
    pendingPhone,
    setPendingPhone
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