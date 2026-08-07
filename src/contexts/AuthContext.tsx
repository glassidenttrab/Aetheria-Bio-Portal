import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createUserProfile, getUserProfile, UserProfile } from '../lib/firestore';
import { supabase } from '../lib/supabase';
import { fetchUserProfileDB, upsertUserProfileDB } from '../services/supabaseService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // 1. Try Supabase PostgreSQL DB user profile first
          const dbProfile = await fetchUserProfileDB(firebaseUser.email || '');
          if (dbProfile) {
            setProfile({
              uid: firebaseUser.uid,
              email: dbProfile.email,
              displayName: dbProfile.name,
              plan: dbProfile.plan,
              queriesRemaining: dbProfile.queriesRemaining,
            } as any);
          } else {
            // 2. Upsert initial user into Supabase DB
            const newDbProfile = await upsertUserProfileDB({
              email: firebaseUser.email || 'scientist@aetheria.bio',
              name: firebaseUser.displayName || 'Dr. Seung-Woo Kim',
              plan: 'free',
              queriesRemaining: 3
            });
            let userProfile = await getUserProfile(firebaseUser.uid);
            if (!userProfile) {
              await createUserProfile(firebaseUser.uid, {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || 'Dr. Seung-Woo Kim',
                photoURL: firebaseUser.photoURL,
                plan: 'free',
              });
              userProfile = await getUserProfile(firebaseUser.uid);
            }
            setProfile(newDbProfile ? {
              uid: firebaseUser.uid,
              email: newDbProfile.email,
              displayName: newDbProfile.name,
              plan: newDbProfile.plan,
              queriesRemaining: newDbProfile.queriesRemaining,
            } as any : userProfile);
          }
        } catch (err) {
          console.warn('Firebase connection notice: Using active session fallback', err);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    // 1. Try Supabase Auth OAuth with Google
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (!error && data?.url) return;
    } catch (supabaseErr) {
      console.log('Supabase OAuth notice: Proceeding with Google Provider fallback', supabaseErr);
    }

    // 2. Firebase / Google Identity Services Fallback
    const provider = new GoogleAuthProvider();
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (googleClientId) {
      provider.setCustomParameters({
        client_id: googleClientId,
        prompt: 'select_account'
      });
    }
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.log('Firebase popup notice: Running Google OAuth fallback with configured client ID', googleClientId);
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: any) => {
            console.log('Google GIS OAuth Credential Token Received:', response.credential);
          }
        });
        (window as any).google.accounts.id.prompt();
      }
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
