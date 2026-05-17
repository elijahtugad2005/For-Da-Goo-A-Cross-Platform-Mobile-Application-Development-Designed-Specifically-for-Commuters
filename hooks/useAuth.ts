import { auth, database, firestore } from '@/config/firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  User as FirebaseUser,
  GoogleAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  sendEmailVerification,
  signInAnonymously,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { ref, remove } from 'firebase/database';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type UserRole = 'student' | 'driver';

export interface User {
  uid: string;
  email: string | null;
  role: UserRole;
  name?: string;
  photoURL?: string | null;
  isAnonymous: boolean;
  provider: 'email' | 'google' | 'anonymous';
  emailVerified: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configure Google Sign-In for mobile
  useEffect(() => {
    if (Platform.OS !== 'web') {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID, // From Firebase Console
        offlineAccess: true,
      });
    }
  }, []);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch their role from database
        const userRole = await getUserRole(firebaseUser.uid);
        const provider = getAuthProvider(firebaseUser);
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: userRole || 'student',
          name: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || null,
          isAnonymous: firebaseUser.isAnonymous,
          provider: provider,
          emailVerified: firebaseUser.emailVerified,
        });
      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string, role: UserRole, name?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      console.log('Verification email sent to:', userCredential.user.email);

      // Save user role and data to Firestore
      await saveUserRole(userCredential.user.uid, role, name, userCredential.user.photoURL, userCredential.user.emailVerified);
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      // Return emailVerified from the fresh credential, not stale state
      return { success: true, emailVerified: credential.user.emailVerified };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Sign in anonymously
  const signInAnonymous = async (role: UserRole) => {
    try {
      console.log('Starting anonymous sign-in...');
      const userCredential = await signInAnonymously(auth);
      console.log('Anonymous sign-in successful, user ID:', userCredential.user.uid);
      
      // Save anonymous user role to Firestore
      try {
        await saveUserRole(userCredential.user.uid, role, undefined, null);
        console.log('User role saved to Firestore');
      } catch (firestoreError: any) {
        console.error('Firestore save error:', firestoreError);
        // Continue even if Firestore save fails - user is still authenticated
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Anonymous sign-in error:', error);
      return { success: false, error: error.message || 'Failed to sign in as guest' };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (role: UserRole) => {
    try {
      const provider = new GoogleAuthProvider();
      
      let userCredential;
      
      if (Platform.OS === 'web') {
        // Web: Use popup
        userCredential = await signInWithPopup(auth, provider);
      } else {
        // Mobile: Use Google Sign-In SDK
        console.log('Starting Google Sign-In for mobile...');
        
        // Check if device supports Google Play Services
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        
        // Get user info from Google
        const response = await GoogleSignin.signIn();
        const idToken = response.type === 'success' ? response.data?.idToken : null;
        
        if (!idToken) {
          throw new Error('No ID token received from Google');
        }
        
        // Create Firebase credential
        const googleCredential = GoogleAuthProvider.credential(idToken);
        
        // Sign in to Firebase with the credential
        userCredential = await signInWithCredential(auth, googleCredential);
        
        console.log('Google Sign-In successful!');
      }
      
      // Save user role and data to Firestore (including Google photo)
      await saveUserRole(
        userCredential.user.uid, 
        role, 
        userCredential.user.displayName || undefined,
        userCredential.user.photoURL
      );
      
      return { success: true };
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      
      let errorMessage = 'Google Sign-In failed';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const currentUserId = auth.currentUser?.uid;
      
      // Clean up presence data before signing out
      if (currentUserId) {
        try {
          const presenceRef = ref(database, `presence/${currentUserId}`);
          await remove(presenceRef);
          console.log('Presence data removed on logout');
        } catch (err) {
          console.log('Could not remove presence on logout:', err);
        }
        
        // Clean up location sharing data
        try {
          const locationRef = ref(database, `sharedLocations/${currentUserId}`);
          await remove(locationRef);
          console.log('Location data removed on logout');
        } catch (err) {
          console.log('Could not remove location on logout:', err);
        }
      }
      
      await auth.signOut();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Link anonymous account with email/password
  const linkWithEmail = async (email: string, password: string, name?: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.isAnonymous) {
        return { success: false, error: 'No anonymous account to link' };
      }

      const credential = EmailAuthProvider.credential(email, password);
      const result = await linkWithCredential(currentUser, credential);
      
      // Update display name
      if (name) {
        await updateProfile(result.user, { displayName: name });
      }
      
      // Update user data in Firestore
      const userRef = doc(firestore, 'users', result.user.uid);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        await updateDoc(userRef, {
          name: name || null,
          email: email,
          photoURL: result.user.photoURL || null,
          linkedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      // Force reload to trigger onAuthStateChanged with updated data
      await result.user.reload();
      
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Failed to link account';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      }
      return { success: false, error: errorMessage };
    }
  };

  // Link anonymous account with Google
  const linkWithGoogle = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.isAnonymous) {
        return { success: false, error: 'No anonymous account to link' };
      }

      const provider = new GoogleAuthProvider();
      
      let result;
      if (Platform.OS === 'web') {
        // Web: Use popup
        const webResult = await signInWithPopup(auth, provider);
        result = await linkWithCredential(currentUser, GoogleAuthProvider.credentialFromResult(webResult)!);
      } else {
        // Mobile: Use Google Sign-In SDK
        console.log('Linking anonymous account with Google...');
        
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        
        const response = await GoogleSignin.signIn();
        const idToken = response.type === 'success' ? response.data?.idToken : null;
        
        if (!idToken) {
          throw new Error('No ID token received from Google');
        }
        
        const googleCredential = GoogleAuthProvider.credential(idToken);
        result = await linkWithCredential(currentUser, googleCredential);
      }

      // Update user data in Firestore
      const userRef = doc(firestore, 'users', result.user.uid);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        await updateDoc(userRef, {
          name: result.user.displayName || null,
          email: result.user.email || null,
          photoURL: result.user.photoURL || null,
          linkedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      await result.user.reload();
      
      return { success: true };
    } catch (error: any) {
      console.error('Link with Google error:', error);
      
      let errorMessage = 'Failed to link with Google';
      if (error.code === 'auth/credential-already-in-use') {
        errorMessage = 'This Google account is already linked to another user';
      }
      return { success: false, error: errorMessage };
    }
  };

  // Resend email verification
  const resendEmailVerification = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser && !currentUser.emailVerified) {
        await sendEmailVerification(currentUser);
        return { success: true };
      } else {
        return { success: false, error: "No user logged in or email already verified." };
      }
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      return { success: false, error: error.message };
    }
  };

  // Legacy login method for backward compatibility
  const login = (email: string, role: UserRole, name?: string) => {
    // This is now handled by signInWithEmail or signUpWithEmail
    console.warn('login() is deprecated. Use signInWithEmail() or signUpWithEmail()');
  };

  return { 
    user, 
    isLoading, 
    signUpWithEmail,
    signInWithEmail,
    signInAnonymous,
    signInWithGoogle,
    linkWithEmail,
    linkWithGoogle,
    signOut,
    resendEmailVerification,
    login // Keep for backward compatibility
  };
}

