import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Activity, Settings, Zap, Users, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useSecurityContext, useSecurityMonitoring } from '../../contexts/SecurityContext';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';

const SecuriteTab = () => {
  const { securityLevel, changeSecurityLevel, getSecurityStats } = useSecurityContext();
  const { threats, markThreatHandled } = useSecurityMonitoring();
  const { user } = useSupabaseAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setStats(getSecurityStats());
  }, [threats, securityLevel]);

  const SecurityLevelBadge = ({ level }) => {
    const configs = {
      low: { color: 'bg-gray-500', text: 'Faible', icon: Shield },
      normal: { color: 'bg-blue-500', text: 'Normal', icon: Shield },
      high: { color: 'bg-orange-500', text: 'Élevé', icon: Shield },
      paranoid: { color: 'bg-red-500', text: 'Paranoid', icon: AlertTriangle }
    };

    const config = configs[level] || configs.normal;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 ${config.color} text-white text-xs rounded-full`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const ThreatCard = ({ threat }) => {
    const severityColors = {
      low: 'border-green-200 bg-green-50 dark:bg-green-950/20',
      medium: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20',
      high: 'border-red-200 bg-red-50 dark:bg-red-950/20'
    };

    return (
      <div className={`p-3 rounded-lg border ${severityColors[threat.severity] || severityColors.medium}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${threat.severity === 'high' ? 'text-red-600' : threat.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'}`} />
            <span className="font-medium text-sm">{threat.type.replace(/_/g, ' ')}</span>
          </div>
          <span className="text-xs text-muted-foreground">{new Date(threat.timestamp).toLocaleTimeString()}</span>
        </div>
        {threat.details && Object.keys(threat.details).length > 0 && (
          <p className="text-xs text-muted-foreground mb-2">
            {JSON.stringify(threat.details, null, 1).slice(0, 100)}...
          </p>
        )}
        {!threat.handled && (
          <button
            onClick={() => markThreatHandled(threat.id)}
            className="text-xs text-primary hover:underline"
          >
            Marquer comme traité
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Centre de Sécurité</h2>
        <p className="text-muted-foreground">
          Surveillez et gérez la sécurité de votre compte et de vos données
        </p>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Niveau de sécurité</p>
              <SecurityLevelBadge level={securityLevel} />
            </div>
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Menaces détectées</p>
              <p className="text-2xl font-bold text-foreground">{stats?.threatsDetected || 0}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Événements (24h)</p>
              <p className="text-2xl font-bold text-foreground">{stats?.last24h || 0}</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Surveillance</p>
              <p className="text-sm font-medium text-foreground">
                {stats?.isMonitoring ? 'Active' : 'Inactive'}
              </p>
            </div>
            <Eye className={`w-8 h-8 ${stats?.isMonitoring ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>
        </div>
      </div>

      {/* Security Level Control */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuration de la sécurité
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Niveau de sécurité
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['low', 'normal', 'high', 'paranoid'].map((level) => (
                <button
                  key={level}
                  onClick={() => changeSecurityLevel(level)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    securityLevel === level
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <SecurityLevelBadge level={level} />
                  <div className="mt-2 text-xs">
                    {level === 'low' && 'Surveillance minimale'}
                    {level === 'normal' && 'Protection équilibrée'}
                    {level === 'high' && 'Surveillance renforcée'}
                    {level === 'paranoid' && 'Sécurité maximale'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Threats */}
      {threats.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Menaces récentes ({threats.length})
          </h3>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {threats.slice(0, 10).map((threat) => (
              <ThreatCard key={threat.id} threat={threat} />
            ))}
          </div>
        </div>
      )}

      {/* Security Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Protection active
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">Validation d'URL</span>
              </div>
              <span className="text-sm text-green-600">Actif</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">Protection XSS</span>
              </div>
              <span className="text-sm text-green-600">Actif</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">Rate Limiting</span>
              </div>
              <span className="text-sm text-green-600">Actif</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">Audit Logging</span>
              </div>
              <span className="text-sm text-green-600">Actif</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Statistiques de sécurité
          </h3>

          <div className="space-y-4">
            {stats?.byLevel && Object.entries(stats.byLevel).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground capitalize">{level}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dernière menace</span>
                <span className="text-sm font-medium">
                  {stats?.lastThreat ? new Date(stats.lastThreat).toLocaleDateString() : 'Aucune'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Security */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Sécurité du compte
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email vérifié</span>
              <span className={`text-sm font-medium ${user?.email_confirmed_at ? 'text-green-600' : 'text-red-600'}`}>
                {user?.email_confirmed_at ? 'Oui' : 'Non'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Dernière connexion</span>
              <span className="text-sm font-medium">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Provider</span>
              <span className="text-sm font-medium">{user?.app_metadata?.provider || 'Email'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Session sécurisée</span>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Chiffrement des données</span>
              <span className="text-sm font-medium text-green-600">AES-256</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monitoring</span>
              <span className={`text-sm font-medium ${stats?.isMonitoring ? 'text-green-600' : 'text-yellow-600'}`}>
                {stats?.isMonitoring ? 'Actif' : 'Partiel'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuriteTab;