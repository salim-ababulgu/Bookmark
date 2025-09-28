// Dashboard - Version complète avec focus sur l'ajout de favoris
import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { getUserBookmarks, getUserCollections, updateBookmark, deleteBookmark, setupDatabase } from '../services/supabaseDataService';
import AddBookmarkModal from '../components/AddBookmarkModal';
import CollectionModal from '../components/CollectionModal';
import ImportExportModal from '../components/ImportExportModal';
import EditBookmarkModal from '../components/EditBookmarkModal';
import { DashboardSkeleton } from '../components/Skeleton';
import { toast } from 'sonner';
import {
  Plus,
  Star,
  BookOpen,
  Folder,
  TrendingUp,
  Calendar,
  ExternalLink,
  Heart,
  Edit3,
  Trash2,
  BarChart3,
  Activity,
  Clock,
  Target
} from 'lucide-react';

const Dashboard = () => {
  const { user, userEmail, userName } = useSupabaseAuth();
  const [stats, setStats] = useState({
    totalBookmarks: 0,
    collections: 0,
    favoriteBookmarks: 0,
    readBookmarks: 0,
    recentBookmarks: [],
    topTags: [],
    weeklyStats: { current: 0, previous: 0 }
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editBookmarkModal, setEditBookmarkModal] = useState({ isOpen: false, bookmark: null });
  const [collectionModal, setCollectionModal] = useState(false);
  const [importExportModal, setImportExportModal] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyticsView, setAnalyticsView] = useState('overview'); // 'overview', 'detailed'

  // Fonction pour charger les données
  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // DIAGNOSTIC: Vérifier la base de données en cas d'erreur
      console.log('🔍 Chargement des données utilisateur...');

      // Charger bookmarks et collections en parallèle
      const [bookmarksResult, collectionsResult] = await Promise.all([
        getUserBookmarks(user.id),
        getUserCollections(user.id)
      ]);

      // Si erreur 404, lancer le diagnostic
      if (!bookmarksResult.success && bookmarksResult.error?.includes('404')) {
        console.log('🚨 Erreur 404 détectée - Lancement du diagnostic...');
        await setupDatabase();
        return;
      }

      if (bookmarksResult.success) {
        const bookmarksData = bookmarksResult.data;
        setBookmarks(bookmarksData);

        // Calculer les statistiques détaillées
        const favoriteCount = bookmarksData.filter(b => b.is_favorite).length;
        const readCount = bookmarksData.filter(b => b.is_read).length;

        // Calculer les tags les plus utilisés
        const tagCounts = {};
        bookmarksData.forEach(bookmark => {
          if (bookmark.tags && Array.isArray(bookmark.tags)) {
            bookmark.tags.forEach(tag => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          }
        });
        const topTags = Object.entries(tagCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([tag, count]) => ({ tag, count }));

        // Calculer les stats hebdomadaires (simulation)
        const currentWeek = bookmarksData.filter(b => {
          const bookmarkDate = new Date(b.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return bookmarkDate > weekAgo;
        }).length;

        setStats(prev => ({
          ...prev,
          totalBookmarks: bookmarksData.length,
          favoriteBookmarks: favoriteCount,
          readBookmarks: readCount,
          recentBookmarks: bookmarksData.slice(0, 8),
          topTags,
          weeklyStats: { current: currentWeek, previous: Math.max(0, currentWeek - 2) }
        }));
      }

      if (collectionsResult.success) {
        setCollections(collectionsResult.data);
        setStats(prev => ({
          ...prev,
          collections: collectionsResult.data.length
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('🏠 Dashboard: Utilisateur connecté:', userEmail);
      loadData();
    }
  }, [user]);

  // Gestionnaires pour les modals
  const handleCollectionSaved = (newCollection) => {
    setCollections(prev => [newCollection, ...prev]);
    loadData();
  };

  const handleImportSuccess = () => {
    loadData();
  };

  // Gestionnaires pour les favoris
  const handleEditBookmark = (bookmark) => {
    setEditBookmarkModal({ isOpen: true, bookmark });
  };

  const handleBookmarkUpdated = (updatedBookmark) => {
    setBookmarks(prev => prev.map(b => b.id === updatedBookmark.id ? updatedBookmark : b));
    loadData(); // Recharger les stats
  };

  const handleDeleteBookmark = async (bookmarkId, bookmarkTitle) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${bookmarkTitle}" ?`)) return;

    try {
      const result = await deleteBookmark(bookmarkId, user.id);
      if (result.success) {
        toast.success('Favori supprimé avec succès !');
        loadData(); // Recharger toutes les données
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erreur suppression favori:', error);
      toast.error('Erreur lors de la suppression du favori');
    }
  };

  const handleToggleFavorite = async (bookmarkId, isFavorite) => {
    try {
      const result = await updateBookmark(bookmarkId, { is_favorite: isFavorite }, user.id);
      if (result.success) {
        toast.success(isFavorite ? 'Ajouté aux favoris !' : 'Retiré des favoris !');
        setBookmarks(prev => prev.map(b => b.id === bookmarkId ? { ...b, is_favorite: isFavorite } : b));
        loadData(); // Recharger les stats
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erreur toggle favori:', error);
      toast.error('Erreur lors de la mise à jour du favori');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Chargement...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header avec CTA principal */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Bonjour, {userName || userEmail} ! 👋
              </h1>
              <p className="text-muted-foreground mt-2">
                Organisez et gérez vos favoris facilement
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus-ring font-medium shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Ajouter un favori
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Section principale - Favoris récents avec actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalBookmarks}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Heart className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.favoriteBookmarks}</p>
                    <p className="text-xs text-muted-foreground">Favoris</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Folder className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.collections}</p>
                    <p className="text-xs text-muted-foreground">Collections</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.weeklyStats.current}</p>
                    <p className="text-xs text-muted-foreground">Cette semaine</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Favoris récents avec actions complètes */}
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Favoris récents</h3>
                <button
                  onClick={() => window.location.href = '/bookmarks'}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Voir tous ({stats.totalBookmarks})
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Chargement...</p>
                </div>
              ) : stats.recentBookmarks.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentBookmarks.map((bookmark) => {
                    const domain = new URL(bookmark.url).hostname.replace('www.', '');
                    return (
                      <div
                        key={bookmark.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                          {bookmark.title.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-foreground">{bookmark.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{domain}</p>
                          {bookmark.tags && bookmark.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {bookmark.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleToggleFavorite(bookmark.id, !bookmark.is_favorite)}
                            className={`p-1.5 rounded-full transition-colors ${
                              bookmark.is_favorite ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                            }`}
                            title={bookmark.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                          >
                            <Heart className={`h-4 w-4 ${bookmark.is_favorite ? 'fill-current' : ''}`} />
                          </button>

                          <button
                            onClick={() => handleEditBookmark(bookmark)}
                            className="p-1.5 rounded-full text-muted-foreground hover:text-blue-500 transition-colors"
                            title="Modifier"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => window.open(bookmark.url, '_blank')}
                            className="p-1.5 rounded-full text-muted-foreground hover:text-green-500 transition-colors"
                            title="Ouvrir"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteBookmark(bookmark.id, bookmark.title)}
                            className="p-1.5 rounded-full text-muted-foreground hover:text-red-500 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-foreground font-medium mb-2">Aucun favori pour le moment</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Commencez par ajouter votre premier favori !
                  </p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter maintenant
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Analytics et Actions */}
          <div className="space-y-6">
            {/* Actions rapides */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Actions rapides
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setCollectionModal(true)}
                  className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors flex items-center gap-3"
                >
                  <Folder className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Créer une collection</span>
                </button>
                <button
                  onClick={() => setImportExportModal(true)}
                  className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors flex items-center gap-3"
                >
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Import/Export</span>
                </button>
              </div>
            </div>

            {/* Analytics */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </h3>

              <div className="space-y-4">
                {/* Progression hebdomadaire */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Cette semaine</span>
                    <span className="text-sm font-medium text-foreground">{stats.weeklyStats.current}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (stats.weeklyStats.current / 10) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tags populaires */}
                {stats.topTags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Tags populaires</h4>
                    <div className="space-y-1">
                      {stats.topTags.slice(0, 3).map(({ tag, count }) => (
                        <div key={tag} className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">#{tag}</span>
                          <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Statut de lecture */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Statut de lecture</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Lus</span>
                      <span className="font-medium">{stats.readBookmarks}/{stats.totalBookmarks}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${stats.totalBookmarks > 0 ? (stats.readBookmarks / stats.totalBookmarks) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal d'ajout de favori */}
      <AddBookmarkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBookmarkAdded={(newBookmark) => {
          setBookmarks(prev => [newBookmark, ...prev]);
          loadData(); // Recharger toutes les statistiques
        }}
      />

      {/* Modal d'édition de favori */}
      <EditBookmarkModal
        isOpen={editBookmarkModal.isOpen}
        onClose={() => setEditBookmarkModal({ isOpen: false, bookmark: null })}
        bookmark={editBookmarkModal.bookmark}
        onBookmarkUpdated={handleBookmarkUpdated}
      />

      {/* Modal de création de collection */}
      <CollectionModal
        isOpen={collectionModal}
        onClose={() => setCollectionModal(false)}
        onCollectionSaved={handleCollectionSaved}
      />

      {/* Modal d'import/export */}
      <ImportExportModal
        isOpen={importExportModal}
        onClose={() => setImportExportModal(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default Dashboard;