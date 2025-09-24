import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCj8ibVIfI0UIH9F4RvU08kt20NfzThl3w",
  authDomain: "bookmarkapp-271a2.firebaseapp.com",
  projectId: "bookmarkapp-271a2",
  storageBucket: "bookmarkapp-271a2.firebasestorage.app",
  messagingSenderId: "896135933704",
  appId: "1:896135933704:web:743b28dbc55334310586bd"
};

console.log('🔥 Firebase: Initialisation de l\'application');

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configuration du provider Google
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

console.log('🔥 Firebase: Services initialisés', {
  auth: !!auth,
  db: !!db,
  storage: !!storage,
  googleProvider: !!googleProvider
});

export default app;