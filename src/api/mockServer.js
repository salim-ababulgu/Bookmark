// Mock Server pour l'extension - Intercepteur de requêtes fetch
console.log('📚 Mock Server: Module chargé');

class MockServer {
  constructor() {
    this.originalFetch = null;
    this.isActive = false;
    this.routes = new Map();
    this.setupRoutes();
  }

  start() {
    if (this.isActive) return;

    console.log('🚀 Mock Server: Démarrage');

    this.originalFetch = window.fetch;
    window.fetch = this.mockFetch.bind(this);
    this.isActive = true;

    console.log('✅ Mock Server: Actif');
  }

  stop() {
    if (!this.isActive || !this.originalFetch) return;

    console.log('⏹️ Mock Server: Arrêt');

    window.fetch = this.originalFetch;
    this.originalFetch = null;
    this.isActive = false;

    console.log('✅ Mock Server: Inactif');
  }

  setupRoutes() {
    // Route de vérification de l'authentification
    this.routes.set('GET /api/auth/check', async () => {
      try {
        const authState = JSON.parse(localStorage.getItem('auth') || '{}');
        const isAuthenticated = !!(authState.user && authState.user.uid);

        return {
          status: 200,
          data: {
            authenticated: isAuthenticated,
            user: isAuthenticated ? {
              uid: authState.user.uid,
              email: authState.user.email,
              displayName: authState.user.displayName
            } : null
          }
        };
      } catch (error) {
        return {
          status: 500,
          data: { error: error.message }
        };
      }
    });

    // Route de récupération des collections
    this.routes.set('GET /api/collections', async () => {
      try {
        // Simuler la récupération depuis Firestore via l'API extension
        const response = await window.BookmarkAppAPI?.getCollections();

        if (response?.success) {
          return {
            status: 200,
            data: { collections: response.collections }
          };
        } else {
          return {
            status: 401,
            data: { error: response?.error || 'Non authentifié' }
          };
        }
      } catch (error) {
        return {
          status: 500,
          data: { error: error.message }
        };
      }
    });

    // Route de création de favoris
    this.routes.set('POST /api/bookmarks', async (body) => {
      try {
        // Utiliser l'API extension pour créer le favori
        const response = await window.BookmarkAppAPI?.createBookmark(body);

        if (response?.success) {
          return {
            status: 201,
            data: {
              success: true,
              bookmark: response.bookmark
            }
          };
        } else {
          return {
            status: 400,
            data: {
              success: false,
              error: response?.error || 'Erreur lors de la création'
            }
          };
        }
      } catch (error) {
        return {
          status: 500,
          data: {
            success: false,
            error: error.message
          }
        };
      }
    });

    // Route de santé
    this.routes.set('GET /api/health', async () => {
      return {
        status: 200,
        data: {
          status: 'OK',
          timestamp: new Date().toISOString(),
          server: 'Mock Server for BookmarkApp Extension'
        }
      };
    });

    // Route de synchronisation
    this.routes.set('POST /api/sync', async () => {
      return {
        status: 200,
        data: {
          success: true,
          synced: true,
          timestamp: new Date().toISOString()
        }
      };
    });

    console.log('📚 Mock Server: Routes configurées');
  }

  async mockFetch(url, options = {}) {
    // Vérifier si c'est une requête vers localhost:5174/api
    const targetUrl = new URL(url, window.location.origin);

    if (targetUrl.hostname === 'localhost' &&
        targetUrl.port === '5174' &&
        targetUrl.pathname.startsWith('/api/')) {

      console.log('🎯 Mock Server: Intercepté', options.method || 'GET', targetUrl.pathname);

      const method = options.method || 'GET';
      const routeKey = `${method} ${targetUrl.pathname}`;
      const handler = this.routes.get(routeKey);

      if (handler) {
        try {
          let body = null;
          if (options.body) {
            body = JSON.parse(options.body);
          }

          const result = await handler(body);

          // Simuler un délai réseau
          await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

          return new Response(JSON.stringify(result.data), {
            status: result.status,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
          });

        } catch (error) {
          console.error('❌ Mock Server: Erreur handler', error);

          return new Response(JSON.stringify({
            success: false,
            error: error.message
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } else {
        console.warn('⚠️ Mock Server: Route non trouvée', routeKey);

        return new Response(JSON.stringify({
          success: false,
          error: 'Route non trouvée'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Passer les autres requêtes au fetch original
    return this.originalFetch(url, options);
  }
}

// Instance globale du mock server
const mockServer = new MockServer();

// Démarrer automatiquement en développement
if (window.location.hostname === 'localhost') {
  mockServer.start();

  // Arrêter proprement lors du déchargement de la page
  window.addEventListener('beforeunload', () => {
    mockServer.stop();
  });
}

export default mockServer;