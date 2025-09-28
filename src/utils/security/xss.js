// Protection XSS (Cross-Site Scripting) avancée

class XSSProtection {
  constructor() {
    this.dangerousPatterns = [
      // Scripts
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /onmouseover\s*=/gi,
      /onfocus\s*=/gi,
      /onblur\s*=/gi,
      /onchange\s*=/gi,
      /onsubmit\s*=/gi,

      // Iframes et objets
      /<iframe\b[^>]*>/gi,
      /<object\b[^>]*>/gi,
      /<embed\b[^>]*>/gi,
      /<applet\b[^>]*>/gi,
      /<form\b[^>]*>/gi,

      // Meta et liens suspects
      /<meta\b[^>]*>/gi,
      /<link\b[^>]*>/gi,
      /<base\b[^>]*>/gi,

      // Expressions dangereuses
      /expression\s*\(/gi,
      /eval\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi,
      /Function\s*\(/gi,

      // Data URLs suspects
      /data:\s*text\/html/gi,
      /data:\s*application\/javascript/gi,

      // Autres vecteurs
      /style\s*=.*expression/gi,
      /style\s*=.*javascript/gi,
      /style\s*=.*vbscript/gi,
      /style\s*=.*behavior/gi
    ];

    this.allowedTags = [
      'p', 'br', 'strong', 'em', 'u', 'i', 'b', 'span', 'div',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'a', 'img'
    ];

    this.allowedAttributes = {
      'a': ['href', 'title', 'target'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      'span': ['class'],
      'div': ['class'],
      'p': ['class'],
      'h1': ['class'], 'h2': ['class'], 'h3': ['class'],
      'h4': ['class'], 'h5': ['class'], 'h6': ['class']
    };
  }

  // Nettoyer le HTML de manière stricte
  sanitizeHTML(html) {
    if (!html || typeof html !== 'string') return '';

    // Décoder les entités HTML pour éviter les contournements
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    let decodedHtml = textarea.value;

    // Supprimer tous les patterns dangereux
    for (const pattern of this.dangerousPatterns) {
      decodedHtml = decodedHtml.replace(pattern, '');
    }

    // Parser avec DOMParser pour nettoyer
    const parser = new DOMParser();
    const doc = parser.parseFromString(decodedHtml, 'text/html');

    // Nettoyer récursivement
    this.cleanNode(doc.body);

    return doc.body.innerHTML;
  }

  // Nettoyer un nœud DOM récursivement
  cleanNode(node) {
    if (!node) return;

    // Traiter les nœuds enfants en premier
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        this.cleanElement(child);
      } else if (child.nodeType === Node.TEXT_NODE) {
        // Vérifier le contenu texte pour des scripts cachés
        if (this.containsDangerousContent(child.textContent)) {
          child.textContent = this.sanitizeText(child.textContent);
        }
      }
    }
  }

  // Nettoyer un élément spécifique
  cleanElement(element) {
    const tagName = element.tagName.toLowerCase();

    // Supprimer les balises non autorisées
    if (!this.allowedTags.includes(tagName)) {
      element.parentNode.removeChild(element);
      return;
    }

    // Nettoyer les attributs
    const allowedAttrs = this.allowedAttributes[tagName] || [];
    const attrs = Array.from(element.attributes);

    for (const attr of attrs) {
      if (!allowedAttrs.includes(attr.name.toLowerCase())) {
        element.removeAttribute(attr.name);
      } else {
        // Valider la valeur de l'attribut
        const cleanValue = this.sanitizeAttributeValue(attr.name, attr.value);
        if (cleanValue !== attr.value) {
          element.setAttribute(attr.name, cleanValue);
        }
      }
    }

    // Nettoyer récursivement les enfants
    this.cleanNode(element);
  }

  // Valider et nettoyer la valeur d'un attribut
  sanitizeAttributeValue(attrName, value) {
    if (!value) return '';

    // URLs spéciales pour href et src
    if (attrName === 'href' || attrName === 'src') {
      return this.sanitizeURL(value);
    }

    // Supprimer les scripts des valeurs d'attributs
    let cleanValue = value;
    for (const pattern of this.dangerousPatterns) {
      cleanValue = cleanValue.replace(pattern, '');
    }

    return cleanValue;
  }

  // Nettoyer les URLs
  sanitizeURL(url) {
    if (!url) return '';

    const trimmedUrl = url.trim().toLowerCase();

    // Bloquer les schémas dangereux
    const dangerousSchemes = [
      'javascript:', 'vbscript:', 'data:', 'about:', 'chrome:', 'file:'
    ];

    for (const scheme of dangerousSchemes) {
      if (trimmedUrl.startsWith(scheme)) {
        return '#';
      }
    }

    // Autoriser seulement http, https, mailto, tel
    const allowedSchemes = ['http:', 'https:', 'mailto:', 'tel:', '#', '/'];
    const hasAllowedScheme = allowedSchemes.some(scheme =>
      trimmedUrl.startsWith(scheme) || !trimmedUrl.includes(':')
    );

    if (!hasAllowedScheme) {
      return '#';
    }

    return url;
  }

  // Nettoyer le texte simple
  sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';

    // Encoder les caractères HTML spéciaux
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Vérifier si le contenu contient des éléments dangereux
  containsDangerousContent(content) {
    if (!content) return false;

    return this.dangerousPatterns.some(pattern => pattern.test(content));
  }

  // Nettoyer les données d'un formulaire
  sanitizeFormData(formData) {
    const cleaned = {};

    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        cleaned[key] = this.sanitizeText(value);
      } else if (Array.isArray(value)) {
        cleaned[key] = value.map(item =>
          typeof item === 'string' ? this.sanitizeText(item) : item
        );
      } else {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }

  // Valider et nettoyer une URL complète
  validateAndSanitizeURL(url) {
    try {
      const urlObj = new URL(url);

      // Vérifier le protocole
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { valid: false, error: 'Protocole non autorisé' };
      }

      // Vérifier les caractères suspects dans l'URL
      if (this.containsDangerousContent(url)) {
        return { valid: false, error: 'Contenu dangereux détecté dans l\'URL' };
      }

      // Nettoyer les paramètres de requête
      const cleanParams = new URLSearchParams();
      for (const [key, value] of urlObj.searchParams) {
        const cleanKey = this.sanitizeText(key);
        const cleanValue = this.sanitizeText(value);
        cleanParams.append(cleanKey, cleanValue);
      }

      urlObj.search = cleanParams.toString();

      return {
        valid: true,
        sanitized: urlObj.toString(),
        originalHost: urlObj.hostname
      };

    } catch (error) {
      return { valid: false, error: 'URL invalide' };
    }
  }

