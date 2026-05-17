import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAXOO4sIzqRc8JIJCMqJ8UKp2CCkHxksRk",
  authDomain: "fordagooo.firebaseapp.com",
  projectId: "fordagooo",
  databaseURL: "https://fordagooo-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "fordagooo.firebasestorage.app",
  messagingSenderId: "916311091131",
  appId: "1:916311091131:web:6959e91d6748081cfb069e"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage persistence
// This allows users to stay logged in between app sessions
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // If auth is already initialized, just get it
  auth = getAuth(app);
}

// Export Firebase services
export const database = getDatabase(app); // Realtime Database - for location tracking only
export const firestore = getFirestore(app); // Firestore - for user data and all other data
export { auth };
