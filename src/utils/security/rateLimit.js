// Système de limitation de taux côté client

class RateLimiter {
  constructor() {
    this.buckets = new Map();
    this.globalBucket = this.createBucket(100, 60000); // 100 requêtes par minute globalement
  }

  // Créer un bucket de tokens
  createBucket(capacity, refillRate) {
    return {
      capacity,
      tokens: capacity,
      lastRefill: Date.now(),
      refillRate // ms pour remplir complètement
    };
  }

  // Remplir les tokens
  refillBucket(bucket) {
    const now = Date.now();
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor((timePassed / bucket.refillRate) * bucket.capacity);

    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  // Vérifier si une action est autorisée
  isAllowed(key, cost = 1, customLimits = {}) {
    const {
      capacity = 10,
      refillRate = 60000, // 1 minute
      burst = 5
    } = customLimits;

    // Vérifier le bucket global
    this.refillBucket(this.globalBucket);
    if (this.globalBucket.tokens < cost) {
      return {
        allowed: false,
        reason: 'global_rate_limit',
        retryAfter: Math.ceil((cost - this.globalBucket.tokens) * (this.globalBucket.refillRate / this.globalBucket.capacity))
      };
    }

    // Créer ou récupérer le bucket spécifique
    if (!this.buckets.has(key)) {
      this.buckets.set(key, this.createBucket(capacity, refillRate));
    }

    const bucket = this.buckets.get(key);
    this.refillBucket(bucket);

    // Vérifier si l'action est autorisée
    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      this.globalBucket.tokens -= cost;

      return {
        allowed: true,
        remaining: bucket.tokens,
        resetTime: bucket.lastRefill + bucket.refillRate
      };
    }

    return {
      allowed: false,
      reason: 'rate_limit_exceeded',
      retryAfter: Math.ceil((cost - bucket.tokens) * (bucket.refillRate / bucket.capacity)),
      remaining: bucket.tokens
    };
  }

  // Nettoyer les anciens buckets
  cleanup() {
    const now = Date.now();
    const expireTime = 5 * 60 * 1000; // 5 minutes

    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > expireTime) {
        this.buckets.delete(key);
      }
    }
  }

  // Réinitialiser un bucket spécifique
  reset(key) {
    this.buckets.delete(key);
  }

  // Obtenir les stats d'un bucket
  getStats(key) {
    if (!this.buckets.has(key)) {
      return null;
    }

    const bucket = this.buckets.get(key);
    this.refillBucket(bucket);

    return {
      tokens: bucket.tokens,
      capacity: bucket.capacity,
      percentage: (bucket.tokens / bucket.capacity) * 100,
      nextRefill: bucket.lastRefill + bucket.refillRate
    };
  }
}

// Instance globale
export const rateLimiter = new RateLimiter();

// Nettoyer automatiquement les anciens buckets
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000); // Toutes les 5 minutes

// Limites prédéfinies pour différentes actions
export const RATE_LIMITS = {
  // Authentification
  LOGIN: { capacity: 5, refillRate: 15 * 60 * 1000 }, // 5 tentatives par 15 minutes
  REGISTER: { capacity: 3, refillRate: 60 * 60 * 1000 }, // 3 tentatives par heure
  PASSWORD_RESET: { capacity: 3, refillRate: 60 * 60 * 1000 }, // 3 tentatives par heure

  // API
  API_GENERAL: { capacity: 60, refillRate: 60 * 1000 }, // 60 requêtes par minute
  API_HEAVY: { capacity: 10, refillRate: 60 * 1000 }, // 10 requêtes lourdes par minute

  // Actions utilisateur
  ADD_BOOKMARK: { capacity: 20, refillRate: 60 * 1000 }, // 20 favoris par minute
  UPDATE_BOOKMARK: { capacity: 30, refillRate: 60 * 1000 }, // 30 mises à jour par minute
  DELETE_BOOKMARK: { capacity: 15, refillRate: 60 * 1000 }, // 15 suppressions par minute

  // Recherche
  SEARCH: { capacity: 100, refillRate: 60 * 1000 }, // 100 recherches par minute

  // Upload
  UPLOAD: { capacity: 5, refillRate: 5 * 60 * 1000 } // 5 uploads par 5 minutes
};

// Helper pour vérifier les limites avec gestion d'erreur
export const checkRateLimit = (action, identifier, cost = 1) => {
  try {
    const limits = RATE_LIMITS[action] || RATE_LIMITS.API_GENERAL;
    const key = `${action}:${identifier}`;

    return rateLimiter.isAllowed(key, cost, limits);
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // En cas d'erreur, autoriser l'action mais logger
    return { allowed: true, error: true };
  }
};

// Middleware pour les requêtes
export const withRateLimit = (action) => {
  return async (request, options = {}) => {
    const identifier = options.identifier || 'anonymous';

    const check = checkRateLimit(action, identifier);

    if (!check.allowed) {
      const error = new Error('Rate limit exceeded');
      error.code = 'RATE_LIMIT_EXCEEDED';
      error.retryAfter = check.retryAfter;
      error.reason = check.reason;
      throw error;
    }

    return request();
  };
};

// Hook React pour vérifier les limites
export const useRateLimit = (action, identifier) => {
  const checkLimit = (cost = 1) => {
    return checkRateLimit(action, identifier, cost);
  };

  const getStats = () => {
    const key = `${action}:${identifier}`;
    return rateLimiter.getStats(key);
  };

  const reset = () => {
    const key = `${action}:${identifier}`;
    rateLimiter.reset(key);
  };

  return {
    checkLimit,
    getStats,
    reset
  };
};