// Service pour simuler les nouvelles mises à jour et fonctionnalités

export class UpdateService {
  static STORAGE_KEY = 'bookmarkapp_last_update_check';
  static CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

  // Simule les nouvelles fonctionnalités disponibles
  static getAvailableUpdates() {
    const updates = [
      {
        id: 'feature-advanced-search-v2',
        title: 'Recherche avancée améliorée',
        message: 'Nouveaux filtres par date, domaine et type de contenu disponibles dans la recherche.',
        type: 'feature',
        icon: '🔍',
        version: '1.2.0',
        releaseDate: new Date('2024-01-15')
      },
      {
        id: 'security-2fa',
        title: 'Authentification à deux facteurs',
        message: 'Renforcez la sécurité de votre compte avec l\'authentification à deux facteurs.',
        type: 'security',
        icon: '🔐',
        version: '1.1.8',
        releaseDate: new Date('2024-01-10')
      },
      {
        id: 'improvement-performance',
        title: 'Optimisations performances',
        message: 'Chargement des signets 40% plus rapide et interface plus fluide.',
        type: 'improvement',
        icon: '⚡',
        version: '1.1.7',
        releaseDate: new Date('2024-01-05')
      },
      {
        id: 'feature-collections-sharing',
        title: 'Partage de collections',
        message: 'Partagez vos collections de signets avec d\'autres utilisateurs en un clic.',
        type: 'feature',
        icon: '📤',
        version: '1.2.1',
        releaseDate: new Date('2024-01-20')
      },
      {
        id: 'feature-dark-theme-custom',
        title: 'Thèmes personnalisables',
        message: 'Nouveaux thèmes sombres et clairs avec options de personnalisation avancées.',
        type: 'feature',
        icon: '🎨',
        version: '1.1.9',
        releaseDate: new Date('2024-01-12')
      },
      {
        id: 'improvement-browser-extension',
        title: 'Extension navigateur v2.0',
        message: 'Extension Chrome et Firefox redesignée avec sauvegarde instantanée et aperçus.',
        type: 'improvement',
        icon: '🔗',
        version: '2.0.0',
        releaseDate: new Date('2024-01-18')
      }
    ];

    // Simuler des mises à jour récentes (dans les 30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return updates.filter(update => update.releaseDate > thirtyDaysAgo);
  }

  // Vérifie s'il y a de nouvelles mises à jour depuis la dernière vérification
  static checkForNewUpdates() {
    const lastCheck = localStorage.getItem(this.STORAGE_KEY);
    const now = new Date();

    if (!lastCheck || (now.getTime() - new Date(lastCheck).getTime()) > this.CHECK_INTERVAL) {
      // Marquer la vérification
      localStorage.setItem(this.STORAGE_KEY, now.toISOString());

      // Retourner les mises à jour disponibles
      const updates = this.getAvailableUpdates();
      return updates.filter(update => !lastCheck || update.releaseDate > new Date(lastCheck));
    }

    return [];
  }

  // Simuler une nouvelle mise à jour aléatoire (pour démo)
  static simulateNewUpdate() {
    const possibleUpdates = [
      {
        title: 'Nouvelle fonctionnalité : Tags intelligents',
        message: 'Les tags sont maintenant suggérés automatiquement basés sur le contenu de vos signets.',
        type: 'feature',
        icon: '🏷️'
      },
      {
        title: 'Correctif de sécurité appliqué',
        message: 'Correction d\'une vulnérabilité mineure dans le système d\'authentification.',
        type: 'security',
        icon: '🛡️'
      },
      {
        title: 'Interface utilisateur optimisée',
        message: 'L\'interface est maintenant plus réactive sur les appareils mobiles.',
        type: 'improvement',
        icon: '📱'
      },
      {
        title: 'Sauvegarde automatique activée',
        message: 'Vos signets sont maintenant sauvegardés automatiquement toutes les heures.',
        type: 'feature',
        icon: '💾'
      },
      {
        title: 'Mode hors-ligne disponible',
        message: 'Consultez vos signets même sans connexion internet.',
        type: 'feature',
        icon: '📡'
      }
    ];

    const randomUpdate = possibleUpdates[Math.floor(Math.random() * possibleUpdates.length)];
    return {
      id: `simulated-${Date.now()}`,
      ...randomUpdate,
      version: `1.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      releaseDate: new Date()
    };
  }

  // Obtenir les notes de version complètes
  static getReleaseNotes(version) {
    const releaseNotes = {
      '1.2.1': {
        title: 'Partage et collaboration',
        date: '20 janvier 2024',
        features: [
          'Partage de collections avec autres utilisateurs',
          'Liens de collaboration en temps réel',
          'Permissions granulaires sur les collections partagées'
        ],
        improvements: [
          'Interface de gestion des collections redesignée',
          'Performances améliorées pour les grandes collections'
        ],
        fixes: [
          'Correction du bug d\'export des collections vides',
          'Amélioration de la synchronisation multi-appareils'
        ]
      },
      '1.2.0': {
        title: 'Recherche avancée v2',
        date: '15 janvier 2024',
        features: [
          'Filtres par date de création et modification',
          'Recherche par domaine et sous-domaine',
          'Classification automatique par type de contenu'
        ],
        improvements: [
          'Algorithme de recherche 3x plus rapide',
          'Interface de filtres simplifiée',
          'Historique des recherches récentes'
        ],
        fixes: [
          'Correction des résultats de recherche avec caractères spéciaux',
          'Amélioration de la pertinence des résultats'
        ]
      }
    };

    return releaseNotes[version] || null;
  }

  // Simuler la vérification périodique des mises à jour
  static startPeriodicCheck(callback, intervalMinutes = 60) {
    const checkUpdates = () => {
      const newUpdates = this.checkForNewUpdates();
      if (newUpdates.length > 0) {
        callback(newUpdates);
      }
    };

    // Vérification initiale
    setTimeout(checkUpdates, 5000); // 5 secondes après le démarrage

    // Vérifications périodiques
    return setInterval(checkUpdates, intervalMinutes * 60 * 1000);
  }

  // Marquer une mise à jour comme vue
  static markUpdateAsSeen(updateId) {
    const seenUpdates = JSON.parse(localStorage.getItem('bookmarkapp_seen_updates') || '[]');
    if (!seenUpdates.includes(updateId)) {
      seenUpdates.push(updateId);
      localStorage.setItem('bookmarkapp_seen_updates', JSON.stringify(seenUpdates));
    }
  }

  // Vérifier si une mise à jour a été vue
  static isUpdateSeen(updateId) {
    const seenUpdates = JSON.parse(localStorage.getItem('bookmarkapp_seen_updates') || '[]');
    return seenUpdates.includes(updateId);
  }
}

export default UpdateService;