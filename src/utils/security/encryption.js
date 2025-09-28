// Utilitaires de chiffrement côté client pour les données sensibles

class ClientEncryption {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
  }

  // Générer une clé de chiffrement
  async generateKey() {
    return await crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }

  // Dériver une clé à partir d'un mot de passe
  async deriveKeyFromPassword(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Chiffrer des données
  async encrypt(data, key) {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV pour AES-GCM

    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv: iv,
      },
      key,
      encoder.encode(data)
    );

    // Combiner IV et données chiffrées
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...result));
  }

  // Déchiffrer des données
  async decrypt(encryptedData, key) {
    const data = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map(char => char.charCodeAt(0))
    );

    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: this.algorithm,
        iv: iv,
      },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  // Générer un hash sécurisé
  async hash(data) {
    const encoder = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    return btoa(String.fromCharCode(...new Uint8Array(hash)));
  }

  // Générer un salt aléatoire
  generateSalt() {
    return crypto.getRandomValues(new Uint8Array(16));
  }

  // Exporter une clé pour stockage
  async exportKey(key) {
    const exported = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }

  // Importer une clé depuis le stockage
  async importKey(keyString) {
    const keyData = new Uint8Array(
      atob(keyString)
        .split('')
        .map(char => char.charCodeAt(0))
    );

    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: this.algorithm },
      true,
      ['encrypt', 'decrypt']
    );
  }
}

// Instance globale
export const encryption = new ClientEncryption();

// Gestionnaire de stockage sécurisé
class SecureStorage {
  constructor() {
    this.keyPrefix = 'secure_';
    this.masterKey = null;
  }

  // Initialiser avec un mot de passe maître
  async initialize(masterPassword) {
    const salt = this.getSalt();
    this.masterKey = await encryption.deriveKeyFromPassword(masterPassword, salt);
    return true;
  }

  // Obtenir ou créer le salt
  getSalt() {
    let salt = localStorage.getItem('app_salt');
    if (!salt) {
      const newSalt = encryption.generateSalt();
      salt = btoa(String.fromCharCode(...newSalt));
      localStorage.setItem('app_salt', salt);
    }

    return new Uint8Array(
      atob(salt)
        .split('')
        .map(char => char.charCodeAt(0))
    );
  }

  // Stocker des données chiffrées
  async setSecure(key, value) {
    if (!this.masterKey) {
      throw new Error('SecureStorage not initialized');
    }

    const encrypted = await encryption.encrypt(JSON.stringify(value), this.masterKey);
    localStorage.setItem(this.keyPrefix + key, encrypted);
  }

  // Récupérer des données chiffrées
  async getSecure(key) {
    if (!this.masterKey) {
      throw new Error('SecureStorage not initialized');
    }

    const encrypted = localStorage.getItem(this.keyPrefix + key);
    if (!encrypted) return null;

    try {
      const decrypted = await encryption.decrypt(encrypted, this.masterKey);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return null;
    }
  }

  // Supprimer des données sécurisées
  removeSecure(key) {
    localStorage.removeItem(this.keyPrefix + key);
  }

  // Lister toutes les clés sécurisées
  getSecureKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.keyPrefix)) {
        keys.push(key.substring(this.keyPrefix.length));
      }
    }
    return keys;
  }

  // Nettoyer toutes les données sécurisées
  clearAll() {
    const keys = this.getSecureKeys();
    keys.forEach(key => this.removeSecure(key));
  }
}

// Instance globale de stockage sécurisé
export const secureStorage = new SecureStorage();

// Utilitaires pour les données sensibles des bookmarks
export const BookmarkSecurity = {
  // Chiffrer les notes privées d'un bookmark
  async encryptPrivateNotes(notes, userKey) {
    if (!notes) return null;
    return await encryption.encrypt(notes, userKey);
  },

  // Déchiffrer les notes privées
  async decryptPrivateNotes(encryptedNotes, userKey) {
    if (!encryptedNotes) return null;
    try {
      return await encryption.decrypt(encryptedNotes, userKey);
    } catch {
      return '[Données chiffrées non lisibles]';
    }
  },

  // Hash d'un bookmark pour détecter les modifications
  async generateBookmarkHash(bookmark) {
    const data = `${bookmark.url}${bookmark.title}${bookmark.created_at}`;
    return await encryption.hash(data);
  },

  // Vérifier l'intégrité d'un bookmark
  async verifyBookmarkIntegrity(bookmark, expectedHash) {
    const currentHash = await this.generateBookmarkHash(bookmark);
    return currentHash === expectedHash;
  }
};

