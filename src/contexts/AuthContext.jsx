import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { logout as authLogout } from '../services/authService';

// Cr\u00e9ation du contexte
const AuthContext = createContext({});

// Hook personnalis\u00e9 pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit \u00eatre utilis\u00e9 dans un AuthProvider');
  }
  return context;
};

// Provider du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // \u00c9couter les changements d'\u00e9tat d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);
        setInitialized(true);
      },
      (error) => {
        console.error('Erreur lors de l\'authentification:', error);
        setUser(null);
        setLoading(false);
        setInitialized(true);
      }
    );

    // Nettoyage de l'\u00e9coute lors du d\u00e9montage
    return unsubscribe;
  }, []);

  // Fonction de d\u00e9connexion avec gestion d'erreur
  const handleLogout = async () => {
    setLoading(true);
    const result = await authLogout();
    setLoading(false);
    return result;
  };

  // Valeurs fournies par le contexte
  const value = {
    // \u00c9tat utilisateur
    user,
    loading,
    initialized,
    isAuthenticated: !!user,
    isEmailVerified: user?.emailVerified || false,

    // Informations utilisateur
    userEmail: user?.email || null,
    userName: user?.displayName || null,
    userPhotoURL: user?.photoURL || null,
    userUID: user?.uid || null,

    // Actions
    logout: handleLogout,

    // Helpers
    hasRole: (role) => {
      // Placeholder pour une future gestion des r\u00f4les
      return user?.customClaims?.[role] || false;
    },

    // Refresh user data
    refreshUser: () => {
      return auth.currentUser?.reload();
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// HOC pour prot\u00e9ger les routes
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();

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
            <h2 className="text-2xl font-bold mb-4">Acc\u00e8s refus\u00e9</h2>
            <p className="text-muted-foreground">Vous devez \u00eatre connect\u00e9 pour acc\u00e9der \u00e0 cette page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

export default AuthContext;