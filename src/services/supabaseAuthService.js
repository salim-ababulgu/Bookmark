import { supabase } from './supabase';

// Messages d'erreur personnalisés pour Supabase
export const getSupabaseErrorMessage = (error) => {
  if (error?.message) {
    // Messages spécifiques de Supabase
    if (error.message.includes('Invalid login credentials')) {
      return 'Email ou mot de passe incorrect';
    }
    if (error.message.includes('User already registered')) {
      return 'Un compte existe déjà avec cet email';
    }
    if (error.message.includes('Password should be at least')) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (error.message.includes('Invalid email')) {
      return 'Adresse email invalide';
    }
    if (error.message.includes('Email not confirmed')) {
      return 'Veuillez confirmer votre email avant de vous connecter';
    }
    if (error.message.includes('too many requests')) {
      return 'Trop de tentatives. Réessayez plus tard';
    }

    // Retourner le message original si pas de correspondance
    return error.message;
  }

  return 'Une erreur est survenue. Veuillez réessayer';
};

// Connexion avec email et mot de passe
export const signIn = async (email, password) => {
  console.log('🚀 SupabaseAuth: Début connexion email/password');
  console.log('🚀 SupabaseAuth: Email:', email);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      console.error('🚀 SupabaseAuth: Erreur connexion:', error);
      return {
        success: false,
        error: getSupabaseErrorMessage(error),
        code: error.status
      };
    }

    console.log('🚀 SupabaseAuth: Connexion réussie', data.user.email);
    return { success: true, user: data.user, session: data.session };

  } catch (error) {
    console.error('🚀 SupabaseAuth: Erreur connexion complète:', error);
    return {
      success: false,
      error: getSupabaseErrorMessage(error),
      code: error.status
    };
  }
};

// Connexion avec Google
export const signInWithGoogle = async () => {
  console.log('🚀 SupabaseAuth: Début connexion Google');

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
        skipBrowserRedirect: false
      }
    });

    if (error) {
      console.error('🚀 SupabaseAuth: Erreur Google:', error);

      // Erreur spécifique pour les bloqueurs
      if (error.message?.includes('blocked') || error.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
        return {
          success: false,
          error: 'Connexion Google bloquée par votre navigateur. Veuillez désactiver votre bloqueur de publicités ou tester en mode incognito.',
          code: 'BLOCKED_BY_CLIENT'
        };
      }

      return {
        success: false,
        error: getSupabaseErrorMessage(error),
        code: error.status
      };
    }

    console.log('🚀 SupabaseAuth: Connexion Google initiée');
    return { success: true, data };

  } catch (error) {
    console.error('🚀 SupabaseAuth: Erreur Google complète:', error);

    // Vérifier si c'est un problème de réseau/bloqueur
    if (error.name === 'TypeError' || error.message?.includes('Failed to fetch')) {
      return {
        success: false,
        error: 'Impossible de contacter Google. Vérifiez votre connexion et désactivez les bloqueurs de publicités.',
        code: 'NETWORK_ERROR'
      };
    }

    return {
      success: false,
      error: getSupabaseErrorMessage(error),
      code: error.status
    };
  }
};

// Inscription avec email et mot de passe
export const signUp = async (email, password, displayName = '') => {
  console.log('🚀 SupabaseAuth: Début inscription');
  console.log('🚀 SupabaseAuth: Email:', email, 'DisplayName:', displayName);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          display_name: displayName.trim(),
          full_name: displayName.trim(),
        }
      }
    });

    if (error) {
      console.error('🚀 SupabaseAuth: Erreur inscription:', error);
      return {
        success: false,
        error: getSupabaseErrorMessage(error),
        code: error.status
      };
    }

    console.log('🚀 SupabaseAuth: Inscription réussie', data.user?.email);
    return {
      success: true,
      user: data.user,
      session: data.session,
      emailVerificationSent: !data.session // Si pas de session, email de confirmation envoyé
    };

  } catch (error) {
    console.error('🚀 SupabaseAuth: Erreur inscription complète:', error);
    return {
      success: false,
      error: getSupabaseErrorMessage(error),
      code: error.status
    };
  }
};

// Déconnexion
export const logout = async () => {
  console.log('🚀 SupabaseAuth: Début déconnexion');

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('🚀 SupabaseAuth: Erreur déconnexion:', error);
      return {
        success: false,
        error: getSupabaseErrorMessage(error),
        code: error.status
      };
    }

    console.log('🚀 SupabaseAuth: Déconnexion réussie');
    return { success: true };

  } catch (error) {
    console.error('🚀 SupabaseAuth: Erreur déconnexion complète:', error);
    return {
      success: false,
      error: getSupabaseErrorMessage(error),
      code: error.status
    };
  }
};

// Réinitialisation du mot de passe
export const resetPassword = async (email) => {
  console.log('🚀 SupabaseAuth: Début réinitialisation mot de passe');

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      console.error('🚀 SupabaseAuth: Erreur réinitialisation:', error);
      return {
        success: false,
        error: getSupabaseErrorMessage(error),
        code: error.status
      };
    }

    console.log('🚀 SupabaseAuth: Email de réinitialisation envoyé');
    return { success: true };

  } catch (error) {
    console.error('🚀 SupabaseAuth: Erreur réinitialisation complète:', error);
    return {
      success: false,
      error: getSupabaseErrorMessage(error),
      code: error.status
    };
  }
};

// Mettre à jour le profil utilisateur
export const updateUserProfile = async (updates) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });

    if (error) {
      return {
        success: false,
        error: getSupabaseErrorMessage(error),
        code: error.status
      };
    }

    return { success: true, user: data.user };
  } catch (error) {
    return {
      success: false,
      error: getSupabaseErrorMessage(error),
      code: error.status
    };
  }
};

// Renvoyer l'email de vérification
export const resendVerificationEmail = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Aucun utilisateur connecté' };
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email
    });

    if (error) {
      return {
        success: false,
        error: getSupabaseErrorMessage(error),
        code: error.status
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getSupabaseErrorMessage(error),
      code: error.status
    };
  }
};

// Obtenir l'utilisateur actuel
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('🚀 SupabaseAuth: Erreur récupération utilisateur:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('🚀 SupabaseAuth: Erreur récupération utilisateur complète:', error);
    return null;
  }
};

// Obtenir la session actuelle
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('🚀 SupabaseAuth: Erreur récupération session:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('🚀 SupabaseAuth: Erreur récupération session complète:', error);
    return null;
  }
};