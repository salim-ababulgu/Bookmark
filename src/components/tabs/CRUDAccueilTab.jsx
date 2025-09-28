import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Grid, List, RefreshCw, Download, Upload,
  Bookmark, TrendingUp, Eye, Heart, Archive,
  Clock, ExternalLink, Tag, Globe, Star,
  CheckCircle, AlertCircle, Zap
} from 'lucide-react';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { getUserBookmarks, addBookmark, updateBookmark, deleteBookmark } from '../../services/supabaseDataService';
import { useFeedback, showAdvancedToast } from '../feedback/AdvancedFeedbackSystem';
import AdvancedBookmarkFilters from '../AdvancedBookmarkFilters';
import BookmarkQuickActions from '../BookmarkQuickActions';
import AddBookmarkModal from '../AddBookmarkModal';
import EditBookmarkModal from '../EditBookmarkModal';
import ImportExportModal from '../ImportExportModal';
import EmptyState from '../EmptyState';

const CRUDAccueilTab = () => {
  const { user } = useSupabaseAuth();
  const { showLoading, hideLoading } = useFeedback();
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [selectedBookmarks, setSelectedBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    favorites: 0,
    recent: 0,
    archived: 0,
    unread: 0
  });

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [recentlyAdded, setRecentlyAdded] = useState(null);

  const searchInputRef = useRef(null);

  // Fetch bookmarks
  const fetchBookmarks = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const result = await getUserBookmarks(user.id);
      if (result.success) {
        setBookmarks(result.data);
        calculateStats(result.data);
      } else {
        showAdvancedToast('error', 'Erreur de chargement', {
          description: 'Impossible de charger les favoris'
        });
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      showAdvancedToast('error', 'Erreur', {
        description: 'Une erreur est survenue lors du chargement'
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Calculate stats
  const calculateStats = (bookmarksData) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    setStats({
      total: bookmarksData.length,
      favorites: bookmarksData.filter(b => b.is_favorite).length,
      recent: bookmarksData.filter(b => new Date(b.created_at) > oneWeekAgo).length,
      archived: bookmarksData.filter(b => b.is_archived).length,
      unread: bookmarksData.filter(b => !b.is_read).length
    });
  };

  // Initial load
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  // Apply filters to bookmarks
  const applyFilters = useCallback((filtersConfig) => {
    let filtered = [...bookmarks];

    // Search filter
    if (filtersConfig.search) {
      const searchLower = filtersConfig.search.toLowerCase();
      filtered = filtered.filter(bookmark =>
        bookmark.title?.toLowerCase().includes(searchLower) ||
        bookmark.url?.toLowerCase().includes(searchLower) ||
        bookmark.description?.toLowerCase().includes(searchLower) ||
        bookmark.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    switch (filtersConfig.status) {
      case 'favorites':
        filtered = filtered.filter(b => b.is_favorite);
        break;
      case 'archived':
        filtered = filtered.filter(b => b.is_archived);
        break;
      case 'unread':
        filtered = filtered.filter(b => !b.is_read);
        break;
      case 'read':
        filtered = filtered.filter(b => b.is_read);
        break;
    }

    // Tags filter
    if (filtersConfig.tags?.length > 0) {
      filtered = filtered.filter(bookmark =>
        bookmark.tags?.some(tag => filtersConfig.tags.includes(tag))
      );
    }

    // Domains filter
    if (filtersConfig.domains?.length > 0) {
      filtered = filtered.filter(bookmark => {
        try {
          const domain = new URL(bookmark.url).hostname.replace('www.', '');
          return filtersConfig.domains.includes(domain);
        } catch {
          return false;
        }
      });
    }

    // Date range filter
    if (filtersConfig.dateRange && filtersConfig.dateRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (filtersConfig.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'custom':
          if (filtersConfig.customDateStart) {
            startDate = new Date(filtersConfig.customDateStart);
          }
          break;
      }

      if (startDate) {
        filtered = filtered.filter(b => new Date(b.created_at) >= startDate);
      }

      if (filtersConfig.dateRange === 'custom' && filtersConfig.customDateEnd) {
        const endDate = new Date(filtersConfig.customDateEnd);
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(b => new Date(b.created_at) <= endDate);
      }
    }

    // Sort
    const { sortBy = 'created_at', sortOrder = 'desc' } = filtersConfig;
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'domain') {
        try {
          aVal = new URL(a.url).hostname.replace('www.', '');
          bVal = new URL(b.url).hostname.replace('www.', '');
        } catch {
          aVal = a.url;
          bVal = b.url;
        }
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (sortBy.includes('_at') || aVal instanceof Date || bVal instanceof Date) {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    setFilteredBookmarks(filtered);
  }, [bookmarks]);

  // Handle filters change
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  }, [applyFilters]);

  // Apply filters when bookmarks change
  useEffect(() => {
    applyFilters(filters);
  }, [bookmarks, filters, applyFilters]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 168) {
      return `Il y a ${Math.floor(diffInHours / 24)}j`;
    } else {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(date);
    }
  };

  // Get domain from URL
  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  // Handle bookmark actions
  const handleBookmarkUpdate = (updatedBookmark) => {
    setBookmarks(prev => prev.map(b =>
      b.id === updatedBookmark.id ? updatedBookmark : b
    ));
    calculateStats(bookmarks.map(b =>
      b.id === updatedBookmark.id ? updatedBookmark : b
    ));
  };

  const handleBookmarkDelete = (bookmarkId) => {
    const newBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
    setBookmarks(newBookmarks);
    calculateStats(newBookmarks);
    setSelectedBookmarks(prev => prev.filter(id => id !== bookmarkId));
  };

  const handleBookmarkAdd = (newBookmark) => {
    const newBookmarks = [newBookmark, ...bookmarks];
    setBookmarks(newBookmarks);
    calculateStats(newBookmarks);
    setRecentlyAdded(newBookmark);
    setTimeout(() => setRecentlyAdded(null), 5000);
  };

  // Toggle bookmark selection
  const toggleBookmarkSelection = (bookmarkId) => {
    setSelectedBookmarks(prev =>
      prev.includes(bookmarkId)
        ? prev.filter(id => id !== bookmarkId)
        : [...prev, bookmarkId]
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="h-32 bg-muted rounded-lg mb-6"></div>
          <div className="grid gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-primary" />
            Mes Favoris
          </h2>
          <p className="text-muted-foreground mt-1">
            Gérez et organisez tous vos favoris en un seul endroit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchBookmarks()}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            title="Importer/Exporter"
          >
            <Upload className="w-4 h-4" />
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            title={`Vue ${viewMode === 'list' ? 'grille' : 'liste'}`}
          >
            {viewMode === 'list' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            data-add-bookmark
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
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
            label: 'Récents',
            value: stats.recent,
            icon: TrendingUp,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50 dark:bg-green-950/20'
          },
          {
            label: 'Archivés',
            value: stats.archived,
            icon: Archive,
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-950/20'
          },
          {
            label: 'Non lus',
            value: stats.unread,
            icon: Clock,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-950/20'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
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
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AdvancedBookmarkFilters
          bookmarks={bookmarks}
          onFiltersChange={handleFiltersChange}
          className="bg-card/50 rounded-xl p-4 border border-border/50"
        />
      </motion.div>

      {/* Results Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between py-2 border-b border-border/50"
      >
        <p className="text-sm text-muted-foreground">
          {filteredBookmarks.length} sur {bookmarks.length} favoris affichés
        </p>
        {selectedBookmarks.length > 0 && (
          <p className="text-sm text-primary font-medium">
            {selectedBookmarks.length} sélectionné{selectedBookmarks.length > 1 ? 's' : ''}
          </p>
        )}
      </motion.div>

      {/* Bookmarks List/Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
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
                type={Object.values(filters).some(f => f && f !== 'all') ? 'search' : 'bookmarks'}
                title={Object.values(filters).some(f => f && f !== 'all') ? 'Aucun résultat trouvé' : 'Aucun favori'}
                description={Object.values(filters).some(f => f && f !== 'all')
                  ? 'Essayez de modifier vos critères de recherche ou filtres'
                  : 'Commencez par ajouter votre premier favori'
                }
                action={() => {
                  if (Object.values(filters).some(f => f && f !== 'all')) {
                    handleFiltersChange({});
                  } else {
                    setShowAddModal(true);
                  }
                }}
                actionLabel={Object.values(filters).some(f => f && f !== 'all') ? 'Effacer les filtres' : 'Ajouter un favori'}
              />
            </motion.div>
          ) : (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
            }>
              {filteredBookmarks.map((bookmark, index) => (
                <motion.div
                  key={bookmark.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.03 }}
                  className={`group relative border border-border rounded-xl bg-background hover:bg-accent/50 transition-all duration-200 ${
                    selectedBookmarks.includes(bookmark.id) ? 'border-primary bg-primary/5' : ''
                  } ${recentlyAdded?.id === bookmark.id ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' : ''}`}
                >
                  {/* New bookmark indicator */}
                  {recentlyAdded?.id === bookmark.id && (
                    <motion.div
                      initial={{ opacity: 0, x: -100 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute top-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-br-lg rounded-tl-xl"
                    >
                      <Zap className="w-3 h-3 inline mr-1" />
                      Nouveau !
                    </motion.div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Selection checkbox */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                        <input
                          type="checkbox"
                          checked={selectedBookmarks.includes(bookmark.id)}
                          onChange={() => toggleBookmarkSelection(bookmark.id)}
                          className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                        />
                      </div>

                      {/* Favicon */}
                      <motion.div
                        className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                      >
                        <ExternalLink className="w-6 h-6 text-white" />
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                              {bookmark.title || 'Sans titre'}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {bookmark.description || getDomain(bookmark.url)}
                            </p>

                            {/* Tags */}
                            {bookmark.tags && bookmark.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {bookmark.tags.slice(0, 3).map(tag => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {bookmark.tags.length > 3 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{bookmark.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Meta info */}
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(bookmark.created_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {getDomain(bookmark.url)}
                              </span>
                            </div>

                            {/* Status indicators */}
                            <div className="flex items-center gap-2 mt-2">
                              {bookmark.is_favorite && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-600 border border-red-200">
                                  <Heart className="w-3 h-3 fill-current" />
                                  Favori
                                </span>
                              )}
                              {bookmark.is_archived && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-orange-50 text-orange-600 border border-orange-200">
                                  <Archive className="w-3 h-3" />
                                  Archivé
                                </span>
                              )}
                              {!bookmark.is_read && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-200">
                                  <Eye className="w-3 h-3" />
                                  Non lu
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <BookmarkQuickActions
                              bookmark={bookmark}
                              onEdit={(bookmark) => {
                                setEditingBookmark(bookmark);
                                setShowEditModal(true);
                              }}
                              onUpdate={handleBookmarkUpdate}
                              onDelete={handleBookmarkDelete}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modals */}
      <AddBookmarkModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={(newBookmark) => {
          handleBookmarkAdd(newBookmark);
          setShowAddModal(false);
          showAdvancedToast('success', 'Favori ajouté avec succès');
        }}
      />

      <EditBookmarkModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingBookmark(null);
        }}
        bookmark={editingBookmark}
        onSuccess={(updatedBookmark) => {
          handleBookmarkUpdate(updatedBookmark);
          setShowEditModal(false);
          setEditingBookmark(null);
          showAdvancedToast('success', 'Favori modifié avec succès');
        }}
      />

      <ImportExportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={() => {
          fetchBookmarks();
          showAdvancedToast('success', 'Import terminé avec succès');
        }}
      />
    </div>
  );
};

export default CRUDAccueilTab;