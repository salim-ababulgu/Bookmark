import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

// Messages d'erreur personnalisés
export const getFirebaseErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Aucun compte trouvé avec cet email';
    case 'auth/wrong-password':
      return 'Mot de passe incorrect';
    case 'auth/email-already-in-use':
      return 'Un compte existe déjà avec cet email';
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères';
    case 'auth/invalid-email':
      return 'Adresse email invalide';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessayez plus tard';
    case 'auth/network-request-failed':
      return 'Erreur de connexion. Vérifiez votre réseau';
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé';
    case 'auth/operation-not-allowed':
      return 'Opération non autorisée';
    case 'auth/invalid-credential':
      return 'Identifiants invalides';
    case 'auth/popup-closed-by-user':
      return 'Connexion annulée par l\'utilisateur';
    case 'auth/popup-blocked':
      return 'Popup bloquée par le navigateur';
    case 'auth/account-exists-with-different-credential':
      return 'Un compte existe déjà avec une autre méthode de connexion';
    default:
      return 'Une erreur est survenue. Veuillez réessayer';
  }
};

// Connexion avec email et mot de passe
export const signIn = async (email, password) => {
  console.log('🔥 AuthService: Début connexion email/password');

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    console.log('🔥 AuthService: Connexion réussie', userCredential.user.email);

    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('🔥 AuthService: Erreur connexion:', error);

    return {
      success: false,
      error: getFirebaseErrorMessage(error.code),
      code: error.code
    };
  }
};

// Connexion avec Google
export const signInWithGoogle = async () => {
  console.log('🔥 AuthService: Début connexion Google');

  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('🔥 AuthService: Connexion Google réussie', result.user.email);

    return {
      success: true,
      user: result.user,
      isNewUser: result._tokenResponse?.isNewUser || false
    };
  } catch (error) {
    console.error('🔥 AuthService: Erreur connexion Google:', error);

    return {
      success: false,
      error: getFirebaseErrorMessage(error.code),
      code: error.code
    };
  }
};

// Inscription avec email et mot de passe
export const signUp = async (email, password, displayName = '') => {
  console.log('🔥 AuthService: Début inscription');

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);

    // Mettre à jour le profil avec le nom d'affichage si fourni
    if (displayName.trim()) {
      await updateProfile(userCredential.user, {
        displayName: displayName.trim()
      });
    }

    // Envoyer email de vérification (optionnel)
    await sendEmailVerification(userCredential.user);
    console.log('🔥 AuthService: Inscription réussie', userCredential.user.email);

    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('🔥 AuthService: Erreur inscription:', error);

    return {
      success: false,
      error: getFirebaseErrorMessage(error.code),
      code: error.code
    };
  }
};

// Déconnexion
export const logout = async () => {
  console.log('🔥 AuthService: Début déconnexion');

  try {
    await signOut(auth);
    console.log('🔥 AuthService: Déconnexion réussie');

    return { success: true };
  } catch (error) {
    console.error('🔥 AuthService: Erreur déconnexion:', error);

    return {
      success: false,
      error: getFirebaseErrorMessage(error.code),
      code: error.code
    };
  }
};

// Réinitialisation du mot de passe
export const resetPassword = async (email) => {
  console.log('🔥 AuthService: Début réinitialisation mot de passe');

  try {
    await sendPasswordResetEmail(auth, email.trim());
    console.log('🔥 AuthService: Email de réinitialisation envoyé');

    return { success: true };
  } catch (error) {
    console.error('🔥 AuthService: Erreur réinitialisation:', error);

    return {
      success: false,
      error: getFirebaseErrorMessage(error.code),
      code: error.code
    };
  }
};

// Mettre à jour le profil utilisateur
export const updateUserProfile = async (updates) => {
  try {
    await updateProfile(auth.currentUser, updates);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getFirebaseErrorMessage(error.code),
      code: error.code
    };
  }
};

// Renvoyer l'email de vérification
export const resendVerificationEmail = async () => {
  try {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      return { success: true };
    }
    return { success: false, error: 'Aucun utilisateur connecté' };
  } catch (error) {
    return {
      success: false,
      error: getFirebaseErrorMessage(error.code),
      code: error.code
    };
  }
};