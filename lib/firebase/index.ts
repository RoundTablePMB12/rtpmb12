// Export Firebase configuration
export { default as firebaseApp, db, auth } from './config';

// Export Firebase context and hook
export { FirebaseProvider, useFirebase } from './context';

// Export Firebase services
export * from './services'; 