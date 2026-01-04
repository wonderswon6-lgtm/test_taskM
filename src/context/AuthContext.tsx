'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

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

const formatUser = (supabaseUser: SupabaseUser): User => {
    return {
        id: supabaseUser.id,
        email: supabaseUser.email,
        avatarUrl: supabaseUser.user_metadata?.avatar_url
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            setUser(formatUser(session.user));
        }
        setLoading(false);
    }
    
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(formatUser(session.user));
          router.push('/dashboard');
        }
        if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/login');
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  const login = async (email?: string, password?: string) => {
    if (!email || !password) {
        throw new Error("Email and password are required.");
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        setLoading(false);
        throw error;
    }
    // The onAuthStateChange listener will handle setting the user and redirecting
  };

  const signup = async (email?: string, password?: string) => {
    if (!email || !password) {
        throw new Error("Email and password are required.");
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
        }
    });
    if (error) {
        setLoading(false);
        throw error;
    }
    // The onAuthStateChange listener will handle setting the user and redirecting after email confirmation
    alert('Please check your email to confirm your account.');
    setLoading(false);
  };
  
  const loginWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/dashboard`
        }
    });
    if (error) {
        setLoading(false);
        throw error;
    }
    // The onAuthStateChange listener will handle setting the user and redirecting
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
        setLoading(false);
        throw error;
    }
    // The onAuthStateChange listener will handle setting user to null and redirecting
    setLoading(false);
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