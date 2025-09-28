import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Plus, Edit3, Trash2, Star, Heart,
  ExternalLink, Clock, Tag, Eye, EyeOff, Copy, Share,
  MoreHorizontal, Grid, List, SortAsc, SortDesc,
  Calendar, Globe, Archive, Bookmark, CheckCircle,
  AlertCircle, RefreshCw, Download, Upload
} from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { getUserBookmarks, addBookmark, updateBookmark, deleteBookmark } from '../services/supabaseDataService';
import { useToast } from '../hooks/useToast';
import { useFeedback, showAdvancedToast } from './feedback/AdvancedFeedbackSystem';
import AddBookmarkModal from './AddBookmarkModal';
import EditBookmarkModal from './EditBookmarkModal';

const AdvancedBookmarkCRUD = () => {
  const { user } = useSupabaseAuth();
  const { showLoading, hideLoading } = useFeedback();
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookmarks, setSelectedBookmarks] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState({
    status: 'all', // all, favorites, archived, recent
    tags: [],
    dateRange: null
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const searchInputRef = useRef(null);

  // Fetch bookmarks
  const fetchBookmarks = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const result = await getUserBookmarks(user.id);
      if (result.success) {
        setBookmarks(result.data);
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

  // Initial load
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

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

    // Apply status filter
    switch (filterConfig.status) {
      case 'favorites':
        filtered = filtered.filter(b => b.is_favorite);
        break;
      case 'archived':
        filtered = filtered.filter(b => b.is_archived);
        break;
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = filtered.filter(b => new Date(b.created_at) > oneWeekAgo);
        break;
    }

    // Apply tags filter
    if (filterConfig.tags.length > 0) {
      filtered = filtered.filter(bookmark =>
        bookmark.tags?.some(tag => filterConfig.tags.includes(tag))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const { key, direction } = sortConfig;
      let aVal = a[key];
      let bVal = b[key];

      if (key === 'domain') {
        aVal = getDomain(a.url);
        bVal = getDomain(b.url);
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (aVal instanceof Date || bVal instanceof Date || key.includes('_at')) {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    });

    setFilteredBookmarks(filtered);
  }, [bookmarks, searchTerm, filterConfig, sortConfig]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get domain from URL
  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

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

  // Toggle bookmark selection
  const toggleBookmarkSelection = (bookmarkId) => {
    setSelectedBookmarks(prev => {
      const newSelection = prev.includes(bookmarkId)
        ? prev.filter(id => id !== bookmarkId)
        : [...prev, bookmarkId];

      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  };

  // Select all visible bookmarks
  const selectAllVisible = () => {
    const allVisible = filteredBookmarks.map(b => b.id);
    const allSelected = allVisible.every(id => selectedBookmarks.includes(id));

    if (allSelected) {
      setSelectedBookmarks([]);
      setShowBulkActions(false);
    } else {
      setSelectedBookmarks(allVisible);
      setShowBulkActions(true);
    }
  };

  // Quick actions
  const toggleFavorite = async (bookmarkId) => {
    const bookmark = bookmarks.find(b => b.id === bookmarkId);
    if (!bookmark) return;

    try {
      const updatedData = { ...bookmark, is_favorite: !bookmark.is_favorite };
      const result = await updateBookmark(bookmarkId, updatedData);

      if (result.success) {
        setBookmarks(prev => prev.map(b =>
          b.id === bookmarkId ? { ...b, is_favorite: !b.is_favorite } : b
        ));
        showAdvancedToast('success',
          bookmark.is_favorite ? 'Retiré des favoris' : 'Ajouté aux favoris'
        );
      }
    } catch (error) {
      showAdvancedToast('error', 'Erreur', {
        description: 'Impossible de modifier le favori'
      });
    }
  };

  const toggleArchive = async (bookmarkId) => {
    const bookmark = bookmarks.find(b => b.id === bookmarkId);
    if (!bookmark) return;

    try {
      const updatedData = { ...bookmark, is_archived: !bookmark.is_archived };
      const result = await updateBookmark(bookmarkId, updatedData);

      if (result.success) {
        setBookmarks(prev => prev.map(b =>
          b.id === bookmarkId ? { ...b, is_archived: !b.is_archived } : b
        ));
        showAdvancedToast('success',
          bookmark.is_archived ? 'Désarchivé' : 'Archivé'
        );
      }
    } catch (error) {
      showAdvancedToast('error', 'Erreur', {
        description: 'Impossible de modifier le statut'
      });
    }
  };

  const handleDelete = async (bookmarkId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce favori ?')) return;

    try {
      const result = await deleteBookmark(bookmarkId);
      if (result.success) {
        setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
        showAdvancedToast('success', 'Favori supprimé');
      }
    } catch (error) {
      showAdvancedToast('error', 'Erreur', {
        description: 'Impossible de supprimer le favori'
      });
    }
  };

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      showAdvancedToast('success', 'URL copiée');
    } catch (error) {
      showAdvancedToast('error', 'Erreur', {
        description: 'Impossible de copier l\'URL'
      });
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (!confirm(`Supprimer ${selectedBookmarks.length} favoris ?`)) return;

    showLoading('Suppression en cours...');
    try {
      const promises = selectedBookmarks.map(id => deleteBookmark(id));
      await Promise.all(promises);

      setBookmarks(prev => prev.filter(b => !selectedBookmarks.includes(b.id)));
      setSelectedBookmarks([]);
      setShowBulkActions(false);
      hideLoading();
      showAdvancedToast('success', `${selectedBookmarks.length} favoris supprimés`);
    } catch (error) {
      hideLoading();
      showAdvancedToast('error', 'Erreur lors de la suppression');
    }
  };

  const handleBulkFavorite = async (isFavorite) => {
    showLoading('Mise à jour en cours...');
    try {
      const promises = selectedBookmarks.map(async (id) => {
        const bookmark = bookmarks.find(b => b.id === id);
        if (bookmark) {
          return updateBookmark(id, { ...bookmark, is_favorite: isFavorite });
        }
      });

      await Promise.all(promises);

      setBookmarks(prev => prev.map(b =>
        selectedBookmarks.includes(b.id) ? { ...b, is_favorite: isFavorite } : b
      ));
      setSelectedBookmarks([]);
      setShowBulkActions(false);
      hideLoading();
      showAdvancedToast('success',
        `${selectedBookmarks.length} favoris ${isFavorite ? 'ajoutés aux' : 'retirés des'} favoris`
      );
    } catch (error) {
      hideLoading();
      showAdvancedToast('error', 'Erreur lors de la mise à jour');
    }
  };

  // Get all unique tags
  const getAllTags = () => {
    const tags = new Set();
    bookmarks.forEach(bookmark => {
      bookmark.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="flex gap-4 mb-6">
            <div className="h-10 bg-muted rounded flex-1"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </div>
          <div className="grid gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mes Favoris</h2>
          <p className="text-muted-foreground">
            {filteredBookmarks.length} sur {bookmarks.length} favoris
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
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            title={`Vue ${viewMode === 'list' ? 'grille' : 'liste'}`}
          >
            {viewMode === 'list' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Rechercher dans vos favoris..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={filterConfig.status}
            onChange={(e) => setFilterConfig(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous</option>
            <option value="favorites">Favoris</option>
            <option value="archived">Archivés</option>
            <option value="recent">Récents</option>
          </select>

          {getAllTags().length > 0 && (
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  setFilterConfig(prev => ({
                    ...prev,
                    tags: prev.tags.includes(e.target.value)
                      ? prev.tags.filter(t => t !== e.target.value)
                      : [...prev.tags, e.target.value]
                  }));
                }
              }}
              className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Tags</option>
              {getAllTags().map(tag => (
                <option key={tag} value={tag}>
                  {tag} {filterConfig.tags.includes(tag) ? '✓' : ''}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Selected filters */}
      {filterConfig.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterConfig.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
            >
              {tag}
              <button
                onClick={() => setFilterConfig(prev => ({
                  ...prev,
                  tags: prev.tags.filter(t => t !== tag)
                }))}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Bulk Actions */}
      <AnimatePresence>
        {showBulkActions && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-lg"
          >
            <span className="text-sm font-medium text-foreground">
              {selectedBookmarks.length} sélectionné{selectedBookmarks.length > 1 ? 's' : ''}
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => handleBulkFavorite(true)}
                className="px-3 py-1.5 text-sm bg-background border border-border rounded hover:bg-accent transition-colors"
              >
                <Heart className="w-4 h-4 inline mr-1" />
                Favoris
              </button>

              <button
                onClick={() => handleBulkFavorite(false)}
                className="px-3 py-1.5 text-sm bg-background border border-border rounded hover:bg-accent transition-colors"
              >
                <Heart className="w-4 h-4 inline mr-1" />
                Retirer
              </button>

              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                Supprimer
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedBookmarks([]);
                setShowBulkActions(false);
              }}
              className="ml-auto p-1.5 text-muted-foreground hover:text-foreground rounded"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort Controls */}
      <div className="flex items-center gap-4 py-2 border-b border-border">
        <span className="text-sm text-muted-foreground">Trier par:</span>
        <div className="flex gap-2">
          {[
            { key: 'created_at', label: 'Date' },
            { key: 'title', label: 'Titre' },
            { key: 'domain', label: 'Domaine' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`flex items-center gap-1 px-2 py-1 text-sm rounded transition-colors ${
                sortConfig.key === key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {label}
              {sortConfig.key === key && (
                sortConfig.direction === 'asc'
                  ? <SortAsc className="w-3 h-3" />
                  : <SortDesc className="w-3 h-3" />
              )}
            </button>
          ))}
        </div>

        {filteredBookmarks.length > 0 && (
          <button
            onClick={selectAllVisible}
            className="ml-auto text-sm text-primary hover:underline"
          >
            {filteredBookmarks.every(b => selectedBookmarks.includes(b.id))
              ? 'Tout désélectionner'
              : 'Tout sélectionner'
            }
          </button>
        )}
      </div>

      {/* Bookmarks List/Grid */}
      <AnimatePresence mode="popLayout">
        {filteredBookmarks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm || filterConfig.status !== 'all' || filterConfig.tags.length > 0
                ? 'Aucun résultat trouvé'
                : 'Aucun favori'
              }
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterConfig.status !== 'all' || filterConfig.tags.length > 0
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par ajouter votre premier favori'
              }
            </p>
            {searchTerm || filterConfig.status !== 'all' || filterConfig.tags.length > 0 ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterConfig({ status: 'all', tags: [], dateRange: null });
                }}
                className="px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
              >
                Effacer les filtres
              </button>
            ) : (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Ajouter un favori
              </button>
            )}
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
                transition={{ delay: index * 0.05 }}
                className={`group relative border border-border rounded-lg bg-background hover:bg-accent/50 transition-all duration-200 ${
                  selectedBookmarks.includes(bookmark.id)
                    ? 'border-primary bg-primary/5'
                    : ''
                } ${viewMode === 'grid' ? 'p-4' : 'p-4'}`}
              >
                {/* Selection checkbox */}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <input
                    type="checkbox"
                    checked={selectedBookmarks.includes(bookmark.id)}
                    onChange={() => toggleBookmarkSelection(bookmark.id)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                  />
                </div>

                <div className={`flex gap-4 ${selectedBookmarks.includes(bookmark.id) ? 'ml-6' : ''}`}>
                  {/* Favicon */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-5 h-5 text-white" />
                  </div>

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
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                          onClick={() => toggleFavorite(bookmark.id)}
                          className={`p-1.5 rounded transition-colors ${
                            bookmark.is_favorite
                              ? 'text-red-500 hover:bg-red-50'
                              : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
                          }`}
                          title={bookmark.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                          <Heart className={`w-4 h-4 ${bookmark.is_favorite ? 'fill-current' : ''}`} />
                        </button>

                        <button
                          onClick={() => copyUrl(bookmark.url)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                          title="Copier l'URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingBookmark(bookmark);
                            setShowEditModal(true);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                          title="Ouvrir"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <div className="relative">
                          <button
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                            title="Plus d'actions"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
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
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AddBookmarkModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={(newBookmark) => {
          setBookmarks(prev => [newBookmark, ...prev]);
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
          setBookmarks(prev => prev.map(b =>
            b.id === updatedBookmark.id ? updatedBookmark : b
          ));
          setShowEditModal(false);
          setEditingBookmark(null);
          showAdvancedToast('success', 'Favori modifié avec succès');
        }}
      />
    </div>
  );
};

export default AdvancedBookmarkCRUD;