  // Middleware pour nettoyer automatiquement les réponses
  interceptResponses() {
    const originalFetch = window.fetch;

    window.fetch = async function(...args) {
      const response = await originalFetch.apply(this, args);

      // Clone pour pouvoir lire le contenu
      const clonedResponse = response.clone();

      try {
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('text/html')) {
          const html = await clonedResponse.text();
          const sanitizedHTML = xssProtection.sanitizeHTML(html);

          // Retourner une nouvelle réponse avec le contenu nettoyé
          return new Response(sanitizedHTML, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
        }
      } catch (error) {
        console.warn('XSS Protection: Could not sanitize response', error);
      }

      return response;
    };
  }

  // Surveiller les modifications du DOM
  startDOMMonitoring() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.scanAndCleanElement(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['onclick', 'onload', 'onerror', 'onmouseover']
    });

    return observer;
  }

  // Scanner et nettoyer un élément ajouté au DOM
  scanAndCleanElement(element) {
    // Vérifier les attributs dangereux
    const dangerousAttrs = [
      'onclick', 'onload', 'onerror', 'onmouseover', 'onfocus',
      'onblur', 'onchange', 'onsubmit', 'onkeydown', 'onkeyup'
    ];

    dangerousAttrs.forEach(attr => {
      if (element.hasAttribute(attr)) {
        console.warn(`XSS Protection: Removed dangerous attribute ${attr}`);
        element.removeAttribute(attr);
      }
    });

    // Nettoyer les éléments enfants
    const childElements = element.querySelectorAll('*');
    childElements.forEach(child => {
      dangerousAttrs.forEach(attr => {
        if (child.hasAttribute(attr)) {
          console.warn(`XSS Protection: Removed dangerous attribute ${attr} from child`);
          child.removeAttribute(attr);
        }
      });
    });
  }
}

