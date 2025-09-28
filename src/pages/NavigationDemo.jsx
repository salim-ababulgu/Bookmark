import React from 'react';
import ModularNavigation from '../components/ModularNavigation';
import { useNavigation } from '../hooks/useNavigation';

const NavigationDemo = () => {
  const { currentSection, handleNavigate, handleSearch, searchQuery } = useNavigation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Demo (sera affichée en bas via le layout) */}

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🚀 Navigation Flottante Modulaire
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Navigation flottante en bas d'écran qui reproduit le comportement modulable de l'App Store avec trois conditions distinctes.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
            <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
              👀 Regardez en bas de votre écran ! La navigation flotte au-dessus du contenu avec un effet glassmorphism.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Condition 0 (Initial)
              </h3>
              <p className="text-blue-700 dark:text-blue-200 text-sm">
                Bouton "Dashboard" à gauche + barre de recherche pleine largeur à droite
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Condition 1 (Menu étendu)
              </h3>
              <p className="text-green-700 dark:text-green-200 text-sm">
                Menu navigation visible + bouton search rétracté (Loop)
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                Condition 2 (Recherche active)
              </h3>
              <p className="text-orange-700 dark:text-orange-200 text-sm">
                Dashboard masqué + recherche étendue + bouton Cancel
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">État Actuel</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Section actuelle:</p>
                <p className="font-mono text-lg text-gray-900 dark:text-white">{currentSection}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recherche:</p>
                <p className="font-mono text-lg text-gray-900 dark:text-white">
                  {searchQuery || '<vide>'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content based on current section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Contenu: {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
          </h2>

          {currentSection === 'dashboard' && (
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                Bienvenue sur le Dashboard ! Ici vous pouvez voir un aperçu de vos favoris et statistiques.
              </p>
            </div>
          )}

          {currentSection === 'analytics' && (
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                Page Analytics - Visualisez les statistiques détaillées de vos favoris et leur utilisation.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                  <p className="text-blue-900 dark:text-blue-100 font-semibold">Total Vues</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,234</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                  <p className="text-green-900 dark:text-green-100 font-semibold">Clics</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">567</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded">
                  <p className="text-orange-900 dark:text-orange-100 font-semibold">Nouveaux</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">89</p>
                </div>
              </div>
            </div>
          )}

          {currentSection === 'links' && (
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                Gestionnaire de Liens - Vérifiez l'état de vos liens et gérez leur validité.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="text-green-900 dark:text-green-100">https://example.com</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded text-sm">✓ Actif</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <span className="text-red-900 dark:text-red-100">https://broken-link.com</span>
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded text-sm">✗ Cassé</span>
                </div>
              </div>
            </div>
          )}

          {currentSection === 'profile' && (
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                Profil Utilisateur - Gérez vos informations personnelles et préférences.
              </p>
            </div>
          )}

          {currentSection === 'settings' && (
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                Paramètres - Configurez l'application selon vos préférences.
              </p>
            </div>
          )}

          {currentSection === 'favorites' && (
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                Favoris - Gérez votre collection de liens favoris.
              </p>
            </div>
          )}

          {searchQuery && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-yellow-900 dark:text-yellow-100">
                Recherche active pour: <strong>"{searchQuery}"</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationDemo;