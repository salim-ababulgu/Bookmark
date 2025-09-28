import React, { createContext, useContext, useEffect, useState } from 'react';
import { auditLogger, logSecurity, logAuth, AUDIT_EVENTS } from '../utils/security/auditLogger';
import { rateLimiter, checkRateLimit, RATE_LIMITS } from '../utils/security/rateLimit';
import { secureSession, IntegrityChecker } from '../utils/security/encryption';
import { validateURL, validateEmail, validateText } from '../utils/security/validators';
import { sanitizeHTML, sanitizeURL, sanitizeText } from '../utils/security/sanitizers';
import { initializeCSRFProtection, useCSRFProtection } from '../utils/security/csrf';
import { initializeXSSProtection, useXSSProtection } from '../utils/security/xss';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { toast } from 'sonner';

const SecurityContext = createContext({});

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
};

export const SecurityProvider = ({ children }) => {
  const [securityLevel, setSecurityLevel] = useState('normal'); // low, normal, high, paranoid
  const [threats, setThreats] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [integrityChecker] = useState(new IntegrityChecker());
  const { user } = useSupabaseAuth();

  // Initialisation de la sécurité
  useEffect(() => {
    initializeSecurity();

    // Initialiser la protection CSRF et XSS
    initializeCSRFProtection({
      enableFormProtection: true,
      enableFetchMiddleware: true,
      enableOriginValidation: true,
      tokenRotationInterval: 30 * 60 * 1000
    });

    initializeXSSProtection({
      enableDOMMonitoring: true,
      enableResponseInterception: true,
      logViolations: true
    });

    return () => {
      integrityChecker.stopMonitoring();
    };
  }, []);

  // Surveillance continue
  useEffect(() => {
    if (isMonitoring) {
      startSecurityMonitoring();
    } else {
      stopSecurityMonitoring();
    }
  }, [isMonitoring]);

  const initializeSecurity = async () => {
    try {
      // Initialiser la session sécurisée
      await secureSession.initialize();

      // Initialiser la vérification d'intégrité
      await integrityChecker.initialize();

      // Commencer la surveillance si nécessaire
      if (securityLevel === 'high' || securityLevel === 'paranoid') {
        setIsMonitoring(true);
      }

      // Logger l'initialisation
      logSecurity(AUDIT_EVENTS.LOGIN_SUCCESS, 'info', {
        securityLevel,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Security initialization failed:', error);
      logSecurity('security_init_failed', 'error', { error: error.message });
    }
  };

  const startSecurityMonitoring = () => {
    integrityChecker.startMonitoring(30000); // Vérifier toutes les 30 secondes

    // Surveillance des événements suspects
    document.addEventListener('keydown', detectSuspiciousKeystrokes);
    document.addEventListener('paste', validatePastedContent);
    window.addEventListener('beforeunload', handlePageUnload);

    logSecurity('monitoring_started', 'info', { securityLevel });
  };

  const stopSecurityMonitoring = () => {
    integrityChecker.stopMonitoring();

    document.removeEventListener('keydown', detectSuspiciousKeystrokes);
    document.removeEventListener('paste', validatePastedContent);
    window.removeEventListener('beforeunload', handlePageUnload);
  };

  // Détection de frappe de touches suspectes
  const detectSuspiciousKeystrokes = (event) => {
    // Détecter les tentatives de manipulation de console
    if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && event.key === 'I')) {
      if (securityLevel === 'paranoid') {
        event.preventDefault();
        handleSecurityThreat('dev_tools_attempt', 'high');
      }
    }

    // Détecter les tentatives de source viewing
    if (event.ctrlKey && event.key === 'u') {
      if (securityLevel === 'paranoid') {
        event.preventDefault();
        handleSecurityThreat('view_source_attempt', 'medium');
      }
    }
  };

  // Validation du contenu collé
  const validatePastedContent = (event) => {
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('text');

    // Vérifier les scripts malveillants
    if (/<script|javascript:|on\w+\s*=/i.test(pastedData)) {
      event.preventDefault();
      handleSecurityThreat('malicious_paste_blocked', 'high', { content: pastedData.substring(0, 100) });
      toast.error('Contenu potentiellement dangereux bloqué');
    }
  };

  // Gestion du déchargement de page
  const handlePageUnload = () => {
    // Nettoyer les données sensibles
    secureSession.cleanup();
    logSecurity('session_ended', 'info', { duration: Date.now() - secureSession.lastActivity });
  };

  // Gestion des menaces de sécurité
  const handleSecurityThreat = (type, severity, details = {}) => {
    const threat = {
      id: Date.now().toString(),
      type,
      severity,
      timestamp: new Date().toISOString(),
      userId: user?.id,
      details,
      handled: false
    };

    setThreats(prev => [threat, ...prev.slice(0, 99)]); // Garder les 100 dernières menaces

    logSecurity(type, severity === 'high' ? 'critical' : 'warning', details);

    // Actions automatiques selon la sévérité
    if (severity === 'high' && securityLevel === 'paranoid') {
      // Bloquer temporairement l'utilisateur
      toast.error('Activité suspecte détectée. Session sécurisée.');
    }

    // Notifier l'utilisateur selon le niveau de sécurité
    if (securityLevel !== 'low') {
      const message = `Menace de sécurité détectée: ${type}`;
      if (severity === 'high') {
        toast.error(message);
      } else {
        toast.warning(message);
      }
    }
  };

  // Validation sécurisée d'URL
  const validateSecureURL = (url) => {
    const validation = { valid: false, errors: [], sanitized: '' };

    // Validation de base
    if (!validateURL(url)) {
      validation.errors.push('URL invalide');
      return validation;
    }

    try {
      const urlObj = new URL(url);

      // Vérifications de sécurité supplémentaires
      const suspiciousDomains = [
        'bit.ly', 'tinyurl.com', 'shortened.link', 't.co'
      ];

      if (suspiciousDomains.some(domain => urlObj.hostname.includes(domain))) {
        validation.errors.push('Domaine de raccourcissement d\'URL détecté');
        handleSecurityThreat('suspicious_url_domain', 'medium', { url: urlObj.hostname });
      }

      // Vérifier les paramètres suspects
      for (const [key, value] of urlObj.searchParams) {
        if (/<script|javascript:|on\w+\s*=/i.test(key) || /<script|javascript:|on\w+\s*=/i.test(value)) {
          validation.errors.push('Paramètres URL suspects détectés');
          handleSecurityThreat('malicious_url_params', 'high', { url });
          break;
        }
      }

      validation.sanitized = sanitizeURL(url);
      validation.valid = validation.errors.length === 0;

    } catch (error) {
      validation.errors.push('Erreur de parsing URL');
    }

    return validation;
  };

  // Validation sécurisée de texte
  const validateSecureText = (text, options = {}) => {
    const validation = validateText(text, options);

    // Vérifications supplémentaires
    if (validation.valid && text) {
      // Détecter les tentatives d'injection
      const injectionPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /eval\s*\(/i,
        /document\./i,
        /window\./i
      ];

      for (const pattern of injectionPatterns) {
        if (pattern.test(text)) {
          validation.valid = false;
          validation.errors.push('Contenu potentiellement dangereux détecté');
          handleSecurityThreat('injection_attempt_blocked', 'high', { pattern: pattern.source });
          break;
        }
      }

      validation.sanitized = sanitizeText(text, options);
    }

    return validation;
  };

  // Vérification de rate limiting
  const checkSecureRateLimit = (action, identifier) => {
    const result = checkRateLimit(action, identifier || user?.id || 'anonymous');

    if (!result.allowed) {
      handleSecurityThreat('rate_limit_exceeded', 'medium', {
        action,
        identifier,
        reason: result.reason
      });
    }

    return result;
  };

  // Changer le niveau de sécurité
  const changeSecurityLevel = (level) => {
    const oldLevel = securityLevel;
    setSecurityLevel(level);

    logSecurity('security_level_changed', 'info', {
      oldLevel,
      newLevel: level,
      userId: user?.id
    });

    // Ajuster la surveillance
    if (level === 'high' || level === 'paranoid') {
      setIsMonitoring(true);
    } else {
      setIsMonitoring(false);
    }

    toast.success(`Niveau de sécurité changé: ${level}`);
  };

  // Obtenir les statistiques de sécurité
  const getSecurityStats = () => {
    const stats = auditLogger.getSecurityStats();
    const recentThreats = threats.filter(threat =>
      Date.now() - new Date(threat.timestamp).getTime() < 24 * 60 * 60 * 1000
    );

    return {
      ...stats,
      securityLevel,
      threatsDetected: threats.length,
      recentThreats: recentThreats.length,
      isMonitoring,
      lastThreat: threats[0]?.timestamp || null
    };
  };

  // Marquer une menace comme traitée
  const markThreatHandled = (threatId) => {
    setThreats(prev => prev.map(threat =>
      threat.id === threatId ? { ...threat, handled: true } : threat
    ));
  };

  // Nettoyer les anciennes menaces
  const clearOldThreats = () => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    setThreats(prev => prev.filter(threat =>
      new Date(threat.timestamp).getTime() > oneDayAgo
    ));
  };

  // Valeurs du contexte
  const value = {
    // État de sécurité
    securityLevel,
    threats,
    isMonitoring,

    // Fonctions de validation
    validateSecureURL,
    validateSecureText,
    checkSecureRateLimit,

    // Gestion de la sécurité
    changeSecurityLevel,
    handleSecurityThreat,
    markThreatHandled,
    clearOldThreats,

    // Statistiques
    getSecurityStats,

    // Utilitaires
    sanitizers: {
      html: sanitizeHTML,
      url: sanitizeURL,
      text: sanitizeText
    },

    // Audit
    auditLogger
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

// Hook personnalisé pour la validation sécurisée
export const useSecureValidation = () => {
  const { validateSecureURL, validateSecureText, sanitizers } = useSecurityContext();

  return {
    validateURL: validateSecureURL,
    validateText: validateSecureText,
    sanitize: sanitizers
  };
};

// Hook pour la surveillance des menaces
export const useSecurityMonitoring = () => {
  const { threats, getSecurityStats, markThreatHandled, clearOldThreats } = useSecurityContext();

  return {
    threats,
    stats: getSecurityStats(),
    markThreatHandled,
    clearOldThreats
  };
};

// Hook pour le rate limiting
export const useSecureRateLimit = (action) => {
  const { checkSecureRateLimit } = useSecurityContext();
  const { user } = useSupabaseAuth();

  const checkLimit = (cost = 1) => {
    return checkSecureRateLimit(action, user?.id);
  };

  return { checkLimit };
};