'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  Auth,
  User as FirebaseUser,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { useFirebase } from '@/firebase';

interface User {
  id: string;
  email: string | null;
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

const formatUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    avatarUrl: firebaseUser.photoURL || undefined,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { auth, user: firebaseUser, isUserLoading } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(isUserLoading);
    if (firebaseUser) {
      const formattedUser = formatUser(firebaseUser);
      setUser(formattedUser);
      if (router) {
         const currentPath = window.location.pathname;
         if (currentPath === '/login' || currentPath === '/signup' || currentPath === '/') {
            router.push('/dashboard');
         }
      }
    } else {
      setUser(null);
      const protectedRoutes = ['/dashboard', '/dashboard/list'];
      if (protectedRoutes.some(path => window.location.pathname.startsWith(path))) {
          router.push('/login');
      }
    }
  }, [firebaseUser, isUserLoading, router]);

  const login = async (email?: string, password?: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signup = async (email?: string, password?: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      setLoading(false);
      throw error;
    }
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
