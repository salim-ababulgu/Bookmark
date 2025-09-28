import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Star, FolderOpen, Calendar, ExternalLink } from 'lucide-react';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../services/supabase';

const AnalysesTab = () => {
  const [stats, setStats] = useState({
    total: 0,
    favorites: 0,
    collections: 0,
    thisWeek: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600'
    };

    return (
      <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-2">{loading ? '...' : value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Analyses et Statistiques</h2>
        <p className="text-muted-foreground">
          Aperçu de votre activité et de vos habitudes de sauvegarde
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BarChart3}
          title="Total"
          value={stats.total}
          subtitle="favoris sauvegardés"
          color="blue"
        />

        <StatCard
          icon={Star}
          title="Favoris"
          value={stats.favorites}
          subtitle="marqués importants"
          color="green"
        />

        <StatCard
          icon={FolderOpen}
          title="Collections"
          value={stats.collections}
          subtitle="regroupements"
          color="purple"
        />

        <StatCard
          icon={Calendar}
          title="Cette semaine"
          value={stats.thisWeek}
          subtitle="ajoutés récemment"
          color="orange"
        />
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Overview */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Aperçu d'activité</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Favoris par semaine</span>
              <span className="font-medium text-foreground">{stats.thisWeek}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Taux de favoris</span>
              <span className="font-medium text-foreground">
                {stats.total > 0 ? Math.round((stats.favorites / stats.total) * 100) : 0}%
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Moyenne par collection</span>
              <span className="font-medium text-foreground">
                {stats.collections > 0 ? Math.round(stats.total / stats.collections) : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Activité récente</h3>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Aucune activité récente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((bookmark) => (
                <div key={bookmark.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {bookmark.title || getDomain(bookmark.url)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(bookmark.created_at)}
                    </p>
                  </div>
                  {bookmark.is_favorite && (
                    <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Performance Insights */}
      {stats.total > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Insights</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total des favoris</div>
            </div>

            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {stats.total > 0 ? Math.round((stats.favorites / stats.total) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Taux de favoris</div>
            </div>

            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">{stats.thisWeek}</div>
              <div className="text-sm text-muted-foreground">Ajouts cette semaine</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysesTab;