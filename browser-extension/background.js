// Background Script - Service Worker pour l'extension
console.log('📚 BookmarkApp Extension: Background script chargé');

class BackgroundService {
  constructor() {
    this.bookmarkAppUrl = 'http://localhost:5174';
    this.init();
  }

  init() {
    // Écouter l'installation de l'extension
    chrome.runtime.onInstalled.addListener((details) => {
      console.log('📚 Extension installée:', details.reason);

      if (details.reason === 'install') {
        this.onFirstInstall();
      } else if (details.reason === 'update') {
        this.onUpdate(details.previousVersion);
      }
    });

    // Écouter les messages des autres scripts
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Garder le canal ouvert pour les réponses asynchrones
    });

    // Écouter les changements d'onglets
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.onTabUpdated(tabId, tab);
      }
    });

    // Configurer les raccourcis clavier
    chrome.commands.onCommand.addListener((command) => {
      this.handleCommand(command);
    });

    // Écouter les clics sur l'icône de l'extension
    chrome.action.onClicked.addListener((tab) => {
      this.onExtensionClicked(tab);
    });
  }

  onFirstInstall() {
    console.log('🎉 Première installation de BookmarkApp Extension');

    // Ouvrir la page d'accueil de l'app
    chrome.tabs.create({
      url: this.bookmarkAppUrl,
      active: true
    });

    // Définir des badges ou notifications de bienvenue
    this.setBadge('NEW', '#667eea');

    // Programmer un message de bienvenue
    setTimeout(() => {
      this.setBadge('', '');
    }, 5000);
  }

  onUpdate(previousVersion) {
    console.log(`🔄 Extension mise à jour de ${previousVersion} vers ${chrome.runtime.getManifest().version}`);

    // Actions spécifiques selon la version
    this.setBadge('UP', '#10b981');

    setTimeout(() => {
      this.setBadge('', '');
    }, 3000);
  }

  async handleMessage(request, sender, sendResponse) {
    console.log('📚 Message reçu dans background:', request);

    try {
      switch (request.action) {
        case 'checkConnection':
          const isConnected = await this.checkBookmarkAppConnection();
          sendResponse({ connected: isConnected });
          break;

        case 'quickBookmark':
          const result = await this.quickBookmark(request.data);
          sendResponse(result);
          break;

        case 'syncBookmarks':
          await this.syncWithBookmarkApp();
          sendResponse({ success: true });
          break;

        case 'setBadge':
          this.setBadge(request.text, request.color);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ error: 'Action non reconnue' });
      }
    } catch (error) {
      console.error('❌ Erreur dans background script:', error);
      sendResponse({ error: error.message });
    }
  }

  onTabUpdated(tabId, tab) {
    // Vérifier si c'est une page de BookmarkApp
    if (tab.url && tab.url.startsWith(this.bookmarkAppUrl)) {
      this.setBadge('APP', '#667eea');

      setTimeout(() => {
        this.setBadge('', '');
      }, 2000);
    }

    // Détecter les pages intéressantes pour suggérer un bookmark
    this.analyzePageForBookmarking(tab);
  }

  async handleCommand(command) {
    console.log('⌨️ Commande reçue:', command);

    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    switch (command) {
      case 'quick-bookmark':
        await this.quickBookmarkCurrentPage(currentTab);
        break;

      case 'open-bookmarks':
        chrome.tabs.create({
          url: `${this.bookmarkAppUrl}/dashboard`,
          active: true
        });
        break;

      case 'toggle-extension':
        // Ouvrir/fermer le popup programmatiquement n'est pas possible
        // Mais on peut ouvrir l'app BookmarkApp
        chrome.tabs.create({
          url: this.bookmarkAppUrl,
          active: true
        });
        break;
    }
  }

  onExtensionClicked(tab) {
    // Le popup s'ouvre automatiquement grâce au manifest
    // Cette fonction est appelée seulement si aucun popup n'est défini
    console.log('🖱️ Clic sur l\'icône extension:', tab);
  }

  async checkBookmarkAppConnection() {
    try {
      const response = await fetch(`${this.bookmarkAppUrl}/api/health`, {
        method: 'GET',
        mode: 'no-cors'
      });

      return response.ok;
    } catch (error) {
      console.warn('⚠️ BookmarkApp non disponible:', error);
      return false;
    }
  }

  async quickBookmarkCurrentPage(tab) {
    if (!tab || !tab.url) {
      this.showNotification('Erreur', 'Impossible de récupérer les informations de la page');
      return;
    }

    try {
      // Envoyer un message au content script pour récupérer les infos
      const pageInfo = await chrome.tabs.sendMessage(tab.id, { action: 'getPageInfo' });

      const bookmarkData = {
        title: pageInfo?.title || tab.title,
        url: tab.url,
        description: pageInfo?.description || '',
        tags: pageInfo?.suggestedTags?.slice(0, 3) || [],
        quick: true
      };

      // Sauvegarder via l'API
      const result = await this.saveBookmarkToApp(bookmarkData);

      if (result.success) {
        this.showNotification('Succès!', 'Favori ajouté à BookmarkApp');
        this.setBadge('✓', '#10b981');

        // Notifier le content script
        chrome.tabs.sendMessage(tab.id, { action: 'highlightSaved' });

        setTimeout(() => {
          this.setBadge('', '');
        }, 2000);
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }

    } catch (error) {
      console.error('❌ Erreur quick bookmark:', error);
      this.showNotification('Erreur', `Impossible d'ajouter le favori: ${error.message}`);
    }
  }

  async saveBookmarkToApp(bookmarkData) {
    try {
      const response = await fetch(`${this.bookmarkAppUrl}/api/bookmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(bookmarkData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Erreur sauvegarde API:', error);
      return { success: false, error: error.message };
    }
  }

  analyzePageForBookmarking(tab) {
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      return;
    }

    // Détecter des pages intéressantes
    const interestingDomains = [
      'github.com',
      'stackoverflow.com',
      'developer.mozilla.org',
      'docs.',
      'tutorial',
      'guide',
      'reference'
    ];

    const isInteresting = interestingDomains.some(domain =>
      tab.url.toLowerCase().includes(domain)
    );

    if (isInteresting) {
      // Suggérer discrètement l'ajout aux favoris
      this.setBadge('⭐', '#f59e0b');

      setTimeout(() => {
        this.setBadge('', '');
      }, 5000);
    }
  }

  setBadge(text, color) {
    chrome.action.setBadgeText({ text });
    if (color) {
      chrome.action.setBadgeBackgroundColor({ color });
    }
  }

  showNotification(title, message) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: title,
      message: message,
      priority: 1
    });
  }

  async syncWithBookmarkApp() {
    // Fonction pour synchroniser les données avec l'app
    try {
      console.log('🔄 Synchronisation avec BookmarkApp...');

      const response = await fetch(`${this.bookmarkAppUrl}/api/sync`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        console.log('✅ Synchronisation réussie');
        this.setBadge('✓', '#10b981');

        setTimeout(() => {
          this.setBadge('', '');
        }, 2000);
      }

    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
    }
  }
}

// Initialiser le service background
const backgroundService = new BackgroundService();

console.log('📚 BookmarkApp Extension: Background service initialisé');

// Gestion des erreurs globales
self.addEventListener('error', (event) => {
  console.error('❌ Erreur globale background script:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promesse rejetée background script:', event.reason);
});