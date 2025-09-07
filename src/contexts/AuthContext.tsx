import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  phone: string;
  profilePicture?: string;
  isVerified: boolean;
  bio?: string;
  followersCount: number;
  followingCount: number;
  joinDate: string;
}

interface AuthContextType {
  user: User | null;
  login: (phone: string, password: string) => Promise<boolean>;
  register: (username: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const mockUsers: User[] = [
  {
    id: "1",
    username: "AmadouD",
    phone: "+221771234567",
    isVerified: false,
    followersCount: 156,
    followingCount: 89,
    joinDate: "2024-01-15",
    bio: "Passionné de football sénégalais 🦁⚽"
  },
  {
    id: "2", 
    username: "FatimaK",
    phone: "+221781234567",
    isVerified: true,
    followersCount: 342,
    followingCount: 127,
    joinDate: "2023-11-20",
    bio: "Chef cuisinière - Spécialiste de la cuisine traditionnelle sénégalaise"
  },
  {
    id: "3",
    username: "OmarB", 
    phone: "+221791234567",
    isVerified: false,
    followersCount: 98,
    followingCount: 67,
    joinDate: "2024-02-08",
    bio: "Développeur Tech à Dakar 💻"
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('kaaysamp_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user by phone
    const foundUser = mockUsers.find(u => u.phone === phone);
    
    if (foundUser && password.length >= 6) { // Simple password validation
      setUser(foundUser);
      localStorage.setItem('kaaysamp_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (username: string, phone: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.phone === phone || u.username === username);
    
    if (!existingUser && password.length >= 6) {
      const newUser: User = {
        id: String(mockUsers.length + 1),
        username,
        phone,
        isVerified: false,
        followersCount: 0,
        followingCount: 0,
        joinDate: new Date().toISOString().split('T')[0],
        bio: ""
      };
      
      mockUsers.push(newUser);
      setUser(newUser);
      localStorage.setItem('kaaysamp_user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kaaysamp_user');
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('kaaysamp_user', JSON.stringify(updatedUser));
      
      // Update in mock database
      const userIndex = mockUsers.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = updatedUser;
      }
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
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

export { mockUsers };