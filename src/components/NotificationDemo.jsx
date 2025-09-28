import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import UpdateService from '../services/updateService';

const NotificationDemo = () => {
  const { addNotification } = useNotifications();

  const handleAddFeatureNotification = () => {
    addNotification({
      title: 'Nouvelle fonctionnalité : Tags intelligents',
      message: 'Les tags sont maintenant suggérés automatiquement basés sur le contenu de vos signets.',
      type: 'feature',
      icon: '🏷️'
    });
  };

  const handleAddSecurityNotification = () => {
    addNotification({
      title: 'Mise à jour de sécurité appliquée',
      message: 'Correction d\'une vulnérabilité dans le système d\'authentification.',
      type: 'security',
      icon: '🔒'
    });
  };

  const handleAddImprovementNotification = () => {
    addNotification({
      title: 'Performance optimisée',
      message: 'L\'interface est maintenant plus réactive sur les appareils mobiles.',
      type: 'improvement',
      icon: '⚡'
    });
  };

  const handleSimulateRandomUpdate = () => {
    const randomUpdate = UpdateService.simulateNewUpdate();
    addNotification({
      title: randomUpdate.title,
      message: randomUpdate.message,
      type: randomUpdate.type,
      icon: randomUpdate.icon
    });
  };

  return (
    <div className="p-6 bg-card rounded-lg border border-border">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Demo - Système de notifications</h2>
      <p className="text-muted-foreground mb-6">
        Testez la cloche de notification en ajoutant différents types de notifications.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={handleAddFeatureNotification}
          className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
        >
          <span className="text-lg">🚀</span>
          <div className="text-left">
            <div className="font-medium text-blue-900 dark:text-blue-100">Nouvelle fonctionnalité</div>
            <div className="text-sm text-blue-600 dark:text-blue-300">Ajouter une notification feature</div>
          </div>
        </button>

        <button
          onClick={handleAddSecurityNotification}
          className="flex items-center gap-2 p-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800 transition-colors"
        >
          <span className="text-lg">🔒</span>
          <div className="text-left">
            <div className="font-medium text-red-900 dark:text-red-100">Mise à jour sécurité</div>
            <div className="text-sm text-red-600 dark:text-red-300">Ajouter une notification sécurité</div>
          </div>
        </button>

        <button
          onClick={handleAddImprovementNotification}
          className="flex items-center gap-2 p-3 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 transition-colors"
        >
          <span className="text-lg">⚡</span>
          <div className="text-left">
            <div className="font-medium text-green-900 dark:text-green-100">Amélioration</div>
            <div className="text-sm text-green-600 dark:text-green-300">Ajouter une notification amélioration</div>
          </div>
        </button>

        <button
          onClick={handleSimulateRandomUpdate}
          className="flex items-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors"
        >
          <span className="text-lg">🎲</span>
          <div className="text-left">
            <div className="font-medium text-purple-900 dark:text-purple-100">Mise à jour aléatoire</div>
            <div className="text-sm text-purple-600 dark:text-purple-300">Simuler une nouvelle mise à jour</div>
          </div>
        </button>
      </div>

      <div className="mt-6 p-4 bg-accent/50 rounded-lg">
        <h3 className="font-semibold text-sm mb-2 text-foreground">ℹ️ Comment ça marche :</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• La cloche 🔔 apparaît dans le header avec un badge si il y a des notifications non lues</li>
          <li>• Cliquez sur la cloche pour voir la liste des notifications</li>
          <li>• Marquez les notifications comme lues individuellement ou toutes à la fois</li>
          <li>• Le système vérifie automatiquement les mises à jour toutes les heures</li>
          <li>• Les notifications sont sauvegardées localement</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationDemo;