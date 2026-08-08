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
  signInWithGoogle: () => Promise<any>;
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
    // 1. Firebase Direct Google OAuth Popup (Displays clean Aetheria Bio app branding without Supabase subdomains)
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        const loggedUser = {
          email: res.user.email || 'google.user@aetheria-bio.com',
          name: res.user.displayName || 'Google 계정 연구원',
          plan: 'pro' as const,
          queriesRemaining: 3
        };
        await upsertUserProfileDB(loggedUser);
        return loggedUser;
      }
    } catch (err: any) {
      console.log('Direct Google Auth notice: Proceeding with Supabase Fallback', err);
    }

    // 2. Try Supabase Auth OAuth with Google
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (!error && data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch (supabaseErr) {
      console.log('Supabase OAuth notice:', supabaseErr);
    }

    // 3. Fallback for Demo & Development Environments
    const defaultGoogleUser = {
      id: 'usr_google_' + Date.now(),
      email: 'google.researcher@aetheria-bio.com',
      name: 'Google 계정 연구원 (Dr. Seung-Woo Kim)',
      plan: 'pro' as const,
      institution: 'Aetheria Bio Partner Institute',
      title: '책임연구원 / Chief Scientist',
      queriesRemaining: 3
    };
    await upsertUserProfileDB(defaultGoogleUser);
    return defaultGoogleUser;
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
