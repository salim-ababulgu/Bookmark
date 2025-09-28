import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { logout as authLogout } from '../services/supabaseAuthService';

// Création du contexte
const SupabaseAuthContext = createContext({});

// Hook personnalisé pour utiliser le contexte
export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth doit être utilisé dans un SupabaseAuthProvider');
  }
  return context;
};

// Provider du contexte d'authentification Supabase
export const SupabaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    console.log('🔐 SupabaseAuthContext: Initialisation du listener auth...');

    // Récupérer la session initiale
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('🔐 SupabaseAuthContext: Erreur récupération session initiale:', error);
      } else {
        console.log('🔐 SupabaseAuthContext: Session initiale:', session);
        setSession(session);
        setUser(session?.user ?? null);
      }

      setLoading(false);
      setInitialized(true);
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 SupabaseAuthContext: État auth changé:', event, session);

        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN') {
          console.log('🔐 SupabaseAuthContext: Utilisateur connecté:', session.user.email);
        } else if (event === 'SIGNED_OUT') {
          console.log('🔐 SupabaseAuthContext: Utilisateur déconnecté');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔐 SupabaseAuthContext: Token rafraîchi');
        } else if (event === 'USER_UPDATED') {
          console.log('🔐 SupabaseAuthContext: Utilisateur mis à jour');
        }

        setLoading(false);
        setInitialized(true);
      }
    );

    // Nettoyage de l'écoute lors du démontage
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fonction de déconnexion avec gestion d'erreur
  const handleLogout = async () => {
    setLoading(true);
    const result = await authLogout();
    if (result.success) {
      setUser(null);
      setSession(null);
    }
    setLoading(false);
    return result;
  };

  // Valeurs fournies par le contexte
  const value = {
    // État utilisateur
    user,
    session,
    loading,
    initialized,
    isAuthenticated: !!session && !!user,
    isEmailVerified: user?.email_confirmed_at !== null,

    // Informations utilisateur
    userEmail: user?.email || null,
    userName: user?.user_metadata?.display_name || user?.user_metadata?.full_name || null,
    userPhotoURL: user?.user_metadata?.avatar_url || null,
    userUID: user?.id || null,

    // Métadonnées Supabase
    userMetadata: user?.user_metadata || {},
    appMetadata: user?.app_metadata || {},

    // Actions
    logout: handleLogout,

    // Mettre à jour le profil utilisateur
    updateUserProfile: async (updates) => {
      try {
        const { data, error } = await supabase.auth.updateUser({
          data: updates
        });

        if (error) {
          console.error('🔐 SupabaseAuthContext: Erreur mise à jour profil:', error);
          return { success: false, error: error.message };
        }

        console.log('🔐 SupabaseAuthContext: Profil mis à jour:', data);
        return { success: true, data };
      } catch (error) {
        console.error('🔐 SupabaseAuthContext: Erreur updateUserProfile:', error);
        return { success: false, error: error.message };
      }
    },

    // Helpers
    hasRole: (role) => {
      // Gestion des rôles via app_metadata
      return user?.app_metadata?.roles?.includes(role) || false;
    },

    // Refresh user data
    refreshUser: async () => {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('🔐 SupabaseAuthContext: Erreur refresh session:', error);
        return false;
      }
      return true;
    },

    // Obtenir l'access token
    getAccessToken: () => {
      return session?.access_token || null;
    },

    // Vérifier si l'utilisateur a une permission spécifique
    hasPermission: (permission) => {
      return user?.app_metadata?.permissions?.includes(permission) || false;
    }
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

// HOC pour protéger les routes
export const withSupabaseAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useSupabaseAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Accès refusé</h2>
            <p className="text-muted-foreground">Vous devez être connecté pour accéder à cette page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

export default SupabaseAuthContext;