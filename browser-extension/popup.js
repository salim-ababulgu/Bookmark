// Popup Script - Interface de l'extension
console.log('📚 BookmarkApp Extension: Popup script chargé');

class BookmarkExtension {
  constructor() {
    this.pageInfo = null;
    this.collections = [];
    this.isAuthenticated = false;
    this.bookmarkAppUrl = 'http://localhost:5174';

    this.initializeElements();
    this.attachEventListeners();
    this.init();
  }

  initializeElements() {
    // Status elements
    this.statusElement = document.getElementById('status');
    this.statusText = document.getElementById('statusText');
    this.loadingSpinner = document.getElementById('loadingSpinner');

    // Forms
    this.loginForm = document.getElementById('loginForm');
    this.bookmarkForm = document.getElementById('bookmarkForm');
    this.successMessage = document.getElementById('successMessage');
    this.errorMessage = document.getElementById('errorMessage');

    // Form inputs
    this.titleInput = document.getElementById('title');
    this.urlInput = document.getElementById('url');
    this.descriptionInput = document.getElementById('description');
    this.tagsInput = document.getElementById('tags');
    this.collectionSelect = document.getElementById('collection');

    // Buttons
    this.openAppBtn = document.getElementById('openApp');
    this.saveBookmarkBtn = document.getElementById('saveBookmark');
    this.quickSaveBtn = document.getElementById('quickSave');
    this.viewBookmarksBtn = document.getElementById('viewBookmarks');
    this.retryBtn = document.getElementById('retry');

    // Detect buttons
    this.detectTitleBtn = document.getElementById('detectTitle');
    this.detectDescriptionBtn = document.getElementById('detectDescription');
    this.detectTagsBtn = document.getElementById('detectTags');

    // Error text
    this.errorText = document.getElementById('errorText');
  }

