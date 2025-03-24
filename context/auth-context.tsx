'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { createUserProfile, getUserProfile, updateEmailVerificationStatus, type UserProfile } from '@/lib/db/users';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

/**
 * AuthProvider component that provides authentication state and user profile 
 * to the React component tree. It listens for authentication state changes, 
 * retrieves or creates user profiles, and updates the email verification status.
 * -createUserProfile: to create user profile
 * -getUserProfile: to get user profile
 * -setUserProfile: to set user profile
 * -updateEmailVerificationStatus: to valid the email verification
 * -checkEmailVerification: to check the email verification
 * 
 * @param {Object} props - The props object.
 * @param {React.ReactNode} props.children - The child components to render inside the provider.
 * @returns {JSX.Element} The AuthProvider component that wraps the children with 
 * the authentication context.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          let profile = await getUserProfile(user.uid);
          if (!profile) {
            await createUserProfile(user);
            profile = await getUserProfile(user.uid);
          }
          if (profile && profile.emailVerified !== user.emailVerified) {
            await updateEmailVerificationStatus(user.uid, user.emailVerified);
            profile.emailVerified = user.emailVerified;
          }
          
          setUserProfile(profile);
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const checkEmailVerification = async () => {
      try {
        await user.reload();
        const updatedUser = auth.currentUser;
        
        if (updatedUser && updatedUser.emailVerified && userProfile && !userProfile.emailVerified) {
          await updateEmailVerificationStatus(updatedUser.uid, true);
          setUserProfile(prev => prev ? { ...prev, emailVerified: true } : null);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut de l\'email:', error);
      }
    };

    const interval = setInterval(checkEmailVerification, 10000);

    return () => clearInterval(interval);
  }, [user, userProfile]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access the authentication context values.
 * 
 * @returns {AuthContextType} The authentication context values containing user, 
 * user profile, and loading state.
 */
export const useAuth = () => useContext(AuthContext);