// Protection contre les attaques de timing
export const TimingSafeEqual = {
  // Comparaison sécurisée de chaînes
  compare(a, b) {
    if (a.length !== b.length) {
      // Faire une comparaison factice pour éviter les attaques de timing
      let dummy = 0;
      for (let i = 0; i < a.length; i++) {
        dummy += a.charCodeAt(i);
      }
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
};

// Détection de manipulation du DOM/code
export class IntegrityChecker {
  constructor() {
    this.originalHashes = new Map();
    this.checkInterval = null;
  }

  // Calculer le hash d'un élément script
  async hashScript(script) {
    return await encryption.hash(script.innerHTML || script.src || '');
  }

  // Initialiser la vérification d'intégrité
  async initialize() {
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const hash = await this.hashScript(script);
      this.originalHashes.set(script, hash);
    }
  }

  // Vérifier l'intégrité du code
  async checkIntegrity() {
    const scripts = document.querySelectorAll('script');
    const alerts = [];

    for (const script of scripts) {
      const currentHash = await this.hashScript(script);
      const originalHash = this.originalHashes.get(script);

      if (originalHash && currentHash !== originalHash) {
        alerts.push({
          type: 'script_modified',
          element: script,
          src: script.src || 'inline'
        });
      }
    }

    // Vérifier s'il y a de nouveaux scripts
    if (scripts.length !== this.originalHashes.size) {
      alerts.push({
        type: 'new_scripts_detected',
        count: scripts.length - this.originalHashes.size
      });
    }

    return alerts;
  }

  // Démarrer la surveillance continue
  startMonitoring(intervalMs = 30000) {
    this.checkInterval = setInterval(async () => {
      const alerts = await this.checkIntegrity();
      if (alerts.length > 0) {
        console.warn('Integrity check failed:', alerts);
        // Déclencher une alerte de sécurité
        if (window.securityAlert) {
          window.securityAlert('Code integrity compromised', alerts);
        }
      }
    }, intervalMs);
  }

  // Arrêter la surveillance
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// Gestionnaire de sessions sécurisées
export class SecureSession {
  constructor() {
    this.sessionKey = null;
    this.sessionData = new Map();
    this.lastActivity = Date.now();
    this.timeoutDuration = 30 * 60 * 1000; // 30 minutes
  }

  // Initialiser une session sécurisée
  async initialize() {
    this.sessionKey = await encryption.generateKey();
    this.updateActivity();
    this.startTimeoutCheck();
  }

  // Mettre à jour l'activité
  updateActivity() {
    this.lastActivity = Date.now();
  }

  // Vérifier le timeout de session
  isExpired() {
    return Date.now() - this.lastActivity > this.timeoutDuration;
  }

  // Stocker des données dans la session
  async setData(key, value) {
    if (this.isExpired()) {
      throw new Error('Session expired');
    }

    this.updateActivity();
    const encrypted = await encryption.encrypt(JSON.stringify(value), this.sessionKey);
    this.sessionData.set(key, encrypted);
  }

  // Récupérer des données de la session
  async getData(key) {
    if (this.isExpired()) {
      throw new Error('Session expired');
    }

    this.updateActivity();
    const encrypted = this.sessionData.get(key);
    if (!encrypted) return null;

    const decrypted = await encryption.decrypt(encrypted, this.sessionKey);
    return JSON.parse(decrypted);
  }

  // Nettoyer la session
  cleanup() {
    this.sessionData.clear();
    this.sessionKey = null;
  }

  // Démarrer la vérification de timeout
  startTimeoutCheck() {
    setInterval(() => {
      if (this.isExpired()) {
        this.cleanup();
        // Rediriger vers la page de connexion
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }
      }
    }, 60000); // Vérifier chaque minute
  }
}

// Instance globale de session sécurisée
export const secureSession = new SecureSession();