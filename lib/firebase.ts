import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * Firebase configuration object containing the keys and identifiers for your Firebase project.
 * This object is required to initialize the Firebase app.
 */
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

/**
 * Initialize Firebase only if it hasn't been initialized yet.
 * The check ensures that Firebase isn't initialized multiple times in case of hot reloading (e.g., in a development environment).
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

/**
 * Set the authentication persistence to session storage.
 * This means that the authentication state will be persisted across page reloads but not across sessions (i.e., when the user closes the browser).
 */
setPersistence(auth, browserSessionPersistence)
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

export const db = getFirestore(app);
export const storage = getStorage(app);
