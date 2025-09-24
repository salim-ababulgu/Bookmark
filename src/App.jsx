import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import { Toaster } from 'sonner';

console.log('🚀 App.jsx: Module importé');

// Composant pour protéger les routes privées
const ProtectedRoute = ({ children }) => {
  console.log('🔒 ProtectedRoute: Rendu');

  const { isAuthenticated, loading, initialized } = useAuth();
  const location = useLocation();

  console.log('🔒 ProtectedRoute - État:', {
    isAuthenticated,
    loading,
    initialized,
    pathname: location.pathname
  });

  // Attendre que l'authentification soit initialisée
  if (!initialized || loading) {
    console.log('🔒 ProtectedRoute: Chargement/Initialisation...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-muted-foreground">Vérification de l'authentification...</div>
        </div>
      </div>
    );
  }

  // Rediriger vers la page d'auth si non authentifié
  if (!isAuthenticated) {
    console.log('🔒 ProtectedRoute: Redirection vers /auth depuis', location.pathname);
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  console.log('🔒 ProtectedRoute: Accès autorisé');
  return children;
};

// Composant pour rediriger les utilisateurs connectés depuis la page d'auth
const PublicRoute = ({ children }) => {
  console.log('🌍 PublicRoute: Rendu');

  const { isAuthenticated, loading, initialized } = useAuth();

  console.log('🌍 PublicRoute - État:', {
    isAuthenticated,
    loading,
    initialized
  });

  // Attendre que l'authentification soit initialisée
  if (!initialized || loading) {
    console.log('🌍 PublicRoute: Chargement/Initialisation...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      </div>
    );
  }

  // Rediriger vers le dashboard si déjà connecté
  if (isAuthenticated) {
    console.log('🌍 PublicRoute: Redirection vers /dashboard (utilisateur connecté)');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('🌍 PublicRoute: Accès public autorisé');
  return children;
};

// Page d'accueil simple
const HomePage = () => {
  console.log('🏠 HomePage: Rendu');

  const { isAuthenticated } = useAuth();

  console.log('🏠 HomePage - isAuthenticated:', isAuthenticated);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Bienvenue sur BookmarkApp
          </h1>
          <p className="text-xl text-muted-foreground">
            Gérez vos favoris simplement et efficacement
          </p>
        </div>

        <div className="space-y-4">
          {isAuthenticated ? (
            <div className="space-y-3">
              <p className="text-muted-foreground">Vous êtes déjà connecté !</p>
              <a
                href="/dashboard"
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
              >
                Accéder au Dashboard
              </a>
            </div>
          ) : (
            <div className="space-x-4">
              <a
                href="/auth"
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
              >
                Se connecter
              </a>
              <a
                href="/auth"
                className="inline-block border border-input bg-background px-6 py-3 rounded-md font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Créer un compte
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Page 404
const NotFoundPage = () => {
  console.log('❌ NotFoundPage: Rendu');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="text-xl text-muted-foreground">Page non trouvée</p>
        <a
          href="/"
          className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
};

// Composant principal avec les routes
const AppRoutes = () => {
  console.log('🗺️ AppRoutes: Rendu');

  return (
    <Routes>
      {/* Page d'accueil */}
      <Route path="/" element={<HomePage />} />

      {/* Page d'authentification - accessible seulement si non connecté */}
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      {/* Dashboard - accessible seulement si connecté */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Autres routes protégées */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background flex items-center justify-center">
              <h1 className="text-2xl font-bold">Profil utilisateur</h1>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/bookmarks"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background flex items-center justify-center">
              <h1 className="text-2xl font-bold">Mes Favoris</h1>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Pages publiques */}
      <Route path="/help" element={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <h1 className="text-2xl font-bold">Aide</h1>
        </div>
      } />

      <Route path="/privacy" element={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <h1 className="text-2xl font-bold">Politique de confidentialité</h1>
        </div>
      } />

      <Route path="/terms" element={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <h1 className="text-2xl font-bold">Conditions d'utilisation</h1>
        </div>
      } />

      {/* Route 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// Composant App principal
function App() {
  console.log('🎯 App: Composant principal rendu');

  try {
    return (
      <Router>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="bottom-right"
            richColors
            expand={true}
            duration={4000}
          />
        </AuthProvider>
      </Router>
    );
  } catch (error) {
    console.error('❌ App: Erreur dans le composant principal:', error);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Erreur d'application</h1>
          <p className="text-red-500">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }
}

export default App;