// Instance globale
export const xssProtection = new XSSProtection();

// Hook React pour la protection XSS
export const useXSSProtection = () => {
  const sanitizeHTML = (html) => xssProtection.sanitizeHTML(html);
  const sanitizeText = (text) => xssProtection.sanitizeText(text);
  const sanitizeURL = (url) => xssProtection.sanitizeURL(url);
  const sanitizeFormData = (data) => xssProtection.sanitizeFormData(data);

  return {
    sanitizeHTML,
    sanitizeText,
    sanitizeURL,
    sanitizeFormData,
    validateURL: (url) => xssProtection.validateAndSanitizeURL(url)
  };
};

// Configuration CSP (Content Security Policy) côté client
export const CSPHelper = {
  // Générer un nonce pour les scripts inline
  generateNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  },

  // Vérifier si CSP est actif
  isCSPActive() {
    const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    return metaTags.length > 0;
  },

  // Suggérer une politique CSP
  suggestCSPPolicy() {
    return {
      'default-src': "'self'",
      'script-src': "'self' 'unsafe-eval'", // Éviter 'unsafe-inline'
      'style-src': "'self' 'unsafe-inline'", // Pour les CSS frameworks
      'img-src': "'self' data: https:",
      'font-src': "'self' https:",
      'connect-src': "'self' https:",
      'frame-src': "'none'",
      'object-src': "'none'",
      'base-uri': "'self'",
      'form-action': "'self'"
    };
  },

  // Créer une balise meta CSP
  createCSPMeta(policies) {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = Object.entries(policies)
      .map(([directive, value]) => `${directive} ${value}`)
      .join('; ');
    return meta;
  }
};

// Initialisation complète de la protection XSS
export const initializeXSSProtection = (options = {}) => {
  const config = {
    enableDOMMonitoring: true,
    enableResponseInterception: true,
    logViolations: true,
    ...options
  };

  // Démarrer la surveillance du DOM
  if (config.enableDOMMonitoring) {
    xssProtection.startDOMMonitoring();
  }

  // Intercepter les réponses
  if (config.enableResponseInterception) {
    xssProtection.interceptResponses();
  }

  // Logger les violations CSP
  if (config.logViolations) {
    document.addEventListener('securitypolicyviolation', (e) => {
      console.warn('CSP Violation:', {
        directive: e.violatedDirective,
        blockedURI: e.blockedURI,
        lineNumber: e.lineNumber,
        sourceFile: e.sourceFile
      });
    });
  }

  console.log('🛡️ XSS Protection initialized');
};

// Utilitaires pour les développeurs
export const XSSTestUtils = {
  // Tester la protection avec des payloads XSS communs
  testProtection() {
    const testPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src="x" onerror="alert(\'XSS\')">',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      '"><script>alert("XSS")</script>',
      '\'-alert(\'XSS\')-\'',
      '<svg onload="alert(\'XSS\')">',
      'data:text/html,<script>alert("XSS")</script>'
    ];

    console.log('🧪 Testing XSS Protection...');

    testPayloads.forEach((payload, index) => {
      const sanitized = xssProtection.sanitizeHTML(payload);
      const isBlocked = !sanitized.includes('<script') &&
                       !sanitized.includes('javascript:') &&
                       !sanitized.includes('onerror') &&
                       !sanitized.includes('onload');

      console.log(`Test ${index + 1}: ${isBlocked ? '✅ BLOCKED' : '❌ PASSED'}`, {
        original: payload,
        sanitized: sanitized
      });
    });
  }
};