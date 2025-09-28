// Système de logging et audit de sécurité

class AuditLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Limite en mémoire
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Log d'un événement de sécurité
  logEvent(event) {
    const logEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      level: event.level || 'info',
      category: event.category || 'general',
      action: event.action,
      userId: event.userId || null,
      userAgent: navigator.userAgent,
      ip: 'client-side', // En production, récupérer via API
      details: event.details || {},
      metadata: {
        url: window.location.href,
        referrer: document.referrer,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    // Ajouter le log
    this.logs.push(logEntry);

    // Nettoyer si trop de logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log dans la console en développement
    if (import.meta.env.DEV) {
      console.log(`[AUDIT] ${logEntry.level.toUpperCase()}: ${logEntry.action}`, logEntry);
    }

    // Envoyer les logs critiques immédiatement
    if (logEntry.level === 'critical' || logEntry.level === 'error') {
      this.sendLogToServer(logEntry);
    }

    return logEntry.id;
  }

  generateLogId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Envoyer les logs au serveur (simulation)
  async sendLogToServer(log) {
    try {
      // En production, envoyer à votre endpoint de logging
      if (import.meta.env.PROD) {
        await fetch('/api/audit-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(log)
        });
      }
    } catch (error) {
      console.error('Failed to send audit log:', error);
    }
  }

  // Méthodes de convenience pour différents types d'événements
  logAuthentication(action, userId, details = {}) {
    return this.logEvent({
      level: 'info',
      category: 'authentication',
      action,
      userId,
      details
    });
  }

  logSecurityEvent(action, level = 'warning', details = {}) {
    return this.logEvent({
      level,
      category: 'security',
      action,
      details
    });
  }

  logDataAccess(action, userId, resource, details = {}) {
    return this.logEvent({
      level: 'info',
      category: 'data_access',
      action,
      userId,
      details: { resource, ...details }
    });
  }

  logUserAction(action, userId, details = {}) {
    return this.logEvent({
      level: 'info',
      category: 'user_action',
      action,
      userId,
      details
    });
  }

  logError(error, userId = null, details = {}) {
    return this.logEvent({
      level: 'error',
      category: 'error',
      action: 'error_occurred',
      userId,
      details: {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...details
      }
    });
  }

  // Récupérer les logs avec filtres
  getLogs(filters = {}) {
    let filteredLogs = [...this.logs];

    if (filters.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filters.level);
    }

    if (filters.category) {
      filteredLogs = filteredLogs.filter(log => log.category === filters.category);
    }

    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    if (filters.since) {
      const since = new Date(filters.since);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= since);
    }

    if (filters.until) {
      const until = new Date(filters.until);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= until);
    }

    return filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Obtenir les statistiques de sécurité
  getSecurityStats() {
    const now = new Date();
    const oneHour = new Date(now - 60 * 60 * 1000);
    const oneDay = new Date(now - 24 * 60 * 60 * 1000);

    const recentLogs = this.logs.filter(log => new Date(log.timestamp) >= oneDay);
    const hourlyLogs = this.logs.filter(log => new Date(log.timestamp) >= oneHour);

    const stats = {
      total: this.logs.length,
      last24h: recentLogs.length,
      lastHour: hourlyLogs.length,
      byLevel: {},
      byCategory: {},
      securityEvents: {
        total: 0,
        recent: 0
      }
    };

    // Compter par niveau
    for (const log of recentLogs) {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;

      if (log.category === 'security') {
        stats.securityEvents.total++;
        if (new Date(log.timestamp) >= oneHour) {
          stats.securityEvents.recent++;
        }
      }
    }

    return stats;
  }

  // Détecter des patterns suspects
  detectSuspiciousActivity(userId) {
    const now = new Date();
    const oneHour = new Date(now - 60 * 60 * 1000);
    const userLogs = this.logs.filter(log =>
      log.userId === userId && new Date(log.timestamp) >= oneHour
    );

    const suspicious = [];

    // Trop de tentatives de connexion
    const authAttempts = userLogs.filter(log => log.category === 'authentication').length;
    if (authAttempts > 10) {
      suspicious.push({
        type: 'excessive_auth_attempts',
        count: authAttempts,
        severity: 'high'
      });
    }

    // Trop d'erreurs
    const errors = userLogs.filter(log => log.level === 'error').length;
    if (errors > 20) {
      suspicious.push({
        type: 'excessive_errors',
        count: errors,
        severity: 'medium'
      });
    }

    // Actions trop rapides
    const actions = userLogs.filter(log => log.category === 'user_action');
    if (actions.length > 100) {
      suspicious.push({
        type: 'rapid_actions',
        count: actions.length,
        severity: 'medium'
      });
    }

    return suspicious;
  }

  // Exporter les logs pour analyse
  exportLogs(format = 'json') {
    const data = {
      exportedAt: new Date().toISOString(),
      sessionId: this.sessionId,
      totalLogs: this.logs.length,
      logs: this.logs
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'category', 'action', 'userId', 'details'];
      const rows = this.logs.map(log => [
        log.timestamp,
        log.level,
        log.category,
        log.action,
        log.userId || '',
        JSON.stringify(log.details)
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return data;
  }

  // Nettoyer les logs anciens
  cleanup(olderThan = 7) {
    const cutoff = new Date(Date.now() - olderThan * 24 * 60 * 60 * 1000);
    const before = this.logs.length;
    this.logs = this.logs.filter(log => new Date(log.timestamp) >= cutoff);
    const cleaned = before - this.logs.length;

    if (cleaned > 0) {
      this.logEvent({
        level: 'info',
        category: 'system',
        action: 'logs_cleaned',
        details: { cleaned, remaining: this.logs.length }
      });
    }

    return cleaned;
  }
}

// Instance globale
export const auditLogger = new AuditLogger();

// Nettoyer automatiquement les logs anciens
setInterval(() => {
  auditLogger.cleanup();
}, 24 * 60 * 60 * 1000); // Une fois par jour

// Events predéfinis
export const AUDIT_EVENTS = {
  // Authentification
  LOGIN_ATTEMPT: 'login_attempt',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  LOGOUT: 'logout',
  REGISTRATION: 'registration',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',

  // Sécurité
  SUSPICIOUS_URL: 'suspicious_url_detected',
  XSS_ATTEMPT: 'xss_attempt_blocked',
  RATE_LIMIT_HIT: 'rate_limit_exceeded',
  UNAUTHORIZED_ACCESS: 'unauthorized_access_attempt',
  DATA_BREACH_ATTEMPT: 'data_breach_attempt',

  // Actions utilisateur
  BOOKMARK_CREATED: 'bookmark_created',
  BOOKMARK_UPDATED: 'bookmark_updated',
  BOOKMARK_DELETED: 'bookmark_deleted',
  PROFILE_UPDATED: 'profile_updated',
  SETTINGS_CHANGED: 'settings_changed',

  // Système
  ERROR_OCCURRED: 'error_occurred',
  PERFORMANCE_ISSUE: 'performance_issue'
};

// Helper functions
export const logAuth = (action, userId, details) => auditLogger.logAuthentication(action, userId, details);
export const logSecurity = (action, level, details) => auditLogger.logSecurityEvent(action, level, details);
export const logUserAction = (action, userId, details) => auditLogger.logUserAction(action, userId, details);
export const logError = (error, userId, details) => auditLogger.logError(error, userId, details);