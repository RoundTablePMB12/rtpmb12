"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './config';
import * as firebaseServices from './services';

// Define the context type
type FirebaseContextType = {
  user: User | null;
  loading: boolean;
  services: typeof firebaseServices;
};

// Create the context with a default value
const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  services: firebaseServices,
});

// Custom hook to use the Firebase context
export const useFirebase = () => useContext(FirebaseContext);

// Provider component
export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    let unsubscribe = () => {};
    
    try {
      // Only set up the auth listener if auth is properly initialized
      if (auth && typeof auth.onAuthStateChanged === 'function') {
        unsubscribe = onAuthStateChanged(auth, (authUser) => {
          setUser(authUser);
          setLoading(false);
        });
      } else {
        // If auth is not properly initialized, just set loading to false
        console.warn("Firebase Auth not properly initialized, skipping auth listener");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error setting up auth listener:", error);
      setLoading(false);
    }

    // Cleanup subscription
    return () => {
      try {
        unsubscribe();
      } catch (error) {
        console.error("Error cleaning up auth listener:", error);
      }
    };
  }, []);

  const value = {
    user,
    loading,
    services: firebaseServices,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
} 