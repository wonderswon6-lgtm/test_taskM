'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// This is a placeholder user type. You can expand it with more user details.
interface User {
  id: string;
  email: string | undefined;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  signup: (email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  // Add social login placeholders
  loginWithGoogle: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  loginWithGoogle: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // In a real app, you'd check for an existing session here (e.g., from localStorage or a cookie)
  useEffect(() => {
    // Placeholder: Check for a user session.
    // Replace this with your actual Supabase session logic.
    const checkUser = async () => {
      setLoading(true);
      // const { data: { session } } = await supabase.auth.getSession();
      // if (session) {
      //   setUser({ id: session.user.id, email: session.user.email });
      // } else {
      //   setUser(null);
      // }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email?: string, password?: string) => {
    setLoading(true);
    // Placeholder: Replace with your Supabase login logic
    console.log('Logging in with:', email, password);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    const mockUser = { id: '123', email: email, avatarUrl: `https://i.pravatar.cc/150?u=${email}` };
    setUser(mockUser);
    setLoading(false);
    router.push('/dashboard');
  };

  const signup = async (email?: string, password?: string) => {
    setLoading(true);
    // Placeholder: Replace with your Supabase signup logic
    console.log('Signing up with:', email, password);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    const mockUser = { id: '123', email: email, avatarUrl: `https://i.pravatar.cc/150?u=${email}` };
    setUser(mockUser);
    setLoading(false);
    router.push('/dashboard');
  };
  
  const loginWithGoogle = async () => {
    setLoading(true);
    // Placeholder: Replace with your Supabase Google login logic
    console.log('Logging in with Google');
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockUser = { id: '456', email: 'googleuser@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=google' };
    setUser(mockUser);
    setLoading(false);
    router.push('/dashboard');
  };

  const logout = async () => {
    setLoading(true);
    // Placeholder: Replace with your Supabase logout logic
    console.log('Logging out');
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    setLoading(false);
    router.push('/login');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
