import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp, Star, FolderOpen, Calendar, ExternalLink, Activity, Target, Zap } from 'lucide-react';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../services/supabase';

const EnhancedAnalysesTab = () => {
  const [stats, setStats] = useState({
    total: 0,
    favorites: 0,
    collections: 0,
    thisWeek: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animateStats, setAnimateStats] = useState(false);
  const { user } = useSupabaseAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch all bookmarks
        const { data: bookmarks, error: bookmarksError } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', user.id);

        if (bookmarksError) throw bookmarksError;

        // Calculate stats
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const totalBookmarks = bookmarks?.length || 0;
        const favoriteBookmarks = bookmarks?.filter(b => b.is_favorite)?.length || 0;
        const weeklyBookmarks = bookmarks?.filter(b => new Date(b.created_at) > oneWeekAgo)?.length || 0;

        // Count unique collections (based on collection_id or tags)
        const uniqueCollections = new Set();
        bookmarks?.forEach(bookmark => {
          if (bookmark.collection_id) {
            uniqueCollections.add(bookmark.collection_id);
          }
          // Also count tags as collections
          if (bookmark.tags && bookmark.tags.length > 0) {
            bookmark.tags.forEach(tag => uniqueCollections.add(`tag:${tag}`));
          }
        });

        setStats({
          total: totalBookmarks,
          favorites: favoriteBookmarks,
          collections: uniqueCollections.size,
          thisWeek: weeklyBookmarks
        });

        // Set recent activity (last 5 bookmarks)
        const recent = bookmarks
          ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          ?.slice(0, 5) || [];

        setRecentActivity(recent);

        // Trigger stats animation after data is loaded
        setTimeout(() => setAnimateStats(true), 300);

      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', delay = 0 }) => {
    const colorClasses = {
      blue: {
        gradient: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        text: 'text-blue-600',
        border: 'border-blue-200 dark:border-blue-800'
      },
      green: {
        gradient: 'from-green-500 to-green-600',
        bg: 'bg-green-50 dark:bg-green-950/20',
        text: 'text-green-600',
        border: 'border-green-200 dark:border-green-800'
      },
      purple: {
        gradient: 'from-purple-500 to-purple-600',
        bg: 'bg-purple-50 dark:bg-purple-950/20',
        text: 'text-purple-600',
        border: 'border-purple-200 dark:border-purple-800'
      },
      orange: {
        gradient: 'from-orange-500 to-orange-600',
        bg: 'bg-orange-50 dark:bg-orange-950/20',
        text: 'text-orange-600',
        border: 'border-orange-200 dark:border-orange-800'
      }
    };

    const colors = colorClasses[color];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay, duration: 0.5, type: "spring", stiffness: 200 }}
        whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)" }}
        className={`${colors.bg} border ${colors.border} rounded-xl p-6 transition-all duration-300 cursor-pointer group`}
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
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.4, type: "spring", stiffness: 300 }}
            >
              {loading ? (
                <div className="w-12 h-8 bg-muted rounded animate-pulse" />
              ) : (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay + 0.6 }}
                  key={value}
                >
                  {animateStats ? (
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, type: "spring" }}
                    >
                      {value}
                    </motion.span>
                  ) : (
                    value
                  )}
                </motion.span>
              )}
            </motion.p>

            {subtitle && (
              <motion.p
                className="text-xs text-muted-foreground mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.8 }}
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
          >
            <Icon className="w-7 h-7 text-white" />
          </motion.div>
        </div>

        {/* Hover effect overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          initial={false}
        />
      </motion.div>
    );
  };

  const ActivityCard = ({ bookmark, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02, x: 5 }}
      className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-all duration-300 cursor-pointer group"
    >
      <motion.div
        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
        whileHover={{ rotate: 5 }}
      >
        <ExternalLink className="w-5 h-5 text-white" />
      </motion.div>

      <div className="flex-1 min-w-0">
        <motion.p
          className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors"
          layoutId={`title-${bookmark.id}`}
        >
          {bookmark.title || getDomain(bookmark.url)}
        </motion.p>
        <p className="text-xs text-muted-foreground">
          {formatDate(bookmark.created_at)}
        </p>
      </div>

      <AnimatePresence>
        {bookmark.is_favorite && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          </motion.div>
        )}
      </AnimatePresence>
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
            <BarChart3 className="w-6 h-6 text-primary" />
          </motion.div>
          Analyses et Statistiques
        </h2>
        <p className="text-muted-foreground">
          Aperçu de votre activité et de vos habitudes de sauvegarde
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BarChart3}
          title="Total"
          value={stats.total}
          subtitle="favoris sauvegardés"
          color="blue"
          delay={0.1}
        />

        <StatCard
          icon={Star}
          title="Favoris"
          value={stats.favorites}
          subtitle="marqués importants"
          color="green"
          delay={0.2}
        />

        <StatCard
          icon={FolderOpen}
          title="Collections"
          value={stats.collections}
          subtitle="regroupements"
          color="purple"
          delay={0.3}
        />

        <StatCard
          icon={Calendar}
          title="Cette semaine"
          value={stats.thisWeek}
          subtitle="ajoutés récemment"
          color="orange"
          delay={0.4}
        />
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Overview */}
        <motion.div
          className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 500 }}
            >
              <TrendingUp className="w-5 h-5 text-primary" />
            </motion.div>
            <h3 className="text-lg font-semibold text-foreground">Aperçu d'activité</h3>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Favoris par semaine', value: stats.thisWeek, color: 'text-blue-600' },
              { label: 'Taux de favoris', value: `${stats.total > 0 ? Math.round((stats.favorites / stats.total) * 100) : 0}%`, color: 'text-green-600' },
              { label: 'Moyenne par collection', value: stats.collections > 0 ? Math.round(stats.total / stats.collections) : 0, color: 'text-purple-600' }
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className="flex justify-between items-center p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {item.label}
                </span>
                <motion.span
                  className={`font-semibold ${item.color}`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + index * 0.1, type: "spring" }}
                >
                  {item.value}
                </motion.span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 500 }}
            >
              <Activity className="w-5 h-5 text-primary" />
            </motion.div>
            <h3 className="text-lg font-semibold text-foreground">Activité récente</h3>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="animate-pulse"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </motion.div>
                ))}
              </motion.div>
            ) : recentActivity.length === 0 ? (
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <Calendar className="w-6 h-6 text-muted-foreground" />
                </motion.div>
                <p className="text-sm text-muted-foreground">Aucune activité récente</p>
              </motion.div>
            ) : (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {recentActivity.map((bookmark, index) => (
                  <ActivityCard key={bookmark.id} bookmark={bookmark} index={index} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Performance Insights */}
      <AnimatePresence>
        {stats.total > 0 && (
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
                <Target className="w-5 h-5 text-primary" />
              </motion.div>
              <h3 className="text-lg font-semibold text-foreground">Insights</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total des favoris', value: stats.total, color: 'text-primary', icon: BarChart3 },
                { label: 'Taux de favoris', value: `${stats.total > 0 ? Math.round((stats.favorites / stats.total) * 100) : 0}%`, color: 'text-green-600', icon: Star },
                { label: 'Ajouts cette semaine', value: stats.thisWeek, color: 'text-orange-600', icon: Zap }
              ].map((insight, index) => (
                <motion.div
                  key={insight.label}
                  className="text-center p-6 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all duration-300 group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <motion.div
                    className="w-12 h-12 mx-auto mb-3 bg-background rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.1 + index * 0.1, type: "spring" }}
                  >
                    <insight.icon className={`w-6 h-6 ${insight.color}`} />
                  </motion.div>

                  <motion.div
                    className={`text-3xl font-bold ${insight.color} mb-2`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + index * 0.1, type: "spring" }}
                  >
                    {insight.value}
                  </motion.div>

                  <div className="text-sm text-muted-foreground">{insight.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EnhancedAnalysesTab;