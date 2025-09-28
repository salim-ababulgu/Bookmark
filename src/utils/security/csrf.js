// Protection CSRF (Cross-Site Request Forgery)

class CSRFProtection {
  constructor() {
    this.tokenKey = 'csrf_token';
    this.headerKey = 'X-CSRF-Token';
    this.currentToken = null;
  }

  // Générer un token CSRF
  generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

    this.currentToken = token;
    sessionStorage.setItem(this.tokenKey, token);

    return token;
  }

  // Obtenir le token actuel
  getToken() {
    if (!this.currentToken) {
      this.currentToken = sessionStorage.getItem(this.tokenKey);
    }

    if (!this.currentToken) {
      return this.generateToken();
    }

    return this.currentToken;
  }

  // Valider un token CSRF
  validateToken(token) {
    const currentToken = this.getToken();
    return token === currentToken;
  }

  // Ajouter le token CSRF aux headers d'une requête
  addTokenToHeaders(headers = {}) {
    return {
      ...headers,
      [this.headerKey]: this.getToken()
    };
  }

  // Middleware pour les requêtes fetch
  secureRequest(url, options = {}) {
    const secureOptions = {
      ...options,
      headers: this.addTokenToHeaders(options.headers)
    };

    return fetch(url, secureOptions);
  }

  // Créer un champ caché pour les formulaires
  createHiddenField() {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'csrf_token';
    input.value = this.getToken();
    return input;
  }

  // Ajouter le token à tous les formulaires de la page
  protectAllForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      // Vérifier si le token n'est pas déjà présent
      if (!form.querySelector('input[name="csrf_token"]')) {
        form.appendChild(this.createHiddenField());
      }
    });
  }

  // Observer pour les nouveaux formulaires
  startFormProtection() {
    // Protection des formulaires existants
    this.protectAllForms();

    // Observer pour les nouveaux formulaires
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Nouveau formulaire ajouté
            if (node.tagName === 'FORM') {
              if (!node.querySelector('input[name="csrf_token"]')) {
                node.appendChild(this.createHiddenField());
              }
            }
            // Formulaires dans les nouveaux éléments
            const forms = node.querySelectorAll && node.querySelectorAll('form');
            if (forms) {
              forms.forEach(form => {
                if (!form.querySelector('input[name="csrf_token"]')) {
                  form.appendChild(this.createHiddenField());
                }
              });
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return observer;
  }

  // Rotation automatique du token
  rotateToken(intervalMs = 30 * 60 * 1000) { // 30 minutes par défaut
    setInterval(() => {
      this.generateToken();
      this.protectAllForms(); // Mettre à jour tous les formulaires
    }, intervalMs);
  }

  // Nettoyer le token
  clearToken() {
    this.currentToken = null;
    sessionStorage.removeItem(this.tokenKey);
  }
}

// Instance globale
export const csrfProtection = new CSRFProtection();

// Hook React pour l'utilisation dans les composants
export const useCSRFProtection = () => {
  const getToken = () => csrfProtection.getToken();
  const validateToken = (token) => csrfProtection.validateToken(token);
  const secureRequest = (url, options) => csrfProtection.secureRequest(url, options);

  return {
    getToken,
    validateToken,
    secureRequest,
    addTokenToHeaders: (headers) => csrfProtection.addTokenToHeaders(headers)
  };
};

// Middleware automatique pour toutes les requêtes
export const setupCSRFMiddleware = () => {
  // Intercepter toutes les requêtes fetch
  const originalFetch = window.fetch;

  window.fetch = function(url, options = {}) {
    // Ajouter le token CSRF aux requêtes POST, PUT, DELETE, PATCH
    const method = options.method || 'GET';
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
      options.headers = csrfProtection.addTokenToHeaders(options.headers);
    }

    return originalFetch.call(this, url, options);
  };

  // Démarrer la protection des formulaires
  csrfProtection.startFormProtection();

  // Rotation automatique du token
  csrfProtection.rotateToken();
};

// Protection SameSite pour les cookies
export const SecureCookie = {
  // Définir un cookie sécurisé
  set(name, value, options = {}) {
    const defaults = {
      secure: true, // HTTPS uniquement
      sameSite: 'Strict', // Protection CSRF
      httpOnly: false, // Accessible via JS (pour les tokens)
      maxAge: 3600 // 1 heure par défaut
    };

    const cookieOptions = { ...defaults, ...options };

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (cookieOptions.maxAge) {
      cookieString += `; Max-Age=${cookieOptions.maxAge}`;
    }

    if (cookieOptions.secure) {
      cookieString += '; Secure';
    }

    if (cookieOptions.sameSite) {
      cookieString += `; SameSite=${cookieOptions.sameSite}`;
    }

    if (cookieOptions.httpOnly) {
      cookieString += '; HttpOnly';
    }

    if (cookieOptions.path) {
      cookieString += `; Path=${cookieOptions.path}`;
    }

    document.cookie = cookieString;
  },

  // Obtenir un cookie
  get(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${encodeURIComponent(name)}=`);
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop().split(';').shift());
    }
    return null;
  },

  // Supprimer un cookie
  remove(name, options = {}) {
    this.set(name, '', { ...options, maxAge: -1 });
  }
};

// Validation d'origine pour les requêtes
export const OriginValidator = {
  // Valider l'origine de la requête
  validateOrigin(request) {
    const origin = request.headers.get('Origin');
    const referer = request.headers.get('Referer');
    const host = request.headers.get('Host');

    // Liste des origines autorisées
    const allowedOrigins = [
      window.location.origin,
      'https://localhost:3000',
      'https://127.0.0.1:3000'
    ];

    // Vérifier l'origine
    if (origin && !allowedOrigins.includes(origin)) {
      return { valid: false, reason: 'Invalid origin' };
    }

    // Vérifier le referer si pas d'origine
    if (!origin && referer) {
      const refererUrl = new URL(referer);
      if (!allowedOrigins.includes(refererUrl.origin)) {
        return { valid: false, reason: 'Invalid referer' };
      }
    }

    return { valid: true };
  },

  // Middleware pour valider l'origine
  validateRequestOrigin() {
    // Intercepter les requêtes et valider l'origine
    const originalFetch = window.fetch;

    window.fetch = function(url, options = {}) {
      // Créer un objet Request pour la validation
      const request = new Request(url, options);

      // Valider l'origine pour les requêtes sensibles
      const method = options.method || 'GET';
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
        const validation = OriginValidator.validateOrigin(request);
        if (!validation.valid) {
          return Promise.reject(new Error(`CSRF Protection: ${validation.reason}`));
        }
      }

      return originalFetch.call(this, url, options);
    };
  }
};

// Configuration complète de la protection CSRF
export const initializeCSRFProtection = (options = {}) => {
  const config = {
    enableFormProtection: true,
    enableFetchMiddleware: true,
    enableOriginValidation: true,
    tokenRotationInterval: 30 * 60 * 1000, // 30 minutes
    ...options
  };

  // Démarrer la protection des formulaires
  if (config.enableFormProtection) {
    csrfProtection.startFormProtection();
  }

  // Configurer le middleware fetch
  if (config.enableFetchMiddleware) {
    setupCSRFMiddleware();
  }

  // Validation d'origine
  if (config.enableOriginValidation) {
    OriginValidator.validateRequestOrigin();
  }

  // Rotation du token
  if (config.tokenRotationInterval > 0) {
    csrfProtection.rotateToken(config.tokenRotationInterval);
  }

  console.log('🔒 CSRF Protection initialized');
};