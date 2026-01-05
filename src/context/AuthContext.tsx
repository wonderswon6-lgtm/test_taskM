'use client';

import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
  getRedirectResult,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useFirebase, useUser } from '@/firebase';

interface User {
  id: string;
  email: string | null;
  avatarUrl?: string;
  displayName?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  signup: (email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  return useContext(AuthContext);
};

const formatUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    avatarUrl: firebaseUser.photoURL || undefined,
    displayName: firebaseUser.displayName,
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
  const firestore = firebaseContext?.firestore;

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

    const isAuthPage =
      pathname === '/login' || pathname === '/signup' || pathname === '/';
    const isProtectedRoute = pathname.startsWith('/dashboard');

    if (user && isAuthPage) {
      router.push('/dashboard');
    } else if (!user && isProtectedRoute) {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  useEffect(() => {
    const handleRedirectResult = async () => {
      if (auth && firestore) {
        try {
          const result = await getRedirectResult(auth);
          if (result) {
            setLoading(true);
            const userRef = doc(firestore, 'users', result.user.uid);
            await setDoc(
              userRef,
              {
                id: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                avatarUrl: result.user.photoURL,
              },
              { merge: true }
            );
            // Manually format and set user to trigger redirect faster
            setUser(formatUser(result.user));
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error getting redirect result', error);
        } finally {
           setLoading(false);
        }
      }
    };
    handleRedirectResult();
  }, [auth, firestore, router]);

  const login = async (email?: string, password?: string) => {
    if (!auth || !email || !password) {
      throw new Error('Auth service not available or email/password missing.');
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email?: string, password?: string) => {
    if (!auth || !email || !password || !firestore) {
      throw new Error(
        'Auth service, Firestore, or email/password missing.'
      );
    }
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create a user profile in Firestore
    const userRef = doc(firestore, 'users', user.uid);
    const displayName = user.email?.split('@')[0] || 'New User';
    await setDoc(userRef, {
      id: user.uid,
      email: user.email,
      displayName: displayName,
    });

    // Also update the auth profile
    await updateProfile(user, {
        displayName: displayName,
    });
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
    setUser(null);
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
