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
  signUp: (email: string, password: string, username: string, phone?: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  updateProfile: (data: Partial<Profile>) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const signUp = async (email: string, password: string, username: string, phone?: string) => {
    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username,
            phone
          }
        }
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      setIsLoading(false);
      return {};
    } catch (error: any) {
      setIsLoading(false);
      return { error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message };
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
    signUp,
    signIn,
    signOut,
    isLoading,
    updateProfile
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