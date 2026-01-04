'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
  getRedirectResult,
} from 'firebase/auth';
import { useFirebase, useUser } from '@/firebase';

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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  return useContext(AuthContext);
};

const formatUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    avatarUrl: firebaseUser.photoURL || undefined,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const firebaseContext = useFirebase();
  const { user: firebaseUser, isUserLoading } = useUser();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();
  
  const auth = firebaseContext?.auth;

  useEffect(() => {
    setLoading(isUserLoading);
    if (firebaseUser) {
      setUser(formatUser(firebaseUser));
    } else {
      setUser(null);
    }
  }, [firebaseUser, isUserLoading]);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/';
    const isProtectedRoute = pathname.startsWith('/dashboard');

    if (user && isAuthPage) {
      router.push('/dashboard');
    } else if (!user && isProtectedRoute) {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  useEffect(() => {
    const handleRedirectResult = async () => {
      if(auth) {
        try {
          setLoading(true);
          await getRedirectResult(auth);
        } catch (error) {
          console.error("Error getting redirect result", error);
        } finally {
          // The onAuthStateChanged listener will handle setting the final loading state.
        }
      }
    };
    handleRedirectResult();
  }, [auth]);


  const login = async (email?: string, password?: string) => {
    if (!auth || !email || !password) {
      throw new Error('Auth service not available or email/password missing.');
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email?: string, password?: string) => {
    if (!auth || !email || !password) {
      throw new Error('Auth service not available or email/password missing.');
    }
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    if (!auth) {
      throw new Error('Auth service not available.');
    }
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const logout = async () => {
    if (!auth) {
      throw new Error('Auth service not available.');
    }
    await signOut(auth);
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
