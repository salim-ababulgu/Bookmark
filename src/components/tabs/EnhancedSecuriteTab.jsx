import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Lock, Eye, AlertTriangle, CheckCircle, Activity, Settings, Zap,
  Users, Clock, AlertCircle, TrendingUp, Search, Target, Globe, Server
} from 'lucide-react';
import { useSecurityContext, useSecurityMonitoring } from '../../contexts/SecurityContext';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';

const EnhancedSecuriteTab = () => {
  const { securityLevel, changeSecurityLevel, getSecurityStats } = useSecurityContext();
  const { threats, markThreatHandled } = useSecurityMonitoring();
  const { user } = useSupabaseAuth();
  const [stats, setStats] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    setStats(getSecurityStats());
  }, [threats, securityLevel]);

  const SecurityLevelBadge = ({ level, animated = false }) => {
    const configs = {
      low: { color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-50 dark:bg-gray-950/20', text: 'Faible', icon: Shield },
      normal: { color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/20', text: 'Normal', icon: Shield },
      high: { color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950/20', text: 'Élevé', icon: Shield },
      paranoid: { color: 'from-red-500 to-red-600', bgColor: 'bg-red-50 dark:bg-red-950/20', text: 'Paranoid', icon: AlertTriangle }
    };

    const config = configs[level] || configs.normal;
    const Icon = config.icon;

    return (
      <motion.span
        className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${config.color} text-white text-sm rounded-full font-medium`}
        initial={animated ? { scale: 0, opacity: 0 } : false}
        animate={animated ? { scale: 1, opacity: 1 } : false}
        transition={animated ? { type: "spring", stiffness: 500, delay: 0.2 } : false}
        whileHover={{ scale: 1.05 }}
      >
        <motion.div
          animate={animated ? { rotate: [0, 360] } : false}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Icon className="w-4 h-4" />
        </motion.div>
        {config.text}
      </motion.span>
    );
  };

  const ThreatCard = ({ threat, index }) => {
    const severityColors = {
      low: {
        border: 'border-green-200 dark:border-green-800',
        bg: 'bg-green-50 dark:bg-green-950/20',
        text: 'text-green-600',
        icon: CheckCircle
      },
      medium: {
        border: 'border-yellow-200 dark:border-yellow-800',
        bg: 'bg-yellow-50 dark:bg-yellow-950/20',
        text: 'text-yellow-600',
        icon: AlertTriangle
      },
      high: {
        border: 'border-red-200 dark:border-red-800',
        bg: 'bg-red-50 dark:bg-red-950/20',
        text: 'text-red-600',
        icon: AlertCircle
      }
    };

    const config = severityColors[threat.severity] || severityColors.medium;
    const Icon = config.icon;

    return (
      <motion.div
        className={`p-4 rounded-xl border ${config.border} ${config.bg} hover:shadow-lg transition-all duration-300 group`}
        initial={{ opacity: 0, x: -20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        whileHover={{ scale: 1.02, y: -2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <motion.div
              className={`p-2 rounded-lg bg-background ${config.text}`}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
            <div>
              <span className="font-semibold text-foreground">
                {threat.type.replace(/_/g, ' ')}
              </span>
              <div className="text-xs text-muted-foreground mt-1">
                Sévérité: <span className={`font-medium ${config.text}`}>{threat.severity}</span>
              </div>
            </div>
          </motion.div>

          <motion.span
            className="text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.4 }}
          >
            {new Date(threat.timestamp).toLocaleTimeString()}
          </motion.span>
        </div>

        {threat.details && Object.keys(threat.details).length > 0 && (
          <motion.div
            className="mb-3 p-3 bg-muted/50 rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: index * 0.1 + 0.6 }}
          >
            <p className="text-sm text-muted-foreground font-mono">
              {JSON.stringify(threat.details, null, 2).slice(0, 150)}...
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {!threat.handled && (
            <motion.button
              onClick={() => markThreatHandled(threat.id)}
              className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Marquer comme traité
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', delay = 0 }) => {
    const colorClasses = {
      blue: { gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800' },
      yellow: { gradient: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-50 dark:bg-yellow-950/20', border: 'border-yellow-200 dark:border-yellow-800' },
      green: { gradient: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-950/20', border: 'border-green-200 dark:border-green-800' },
      purple: { gradient: 'from-purple-500 to-indigo-500', bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-800' }
    };

    const colors = colorClasses[color];

    return (
      <motion.div
        className={`${colors.bg} border ${colors.border} rounded-xl p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer`}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay, duration: 0.5, type: "spring", stiffness: 200 }}
        whileHover={{ y: -5, scale: 1.02 }}
        onHoverStart={() => setHoveredCard(title)}
        onHoverEnd={() => setHoveredCard(null)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <motion.p
              className="text-sm font-medium text-muted-foreground uppercase tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
            >
              {title}
            </motion.p>

            <motion.p
              className="text-3xl font-bold text-foreground mt-2"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: delay + 0.4, type: "spring", stiffness: 300 }}
            >
              {value}
            </motion.p>

            {subtitle && (
              <motion.p
                className="text-xs text-muted-foreground mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.6 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          <motion.div
            className={`w-14 h-14 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: delay + 0.3, type: "spring", stiffness: 400 }}
            animate={hoveredCard === title ? { rotate: [0, 360] } : { rotate: 0 }}
          >
            <Icon className="w-7 h-7 text-white" />
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const SecurityFeature = ({ icon: Icon, title, status, delay = 0 }) => (
    <motion.div
      className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl group hover:bg-green-100 dark:hover:bg-green-950/30 transition-all duration-300"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, x: 5 }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="p-2 bg-green-600 rounded-lg"
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-5 h-5 text-white" />
        </motion.div>
        <span className="font-medium text-green-800 dark:text-green-200">{title}</span>
      </div>
      <motion.span
        className="text-sm text-green-600 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
      >
        {status}
      </motion.span>
    </motion.div>
  );

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
          >
            <Shield className="w-6 h-6 text-primary" />
          </motion.div>
          Centre de Sécurité
        </h2>
        <p className="text-muted-foreground">
          Surveillez et gérez la sécurité de votre compte et de vos données
        </p>
      </motion.div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Shield}
          title="Niveau"
          value={<SecurityLevelBadge level={securityLevel} animated />}
          subtitle="de sécurité"
          color="blue"
          delay={0.1}
        />

        <StatCard
          icon={AlertTriangle}
          title="Menaces"
          value={stats?.threatsDetected || 0}
          subtitle="détectées"
          color="yellow"
          delay={0.2}
        />

        <StatCard
          icon={Activity}
          title="Événements"
          value={stats?.last24h || 0}
          subtitle="dernières 24h"
          color="green"
          delay={0.3}
        />

        <StatCard
          icon={Eye}
          title="Surveillance"
          value={stats?.isMonitoring ? 'Active' : 'Inactive'}
          subtitle="en temps réel"
          color="purple"
          delay={0.4}
        />
      </div>

      {/* Security Level Control */}
      <motion.div
        className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        whileHover={{ y: -2 }}
      >
        <div className="flex items-center gap-2 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 500 }}
          >
            <Settings className="w-5 h-5 text-primary" />
          </motion.div>
          <h3 className="text-lg font-semibold text-foreground">Configuration de la sécurité</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-4">
              Niveau de sécurité
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {['low', 'normal', 'high', 'paranoid'].map((level, index) => (
                <motion.button
                  key={level}
                  onClick={() => changeSecurityLevel(level)}
                  className={`p-4 rounded-xl border text-sm font-medium transition-all duration-300 group ${
                    securityLevel === level
                      ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/25'
                      : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="mb-3"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                  >
                    <SecurityLevelBadge level={level} />
                  </motion.div>
                  <div className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    {level === 'low' && 'Surveillance minimale'}
                    {level === 'normal' && 'Protection équilibrée'}
                    {level === 'high' && 'Surveillance renforcée'}
                    {level === 'paranoid' && 'Sécurité maximale'}
                  </div>

                  {securityLevel === level && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <CheckCircle className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Threats */}
      <AnimatePresence>
        {threats.length > 0 && (
          <motion.div
            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 500 }}
              >
                <AlertCircle className="w-5 h-5 text-primary" />
              </motion.div>
              <h3 className="text-lg font-semibold text-foreground">
                Menaces récentes ({threats.length})
              </h3>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {threats.slice(0, 10).map((threat, index) => (
                <ThreatCard key={threat.id} threat={threat} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 500 }}
            >
              <Lock className="w-5 h-5 text-primary" />
            </motion.div>
            <h3 className="text-lg font-semibold text-foreground">Protection active</h3>
          </div>

          <div className="space-y-3">
            <SecurityFeature
              icon={Globe}
              title="Validation d'URL"
              status="Actif"
              delay={0.1}
            />
            <SecurityFeature
              icon={Shield}
              title="Protection XSS"
              status="Actif"
              delay={0.2}
            />
            <SecurityFeature
              icon={Clock}
              title="Rate Limiting"
              status="Actif"
              delay={0.3}
            />
            <SecurityFeature
              icon={Server}
              title="Audit Logging"
              status="Actif"
              delay={0.4}
            />
          </div>
        </motion.div>

        <motion.div
          className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 500 }}
            >
              <TrendingUp className="w-5 h-5 text-primary" />
            </motion.div>
            <h3 className="text-lg font-semibold text-foreground">Statistiques de sécurité</h3>
          </div>

          <div className="space-y-4">
            {stats?.byLevel && Object.entries(stats.byLevel).map(([level, count], index) => (
              <motion.div
                key={level}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-sm text-muted-foreground capitalize font-medium">{level}</span>
                <motion.span
                  className="font-bold text-foreground"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1, type: "spring" }}
                >
                  {count}
                </motion.span>
              </motion.div>
            ))}

            <motion.div
              className="border-t border-border pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dernière menace</span>
                <span className="text-sm font-medium text-foreground">
                  {stats?.lastThreat ? new Date(stats.lastThreat).toLocaleDateString() : 'Aucune'}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Account Security */}
      <motion.div
        className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        whileHover={{ y: -2 }}
      >
        <div className="flex items-center gap-2 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 500 }}
          >
            <Users className="w-5 h-5 text-primary" />
          </motion.div>
          <h3 className="text-lg font-semibold text-foreground">Sécurité du compte</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {[
              {
                label: 'Email vérifié',
                value: user?.email_confirmed_at ? 'Oui' : 'Non',
                status: user?.email_confirmed_at ? 'success' : 'warning'
              },
              {
                label: 'Dernière connexion',
                value: user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A',
                status: 'info'
              },
              {
                label: 'Provider',
                value: user?.app_metadata?.provider || 'Email',
                status: 'info'
              }
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                whileHover={{ scale: 1.02, bg: 'muted/50' }}
              >
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className={`text-sm font-medium ${
                  item.status === 'success' ? 'text-green-600' :
                  item.status === 'warning' ? 'text-red-600' : 'text-foreground'
                }`}>
                  {item.value}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            {[
              { label: 'Session sécurisée', value: 'Active', status: 'success' },
              { label: 'Chiffrement des données', value: 'AES-256', status: 'success' },
              { label: 'Monitoring', value: stats?.isMonitoring ? 'Actif' : 'Partiel', status: stats?.isMonitoring ? 'success' : 'warning' }
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className={`text-sm font-medium ${
                  item.status === 'success' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {item.value}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedSecuriteTab;