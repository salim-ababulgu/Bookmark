// API pour l'extension browser - Mock API Server (Migration Supabase en cours)
import { getUserCollections, addBookmark, getUserBookmarks } from '../services/supabaseDataService';
import { supabase } from '../services/supabase';

console.log('📚 Extension API: Module chargé (Supabase)');

class ExtensionAPI {
  constructor() {
    this.setupRoutes();
  }

  setupRoutes() {
    // Simuler un serveur API pour l'extension
    // En production, cela devrait être un vrai serveur Express.js

    if (typeof window !== 'undefined') {
      // Exposer les fonctions API globalement pour l'extension
      window.BookmarkAppAPI = {
        checkAuth: this.checkAuth.bind(this),
        getCollections: this.getCollections.bind(this),
        createBookmark: this.createBookmark.bind(this),
        health: this.health.bind(this)
      };

      // Écouter les messages de l'extension via postMessage
      window.addEventListener('message', this.handleExtensionMessage.bind(this));

      console.log('📚 Extension API: Routes configurées');
    }
  }

  async handleExtensionMessage(event) {
    // Vérifier l'origine pour la sécurité
    if (event.origin !== window.location.origin) {
      return;
    }

    const { action, data, requestId } = event.data;

    try {
      let response;

      switch (action) {
        case 'checkAuth':
          response = await this.checkAuth();
          break;

        case 'getCollections':
          response = await this.getCollections();
          break;

        case 'createBookmark':
          response = await this.createBookmark(data);
          break;

        case 'health':
          response = await this.health();
          break;

        default:
          response = { success: false, error: 'Action non reconnue' };
      }

      // Renvoyer la réponse
      event.source.postMessage({
        requestId,
        response
      }, event.origin);

    } catch (error) {
      console.error('❌ Erreur API extension:', error);
      event.source.postMessage({
        requestId,
        response: { success: false, error: error.message }
      }, event.origin);
    }
  }

  async checkAuth() {
    try {
      // Vérifier avec Supabase
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ Erreur vérification auth Supabase:', error);
        return {
          success: false,
          authenticated: false,
          error: error.message
        };
      }

      const isAuthenticated = !!(session && session.user);

      return {
        success: true,
        authenticated: isAuthenticated,
        user: isAuthenticated ? {
          id: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || null
        } : null
      };

    } catch (error) {
      console.error('❌ Erreur vérification auth:', error);
      return {
        success: false,
        authenticated: false,
        error: error.message
      };
    }
  }

  async getCollections() {
    try {
      const authCheck = await this.checkAuth();

      if (!authCheck.authenticated) {
        return {
          success: false,
          error: 'Non authentifié',
          collections: []
        };
      }

      const userId = authCheck.user.id;
      const result = await getUserCollections(userId);

      return {
        success: result.success,
        collections: result.data || [],
        error: result.error
      };

    } catch (error) {
      console.error('❌ Erreur récupération collections:', error);
      return {
        success: false,
        error: error.message,
        collections: []
      };
    }
  }

  async createBookmark(bookmarkData) {
    try {
      const authCheck = await this.checkAuth();

      if (!authCheck.authenticated) {
        return {
          success: false,
          error: 'Non authentifié'
        };
      }

      const userId = authCheck.user.id;

      // Valider les données
      if (!bookmarkData.title || !bookmarkData.url) {
        return {
          success: false,
          error: 'Le titre et l\'URL sont requis'
        };
      }

      // Vérifier si le favori existe déjà
      const existingResult = await getUserBookmarks(userId);
      if (existingResult.success) {
        const existing = existingResult.data.find(b => b.url === bookmarkData.url);
        if (existing) {
          return {
            success: false,
            error: 'Ce favori existe déjà',
            existing: true
          };
        }
      }

      // Créer le nouveau favori
      const newBookmark = {
        title: bookmarkData.title.substring(0, 200),
        url: bookmarkData.url,
        description: bookmarkData.description || '',
        tags: Array.isArray(bookmarkData.tags) ? bookmarkData.tags.slice(0, 10) : [],
        collection_id: bookmarkData.collectionId || null,
        favicon: bookmarkData.favicon || null,
        metadata: {
          siteName: bookmarkData.metadata?.siteName || '',
          author: bookmarkData.metadata?.author || '',
          publishedDate: bookmarkData.metadata?.publishedDate || null,
          image: bookmarkData.metadata?.image || null,
          addedViaExtension: true
        }
      };

      const result = await addBookmark(newBookmark, userId);

      if (result.success) {
        console.log('✅ Favori créé via extension:', result.data.id);
        return {
          success: true,
          bookmark: result.data
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }

    } catch (error) {
      console.error('❌ Erreur création favori:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async health() {
    try {
      return {
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0 (Supabase)'
      };
    } catch (error) {
      return {
        success: false,
        status: 'ERROR',
        error: error.message
      };
    }
  }
}

// Initialiser l'API
const extensionAPI = new ExtensionAPI();

export default extensionAPI;