// Helper function to save user role to Firestore

async function saveUserRole(uid: string, role: UserRole, name?: string, photoURL?: string | null, emailVerified: boolean = false) {
  try {
    const userRef = doc(firestore, 'users', uid);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      const existingData = snapshot.data();
      const existingRole = existingData.role as UserRole | null;

      await updateDoc(userRef, {
        role: existingRole || role,
        name: name ?? existingData.name ?? null,
        photoURL: photoURL ?? existingData.photoURL ?? null,
        updatedAt: serverTimestamp(),
        emailVerified: emailVerified
      });

      console.log('User role updated successfully (role preserved)');
    } else {
      await setDoc(userRef, {
        role,
        name: name || null,
        photoURL: photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: emailVerified
      });

      console.log('User role saved successfully');
    }
  } catch (error) {
    console.error('Error saving user role to Firestore:', error);
    throw error;
  }
}

// Helper function to get user data from Firestore
async function getUserData(uid: string): Promise<{ role: UserRole; name?: string; photoURL?: string | null } | null> {
  const userRef = doc(firestore, 'users', uid);
  const snapshot = await getDoc(userRef);
  
  if (snapshot.exists()) {
    const data = snapshot.data();
    return {
      role: data.role,
      name: data.name,
      photoURL: data.photoURL
    };
  }
  
  return null;
}

// Helper function to get user role from Firestore (backward compatibility)
async function getUserRole(uid: string): Promise<UserRole | null> {
  const userData = await getUserData(uid);
  return userData?.role || null;
}

// Helper function to determine auth provider
function getAuthProvider(firebaseUser: FirebaseUser): 'email' | 'google' | 'anonymous' {
  if (firebaseUser.isAnonymous) {
    return 'anonymous';
  }
  
  const providerData = firebaseUser.providerData[0];
  if (providerData?.providerId === 'google.com') {
    return 'google';
  }
  
  return 'email';
}
