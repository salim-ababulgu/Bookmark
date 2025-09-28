import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SupabaseAuthProvider, useSupabaseAuth } from './contexts/SupabaseAuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SecurityProvider } from './contexts/SecurityContext';
import AuthPage from './pages/AuthPage';
import MainTabs from './components/MainTabs';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import NavigationDemo from './pages/NavigationDemo';
import AppLayout from './components/AppLayout';
import EnhancedWelcomeModal from './components/EnhancedWelcomeModal';
import { Toaster } from 'sonner';
import ToastProvider from './components/notifications/ToastProvider';
import AdvancedFeedbackProvider from './components/feedback/AdvancedFeedbackSystem';
import BookmarksPage from './pages/BookmarksPage';

console.log('🚀 App.jsx: Module importé');

// Composant pour protéger les routes privées
const ProtectedRoute = ({ children }) => {
  console.log('🔒 ProtectedRoute: Rendu');

  const { isAuthenticated, loading, initialized } = useSupabaseAuth();
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

  const { isAuthenticated, loading, initialized } = useSupabaseAuth();

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

// Page d'accueil moderne style SaaS
const HomePage = () => {
  console.log('🏠 HomePage: Rendu');

  const { isAuthenticated } = useSupabaseAuth();

  console.log('🏠 HomePage - isAuthenticated:', isAuthenticated);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" style={{ fontFamily: 'Satoshi, system-ui, -apple-system, sans-serif' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-50/30 via-white to-orange-50/20 dark:from-red-950/20 dark:via-gray-950 dark:to-orange-950/10">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-gray-100/20 [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

        {/* Hero Content */}
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 ring-1 ring-red-200 dark:bg-red-950/50 dark:text-red-400 dark:ring-red-800">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                Nouvelle expérience disponible
              </div>
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl">
              Organisez vos favoris comme
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"> jamais auparavant</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-xl leading-8 text-gray-600 dark:text-gray-300">
              BookmarkApp révolutionne la gestion de vos liens. Sauvegarde instantanée, organisation intelligente, recherche puissante et synchronisation parfaite sur tous vos appareils.
            </p>

            {/* Features Grid */}
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
              <div className="flex flex-col items-center rounded-2xl bg-white/50 p-4 backdrop-blur-sm ring-1 ring-gray-200/50 dark:bg-gray-900/50 dark:ring-gray-800/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/50">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">Un clic</span>
              </div>

              <div className="flex flex-col items-center rounded-2xl bg-white/50 p-4 backdrop-blur-sm ring-1 ring-gray-200/50 dark:bg-gray-900/50 dark:ring-gray-800/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/50">
                  <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  </svg>
                </div>
                <span className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">Collections</span>
              </div>

              <div className="flex flex-col items-center rounded-2xl bg-white/50 p-4 backdrop-blur-sm ring-1 ring-gray-200/50 dark:bg-gray-900/50 dark:ring-gray-800/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-950/50">
                  <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
                <span className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">Recherche</span>
              </div>

              <div className="flex flex-col items-center rounded-2xl bg-white/50 p-4 backdrop-blur-sm ring-1 ring-gray-200/50 dark:bg-gray-900/50 dark:ring-gray-800/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-950/50">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </div>
                <span className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">Sync</span>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
              {isAuthenticated ? (
                <a
                  href="/app"
                  className="group relative inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-orange-600 px-8 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:shadow-red-500/25"
                >
                  <span className="relative">Accéder à l'App</span>
                  <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                </a>
              ) : (
                <>
                  <a
                    href="/auth"
                    className="group relative inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-orange-600 px-8 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:shadow-red-500/25"
                  >
                    <span className="relative">Commencer gratuitement</span>
                    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                  </a>
                  <a href="#features" className="group inline-flex h-12 items-center justify-center rounded-full border border-gray-300 bg-white/80 px-6 text-sm font-semibold text-gray-900 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:shadow-md dark:border-gray-700 dark:bg-gray-900/80 dark:text-white dark:hover:bg-gray-900">
                    En savoir plus
                    <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Features Section */}
      <div id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6">
              <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600 ring-1 ring-red-200 dark:bg-red-950/50 dark:text-red-400 dark:ring-red-800">
                Interface moderne
              </span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Tout ce dont vous avez besoin pour gérer vos favoris
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Découvrez une expérience utilisateur repensée avec des fonctionnalités avancées pour organiser, retrouver et partager vos liens favoris.
            </p>
          </div>

          <div className="mx-auto mt-20 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
              <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-lg ring-1 ring-gray-200/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 dark:bg-gray-900 dark:ring-gray-800/50">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                  Trois modes d'affichage
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  Liste, grille ou galerie Pinterest - choisissez la vue qui vous convient le mieux selon vos préférences et le type de contenu.
                </p>
                <div className="absolute -bottom-2 -right-2 h-24 w-24 rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/10 transition-all duration-300 group-hover:scale-110"></div>
              </div>

              <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-lg ring-1 ring-gray-200/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 dark:bg-gray-900 dark:ring-gray-800/50">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                  Dashboard intelligent
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  Aperçu global avec statistiques, favoris récents et collections actives pour suivre votre activité en un coup d'œil.
                </p>
                <div className="absolute -bottom-2 -right-2 h-24 w-24 rounded-full bg-gradient-to-br from-orange-500/10 to-yellow-500/10 transition-all duration-300 group-hover:scale-110"></div>
              </div>

              <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-lg ring-1 ring-gray-200/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 dark:bg-gray-900 dark:ring-gray-800/50">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                  Import/Export universel
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  Formats JSON et HTML compatibles avec tous les navigateurs pour migrer facilement vos favoris existants.
                </p>
                <div className="absolute -bottom-2 -right-2 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 transition-all duration-300 group-hover:scale-110"></div>
              </div>

              <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-lg ring-1 ring-gray-200/50 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10 dark:bg-gray-900 dark:ring-gray-800/50">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                  Expérience premium
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  Onboarding guidé, commande rapide (Ctrl+K), drag & drop intuitif et notifications toast élégantes.
                </p>
                <div className="absolute -bottom-2 -right-2 h-24 w-24 rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 transition-all duration-300 group-hover:scale-110"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-600 to-red-700">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Prêt à révolutionner vos favoris ?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-red-100">
              Rejoignez les utilisateurs qui ont déjà transformé leur façon d'organiser leurs liens. Interface élégante, synchronisation Supabase et sécurité garantie.
            </p>
            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
              {!isAuthenticated && (
                <>
                  <a
                    href="/auth"
                    className="group relative inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-red-600 shadow-xl transition-all duration-200 hover:shadow-2xl hover:shadow-white/25"
                  >
                    <span className="relative">Commencer maintenant</span>
                    <div className="absolute inset-0 rounded-full bg-red-600/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                  </a>
                  <a href="#features" className="group inline-flex h-14 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 px-6 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20">
                    Découvrir les fonctionnalités
                    <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/5 to-transparent"></div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">BookmarkApp</span>
              </div>
              <p className="text-center text-gray-600 dark:text-gray-400">
                Gérez vos favoris intelligemment
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8">
              <a href="/help" className="text-sm font-medium text-gray-600 transition-colors hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
                Aide
              </a>
              <a href="/privacy" className="text-sm font-medium text-gray-600 transition-colors hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
                Confidentialité
              </a>
              <a href="/terms" className="text-sm font-medium text-gray-600 transition-colors hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
                CGU
              </a>
            </div>

            <div className="w-full max-w-md border-t border-gray-200 pt-8 dark:border-gray-800">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                © 2024 BookmarkApp. Tous droits réservés.
              </p>
              <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
                Licence MIT - libre d'utilisation et de modification.
                <span className="mx-2">•</span>
                <a href="/admin" className="hover:text-gray-300 transition-colors">Admin</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Composant principal de l'app avec gestion du modal de bienvenue
const MainAppWithWelcome = () => {
  const { user } = useSupabaseAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (user) {
      // Vérifier si c'est un nouvel utilisateur
      const isNewUser = localStorage.getItem(`welcome_shown_${user.id}`) !== 'true';
      if (isNewUser) {
        setShowWelcomeModal(true);
      }
    }
  }, [user]);

  const handleWelcomeClose = () => {
    if (user) {
      localStorage.setItem(`welcome_shown_${user.id}`, 'true');
    }
    setShowWelcomeModal(false);
  };

  return (
    <>
      <MainTabs />
      <EnhancedWelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleWelcomeClose}
      />
    </>
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

      {/* Main App avec tabs - accessible seulement si connecté */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <MainAppWithWelcome />
          </ProtectedRoute>
        }
      />

      {/* Dashboard - redirect vers /app */}
      <Route
        path="/dashboard"
        element={<Navigate to="/app" replace />}
      />

      {/* Autres routes protégées */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/nav-demo"
        element={<NavigationDemo />}
      />

      {/* Bookmarks - redirect vers /app */}
      <Route
        path="/bookmarks"
        element={<Navigate to="/app" replace />}
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
        <SupabaseAuthProvider>
          <SecurityProvider>
            <NotificationProvider>
              <ThemeProvider>
                <AdvancedFeedbackProvider>
                  <AppRoutes />
                  <ToastProvider />
                  <Toaster
                    position="bottom-right"
                    richColors
                    expand={true}
                    duration={4000}
                  />
                </AdvancedFeedbackProvider>
              </ThemeProvider>
            </NotificationProvider>
          </SecurityProvider>
        </SupabaseAuthProvider>
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