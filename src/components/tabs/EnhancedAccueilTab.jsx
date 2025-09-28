import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Calendar, Tag, ExternalLink, Clock,
  Star, Heart, Plus, Zap, Eye, TrendingUp
} from 'lucide-react';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../services/supabase';
import EmptyState from '../EmptyState';
import { BookmarkListSkeleton } from '../Skeleton';

const EnhancedAccueilTab = forwardRef(({
  searchInputRef,
  refreshTrigger,
  recentlyAdded,
  onRefresh
}, ref) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');
  const [loading, setLoading] = useState(true);
  const [highlightedBookmark, setHighlightedBookmark] = useState(null);
  const [stats, setStats] = useState({ total: 0, favorites: 0, thisWeek: 0 });
  const { user } = useSupabaseAuth();

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    highlightBookmark: (bookmarkId) => {
      setHighlightedBookmark(bookmarkId);
      setTimeout(() => setHighlightedBookmark(null), 3000);
    },
    refresh: fetchBookmarks
  }));

  const sortOptions = [
    { value: 'date', label: 'Date d\'ajout', icon: Calendar },
    { value: 'title', label: 'Titre', icon: Tag },
    { value: 'domain', label: 'Domaine', icon: ExternalLink }
  ];

  const filterOptions = [
    { value: 'all', label: 'Tous', icon: Eye },
    { value: 'favorites', label: 'Favoris', icon: Heart },
    { value: 'recent', label: 'Cette semaine', icon: TrendingUp }
  ];

  // Fetch bookmarks with real-time updates
  const fetchBookmarks = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bookmarksData = data || [];
      setBookmarks(bookmarksData);

      // Calculate stats
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      setStats({
        total: bookmarksData.length,
        favorites: bookmarksData.filter(b => b.is_favorite).length,
        thisWeek: bookmarksData.filter(b => new Date(b.created_at) > oneWeekAgo).length
      });

    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch and refresh trigger
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks, refreshTrigger]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('bookmarks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time bookmark change:', payload);

          if (payload.eventType === 'INSERT') {
            setBookmarks(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setBookmarks(prev => prev.map(b =>
              b.id === payload.new.id ? payload.new : b
            ));
          } else if (payload.eventType === 'DELETE') {
            setBookmarks(prev => prev.filter(b => b.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Filter and sort bookmarks
  useEffect(() => {
    let filtered = [...bookmarks];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(bookmark =>
        bookmark.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (filterBy === 'favorites') {
      filtered = filtered.filter(bookmark => bookmark.is_favorite);
    } else if (filterBy === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(bookmark => new Date(bookmark.created_at) > oneWeekAgo);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'domain':
          const domainA = getDomain(a.url);
          const domainB = getDomain(b.url);
          return domainA.localeCompare(domainB);
        case 'date':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    setFilteredBookmarks(filtered);
  }, [bookmarks, searchTerm, sortBy, filterBy]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 168) { // 7 days
      return `Il y a ${Math.floor(diffInHours / 24)}j`;
    } else {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(date);
    }
  };

  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const toggleFavorite = async (bookmarkId, currentState) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .update({ is_favorite: !currentState })
        .eq('id', bookmarkId);

      if (error) throw error;

      // Optimistic update
      setBookmarks(prev => prev.map(b =>
        b.id === bookmarkId ? { ...b, is_favorite: !currentState } : b
      ));

    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 bg-muted rounded flex-1 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <BookmarkListSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header with Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Mes Favoris récents
          </h2>
          <p className="text-muted-foreground">
            {filteredBookmarks.length} favori{filteredBookmarks.length !== 1 ? 's' : ''} trouvé{filteredBookmarks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Total',
              value: stats.total,
              icon: Eye,
              color: 'from-blue-500 to-blue-600',
              bgColor: 'bg-blue-50 dark:bg-blue-950/20'
            },
            {
              label: 'Favoris',
              value: stats.favorites,
              icon: Heart,
              color: 'from-red-500 to-red-600',
              bgColor: 'bg-red-50 dark:bg-red-950/20'
            },
            {
              label: 'Cette semaine',
              value: stats.thisWeek,
              icon: TrendingUp,
              color: 'from-green-500 to-green-600',
              bgColor: 'bg-green-50 dark:bg-green-950/20'
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`${stat.bgColor} rounded-xl p-4 border border-border/50`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <motion.p
                      className="text-2xl font-bold text-foreground"
                      key={stat.value}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      {stat.value}
                    </motion.p>
                  </div>
                  <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Rechercher dans vos favoris... (Ctrl+S)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-primary/50 focus:shadow-lg focus:shadow-primary/10"
          />
          {searchTerm && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="w-3 h-3 rotate-45" />
            </motion.button>
          )}
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          {sortOptions.find(o => o.value === sortBy)?.icon && (
            React.createElement(sortOptions.find(o => o.value === sortBy).icon, {
              className: "w-4 h-4 text-muted-foreground"
            })
          )}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent hover:border-primary/50 transition-all duration-200"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter By */}
        <div className="flex items-center gap-2">
          {filterOptions.find(o => o.value === filterBy)?.icon && (
            React.createElement(filterOptions.find(o => o.value === filterBy).icon, {
              className: "w-4 h-4 text-muted-foreground"
            })
          )}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent hover:border-primary/50 transition-all duration-200"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Bookmarks List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredBookmarks.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <EmptyState
                type={searchTerm || filterBy !== 'all' ? 'search' : 'bookmarks'}
                title={searchTerm || filterBy !== 'all' ? 'Aucun résultat trouvé' : undefined}
                description={searchTerm || filterBy !== 'all'
                  ? 'Essayez de modifier vos critères de recherche ou vos filtres'
                  : undefined
                }
                action={() => {
                  if (searchTerm || filterBy !== 'all') {
                    setSearchTerm('');
                    setFilterBy('all');
                  } else {
                    document.querySelector('[data-add-bookmark]')?.click();
                  }
                }}
                actionLabel={searchTerm || filterBy !== 'all' ? 'Effacer les filtres' : undefined}
              />
            </motion.div>
          ) : (
            filteredBookmarks.map((bookmark, index) => (
              <motion.div
                key={bookmark.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: highlightedBookmark === bookmark.id ? 1.02 : 1,
                  boxShadow: highlightedBookmark === bookmark.id
                    ? '0 8px 25px -8px rgba(59, 130, 246, 0.5)'
                    : '0 0 0 0px transparent'
                }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  delay: index * 0.05,
                  layout: { duration: 0.3 }
                }}
                className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
                  recentlyAdded?.id === bookmark.id
                    ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20'
                    : highlightedBookmark === bookmark.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background hover:bg-accent/50'
                }`}
              >
                {/* New bookmark indicator */}
                {recentlyAdded?.id === bookmark.id && (
                  <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute top-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-br-lg"
                  >
                    <Zap className="w-3 h-3 inline mr-1" />
                    Nouveau !
                  </motion.div>
                )}

                <div className="flex items-start gap-4 p-4">
                  {/* Favicon or colored indicator */}
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 relative overflow-hidden"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {bookmark.favicon ? (
                      <img
                        src={bookmark.favicon}
                        alt="Favicon"
                        className="w-6 h-6 rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <ExternalLink className={`w-6 h-6 text-white ${bookmark.favicon ? 'hidden' : 'block'}`} />
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <motion.h3
                          className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2"
                          layoutId={`title-${bookmark.id}`}
                        >
                          {bookmark.title || 'Sans titre'}
                        </motion.h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {bookmark.description || getDomain(bookmark.url)}
                        </p>

                        {/* Tags */}
                        {bookmark.tags && bookmark.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {bookmark.tags.slice(0, 3).map((tag, tagIndex) => (
                              <motion.span
                                key={tag}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: tagIndex * 0.1 }}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                              >
                                {tag}
                              </motion.span>
                            ))}
                            {bookmark.tags.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                +{bookmark.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(bookmark.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            {getDomain(bookmark.url)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <motion.button
                          onClick={() => toggleFavorite(bookmark.id, bookmark.is_favorite)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            bookmark.is_favorite
                              ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-950/20'
                              : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title={bookmark.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                          <Heart className={`w-4 h-4 ${bookmark.is_favorite ? 'fill-current' : ''}`} />
                        </motion.button>

                        <motion.a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Ouvrir le lien"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </motion.a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover effect overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  initial={false}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer stats */}
      {filteredBookmarks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-4 border-t border-border/50"
        >
          <p className="text-sm text-muted-foreground">
            {filteredBookmarks.length} sur {bookmarks.length} favoris affichés
          </p>
        </motion.div>
      )}
    </div>
  );
});

EnhancedAccueilTab.displayName = 'EnhancedAccueilTab';

export default EnhancedAccueilTab;