  attachEventListeners() {
    // Main buttons
    this.openAppBtn?.addEventListener('click', () => this.openBookmarkApp());
    this.saveBookmarkBtn?.addEventListener('click', () => this.saveBookmark());
    this.quickSaveBtn?.addEventListener('click', () => this.quickSave());
    this.viewBookmarksBtn?.addEventListener('click', () => this.openBookmarkApp('/dashboard'));
    this.retryBtn?.addEventListener('click', () => this.init());

    // Detect buttons
    this.detectTitleBtn?.addEventListener('click', () => this.autoFillTitle());
    this.detectDescriptionBtn?.addEventListener('click', () => this.autoFillDescription());
    this.detectTagsBtn?.addEventListener('click', () => this.autoFillTags());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        this.quickSave();
      }
      if (e.key === 'Escape') {
        window.close();
      }
    });
  }

  async init() {
    try {
      this.showStatus('Initialisation...');

      // 1. Récupérer les informations de la page
      await this.getPageInfo();

      // 2. Vérifier l'authentification
      await this.checkAuthentication();

      // 3. Charger les collections si authentifié
      if (this.isAuthenticated) {
        await this.loadCollections();
        this.showBookmarkForm();
      } else {
        this.showLoginForm();
      }

    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      this.showError('Erreur lors de l\'initialisation');
    }
  }

  async getPageInfo() {
    try {
      // Obtenir l'onglet actif
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) {
        throw new Error('Impossible de récupérer l\'onglet actif');
      }

      // Envoyer un message au content script
      this.pageInfo = await chrome.tabs.sendMessage(tab.id, { action: 'getPageInfo' });

      if (!this.pageInfo) {
        // Fallback si le content script n'est pas disponible
        this.pageInfo = {
          title: tab.title || 'Page sans titre',
          url: tab.url || '',
          description: '',
          suggestedTags: [],
          favicon: tab.favIconUrl || ''
        };
      }

      console.log('📚 Informations de la page récupérées:', this.pageInfo);

    } catch (error) {
      console.warn('⚠️ Erreur récupération page info:', error);

      // Fallback basique
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.pageInfo = {
        title: tab?.title || 'Page sans titre',
        url: tab?.url || '',
        description: '',
        suggestedTags: []
      };
    }
  }

  async checkAuthentication() {
    try {
      // Vérifier si l'utilisateur est connecté à BookmarkApp
      const response = await this.makeRequest('/api/auth/check', 'GET');

      this.isAuthenticated = response.authenticated;
      console.log('🔐 Authentification:', this.isAuthenticated ? 'OK' : 'NOK');

    } catch (error) {
      console.warn('⚠️ Impossible de vérifier l\'authentification:', error);
      this.isAuthenticated = false;
    }
  }

  async loadCollections() {
    try {
      const response = await this.makeRequest('/api/collections', 'GET');
      this.collections = response.collections || [];

      // Peupler le select des collections
      this.collectionSelect.innerHTML = '<option value="">Sans collection</option>';
      this.collections.forEach(collection => {
        const option = document.createElement('option');
        option.value = collection.id;
        option.textContent = collection.name;
        this.collectionSelect.appendChild(option);
      });

    } catch (error) {
      console.warn('⚠️ Erreur chargement collections:', error);
    }
  }

  showStatus(text, showSpinner = true) {
    this.statusText.textContent = text;
    this.loadingSpinner.style.display = showSpinner ? 'block' : 'none';
  }

  showLoginForm() {
    this.hideAllForms();
    this.loginForm.style.display = 'block';
    this.showStatus('Connexion requise', false);
  }

  showBookmarkForm() {
    this.hideAllForms();
    this.bookmarkForm.style.display = 'block';
    this.showStatus('Prêt', false);

    // Pré-remplir les champs
    if (this.pageInfo) {
      this.titleInput.value = this.pageInfo.title || '';
      this.urlInput.value = this.pageInfo.url || '';
      this.descriptionInput.value = this.pageInfo.description || '';

      if (this.pageInfo.suggestedTags && this.pageInfo.suggestedTags.length > 0) {
        this.tagsInput.value = this.pageInfo.suggestedTags.slice(0, 5).join(', ');
      }
    }
  }

  showSuccess() {
    this.hideAllForms();
    this.successMessage.style.display = 'block';
    this.showStatus('Succès!', false);
  }

  showError(message) {
    this.hideAllForms();
    this.errorMessage.style.display = 'block';
    this.errorText.textContent = message;
    this.showStatus('Erreur', false);
  }

  hideAllForms() {
    this.loginForm.style.display = 'none';
    this.bookmarkForm.style.display = 'none';
    this.successMessage.style.display = 'none';
    this.errorMessage.style.display = 'none';
  }

  async saveBookmark() {
    try {
      this.setSaveButtonLoading(true);

      const bookmarkData = {
        title: this.titleInput.value.trim(),
        url: this.urlInput.value.trim(),
        description: this.descriptionInput.value.trim(),
        tags: this.tagsInput.value
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
        collectionId: this.collectionSelect.value || null,
        favicon: this.pageInfo?.favicon || null,
        metadata: {
          siteName: this.pageInfo?.siteName,
          author: this.pageInfo?.author,
          publishedDate: this.pageInfo?.publishedDate,
          image: this.pageInfo?.image
        }
      };

      if (!bookmarkData.title || !bookmarkData.url) {
        throw new Error('Le titre et l\'URL sont obligatoires');
      }

      const response = await this.makeRequest('/api/bookmarks', 'POST', bookmarkData);

      if (response.success) {
        this.showSuccess();
        this.notifyContentScript();
      } else {
        throw new Error(response.error || 'Erreur lors de la sauvegarde');
      }

    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      this.showError(error.message);
    } finally {
      this.setSaveButtonLoading(false);
    }
  }

  async quickSave() {
    try {
      // Pré-remplir avec les données détectées et sauvegarder immédiatement
      if (!this.pageInfo?.title || !this.pageInfo?.url) {
        throw new Error('Impossible de détecter les informations de la page');
      }

      const bookmarkData = {
        title: this.pageInfo.title,
        url: this.pageInfo.url,
        description: this.pageInfo.description || '',
        tags: this.pageInfo.suggestedTags?.slice(0, 3) || [],
        collectionId: null,
        favicon: this.pageInfo.favicon || null,
        metadata: {
          siteName: this.pageInfo.siteName,
          author: this.pageInfo.author,
          publishedDate: this.pageInfo.publishedDate,
          image: this.pageInfo.image
        }
      };

      this.setSaveButtonLoading(true);

      const response = await this.makeRequest('/api/bookmarks', 'POST', bookmarkData);

      if (response.success) {
        this.showSuccess();
        this.notifyContentScript();
      } else {
        throw new Error(response.error || 'Erreur lors de la sauvegarde rapide');
      }

    } catch (error) {
      console.error('❌ Erreur sauvegarde rapide:', error);
      this.showError(error.message);
    } finally {
      this.setSaveButtonLoading(false);
    }
  }

  autoFillTitle() {
    if (this.pageInfo?.title) {
      this.titleInput.value = this.pageInfo.title;
      this.titleInput.focus();
    }
  }

  autoFillDescription() {
    if (this.pageInfo?.description) {
      this.descriptionInput.value = this.pageInfo.description;
      this.descriptionInput.focus();
    }
  }

  autoFillTags() {
    if (this.pageInfo?.suggestedTags && this.pageInfo.suggestedTags.length > 0) {
      this.tagsInput.value = this.pageInfo.suggestedTags.slice(0, 5).join(', ');
      this.tagsInput.focus();
    }
  }

  setSaveButtonLoading(loading) {
    const btnText = this.saveBookmarkBtn.querySelector('.btn-text');
    const btnSpinner = this.saveBookmarkBtn.querySelector('.btn-spinner');

    if (loading) {
      btnText.style.display = 'none';
      btnSpinner.style.display = 'block';
      this.saveBookmarkBtn.disabled = true;
      this.quickSaveBtn.disabled = true;
    } else {
      btnText.style.display = 'block';
      btnSpinner.style.display = 'none';
      this.saveBookmarkBtn.disabled = false;
      this.quickSaveBtn.disabled = false;
    }
  }

  async notifyContentScript() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.tabs.sendMessage(tab.id, { action: 'highlightSaved' });
      }
    } catch (error) {
      console.warn('⚠️ Impossible de notifier le content script:', error);
    }
  }

  openBookmarkApp(path = '') {
    const url = `${this.bookmarkAppUrl}${path}`;
    chrome.tabs.create({ url });
    window.close();
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    const url = `${this.bookmarkAppUrl}${endpoint}`;

    const options = {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Initialiser l'extension quand le popup se charge
document.addEventListener('DOMContentLoaded', () => {
  new BookmarkExtension();
});

console.log('📚 BookmarkApp Extension: Popup script initialisé');