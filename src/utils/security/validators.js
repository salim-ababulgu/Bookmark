// Utilitaires de validation et sécurisation des données

// Validation stricte des URLs
export const validateURL = (url) => {
  if (!url || typeof url !== 'string') return false;

  try {
    const urlObj = new URL(url);

    // Protocoles autorisés
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return false;
    }

    // Bloquer les IPs privées et localhost (sauf en développement)
    const hostname = urlObj.hostname.toLowerCase();
    const privateIPRegex = /^(10\.|127\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|::1|localhost)$/;

    if (import.meta.env.PROD && privateIPRegex.test(hostname)) {
      return false;
    }

    // Bloquer les ports dangereux
    const dangerousPorts = [22, 23, 25, 53, 135, 137, 138, 139, 445, 993, 995];
    if (urlObj.port && dangerousPorts.includes(parseInt(urlObj.port))) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

// Validation des emails avec regex stricte
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email)) return false;

  // Vérifications supplémentaires
  if (email.length > 254) return false;
  if (email.includes('..')) return false;

  return true;
};

// Validation des mots de passe
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Le mot de passe est requis'] };
  }

  const errors = [];

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }

  if (password.length > 128) {
    errors.push('Le mot de passe ne peut pas dépasser 128 caractères');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
  }

  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }

  // Vérifier si le mot de passe contient des motifs communs faibles
  const commonPatterns = [
    /123456789/,
    /abcdefgh/,
    /qwerty/i,
    /password/i,
    /admin/i
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Le mot de passe contient un motif trop commun');
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
};

// Calcul de la force du mot de passe
const calculatePasswordStrength = (password) => {
  let score = 0;

  // Longueur
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Complexité
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

  // Diversité des caractères
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) score += 1;

  if (score <= 3) return 'weak';
  if (score <= 5) return 'medium';
  if (score <= 7) return 'strong';
  return 'very-strong';
};

// Validation des noms (titre, description, etc.)
export const validateText = (text, options = {}) => {
  const {
    minLength = 1,
    maxLength = 1000,
    required = true,
    allowHTML = false
  } = options;

  if (!text || typeof text !== 'string') {
    return { valid: !required, errors: required ? ['Ce champ est requis'] : [] };
  }

  const errors = [];

  // Longueur
  if (text.length < minLength) {
    errors.push(`Minimum ${minLength} caractères requis`);
  }

  if (text.length > maxLength) {
    errors.push(`Maximum ${maxLength} caractères autorisés`);
  }

  // Vérification HTML/script injection
  if (!allowHTML) {
    const htmlRegex = /<[^>]*>/g;
    if (htmlRegex.test(text)) {
      errors.push('Les balises HTML ne sont pas autorisées');
    }
  }

  // Vérification script injection
  const scriptRegex = /(javascript:|on\w+\s*=|<script)/i;
  if (scriptRegex.test(text)) {
    errors.push('Contenu potentiellement dangereux détecté');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Validation des tags
export const validateTags = (tags) => {
  if (!tags) return { valid: true, errors: [] };

  const errors = [];
  const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(t => t);

  if (tagArray.length > 10) {
    errors.push('Maximum 10 tags autorisés');
  }

  for (const tag of tagArray) {
    if (tag.length > 30) {
      errors.push('Chaque tag ne peut pas dépasser 30 caractères');
      break;
    }

    if (!/^[a-zA-Z0-9\-_\u00C0-\u017F]+$/.test(tag)) {
      errors.push('Les tags ne peuvent contenir que des lettres, chiffres, traits d\'union et underscores');
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: tagArray.filter(tag => tag.length <= 30 && /^[a-zA-Z0-9\-_\u00C0-\u017F]+$/.test(tag))
  };
};

// Validation des fichiers uploadés
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB par défaut
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  } = options;

  if (!file) {
    return { valid: false, errors: ['Aucun fichier sélectionné'] };
  }

  const errors = [];

  // Taille
  if (file.size > maxSize) {
    errors.push(`La taille du fichier ne peut pas dépasser ${Math.round(maxSize / 1024 / 1024)}MB`);
  }

  // Type MIME
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`);
  }

  // Extension
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    errors.push(`Extension non autorisée. Extensions acceptées: ${allowedExtensions.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};