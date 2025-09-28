// Utilitaires de nettoyage et sanitisation des données

// Nettoyage HTML (protection contre XSS)
export const sanitizeHTML = (input) => {
  if (!input || typeof input !== 'string') return '';

  // Échapper les caractères dangereux
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Nettoyage des URLs
export const sanitizeURL = (url) => {
  if (!url || typeof url !== 'string') return '';

  // Supprimer les espaces et caractères invisibles
  url = url.trim().replace(/[\u0000-\u001f\u007f-\u009f]/g, '');

  // Vérifier et normaliser le protocole
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  try {
    const urlObj = new URL(url);

    // Supprimer les fragments dangereux
    urlObj.hash = '';

    // Nettoyer les paramètres de requête suspects
    const suspiciousParams = ['javascript', 'vbscript', 'onload', 'onerror'];
    for (const [key, value] of urlObj.searchParams) {
      if (suspiciousParams.some(param => key.toLowerCase().includes(param) || value.toLowerCase().includes(param))) {
        urlObj.searchParams.delete(key);
      }
    }

    return urlObj.toString();
  } catch {
    return '';
  }
};

// Nettoyage du texte général
export const sanitizeText = (text, options = {}) => {
  if (!text || typeof text !== 'string') return '';

  const {
    maxLength = 1000,
    removeHTML = true,
    removeScripts = true,
    normalizeWhitespace = true
  } = options;

  let sanitized = text;

  // Supprimer les scripts et événements JavaScript
  if (removeScripts) {
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*["']?[^"'>]*["']?/gi, '');
    sanitized = sanitized.replace(/javascript:\s*[^"']*/gi, '');
  }

  // Supprimer les balises HTML
  if (removeHTML) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }

  // Normaliser les espaces
  if (normalizeWhitespace) {
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
  }

  // Limiter la longueur
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim();
  }

  return sanitized;
};

// Nettoyage des noms de fichiers
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') return '';

  return filename
    // Supprimer les caractères dangereux
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    // Supprimer les points consécutifs
    .replace(/\.{2,}/g, '.')
    // Supprimer les espaces en début/fin
    .trim()
    // Limiter la longueur
    .substring(0, 255);
};

// Nettoyage des tags
export const sanitizeTags = (tags) => {
  if (!tags) return [];

  const tagArray = Array.isArray(tags) ? tags : tags.split(',');

  return tagArray
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0)
    .filter(tag => /^[a-zA-Z0-9\-_\u00C0-\u017F]+$/.test(tag))
    .filter(tag => tag.length <= 30)
    .slice(0, 10); // Limiter à 10 tags
};

// Nettoyage des métadonnées utilisateur
export const sanitizeUserMetadata = (metadata) => {
  if (!metadata || typeof metadata !== 'object') return {};

  const allowed = ['full_name', 'avatar_url', 'display_name', 'bio', 'website'];
  const sanitized = {};

  for (const key of allowed) {
    if (metadata[key]) {
      if (key === 'avatar_url' || key === 'website') {
        sanitized[key] = sanitizeURL(metadata[key]);
      } else {
        sanitized[key] = sanitizeText(metadata[key], { maxLength: 200 });
      }
    }
  }

  return sanitized;
};

// Nettoyage des données de formulaire
export const sanitizeFormData = (formData) => {
  if (!formData || typeof formData !== 'object') return {};

  const sanitized = {};

  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeText(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

// Protection contre l'injection SQL (pour les requêtes custom)
export const escapeSQLString = (str) => {
  if (!str || typeof str !== 'string') return '';

  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
};

// Génération de tokens sécurisés
export const generateSecureToken = (length = 32) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Masquage des données sensibles pour les logs
export const maskSensitiveData = (data, sensitiveFields = ['password', 'token', 'secret', 'key']) => {
  if (!data || typeof data !== 'object') return data;

  const masked = { ...data };

  for (const field of sensitiveFields) {
    if (masked[field]) {
      masked[field] = '*'.repeat(8);
    }
  }

  return masked;
};