import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import {
  Bookmark,
  Plus,
  Search,
  Grid3X3,
  List,
  Moon,
  Sun,
  LogOut,
  Trash2,
  ExternalLink,
  Image,
  Download,
  Upload,
  Tag,
  BarChart3,
  Shield,
  Eye
} from 'lucide-react';
import AddBookmarkForm from '../components/AddBookmarkForm';
import CollectionManager from '../components/CollectionManager';
import AdvancedSearch from '../components/AdvancedSearch';
import Analytics from '../components/Analytics';
import LinkChecker from '../components/LinkChecker';
import BookmarkPreview from '../components/BookmarkPreview';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { FloatingParticles, NewFeatureBadge, AnimatedCounter, FadeInList } from '../components/AnimatedComponents';
import HelpButton from '../components/HelpButton';
import NotificationCenter from '../components/NotificationCenter';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', or 'gallery'
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('all');

  // États pour la recherche avancée
  const [searchFilters, setSearchFilters] = useState({
    collection: '',
    tags: [],
    dateRange: '',
    status: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeTab, setActiveTab] = useState('bookmarks');
  const [previewBookmark, setPreviewBookmark] = useState(null);

  // Cycle through view modes
  const viewModes = ['list', 'grid', 'gallery'];
  const cycleViewMode = () => {
    const currentIndex = viewModes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % viewModes.length;
    setViewMode(viewModes[nextIndex]);
  };

  // Référence pour le champ de recherche
  const searchInputRef = React.useRef(null);

  useEffect(() => {
    // Load dark mode preference
    const saved = localStorage.getItem('darkMode');
    const isDark = saved ? JSON.parse(saved) : false;
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Subscribe to bookmarks
    const bookmarksQuery = query(
      collection(db, 'bookmarks'),
      where('userId', '==', user.uid)
    );

    const unsubscribeBookmarks = onSnapshot(bookmarksQuery, (snapshot) => {
      const bookmarksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookmarks(bookmarksData);
    });

    // Subscribe to collections
    const collectionsQuery = query(
      collection(db, 'collections'),
      where('userId', '==', user.uid)
    );

    const unsubscribeCollections = onSnapshot(collectionsQuery, (snapshot) => {
      const collectionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCollections(collectionsData);
    });

    return () => {
      unsubscribeBookmarks();
      unsubscribeCollections();
    };
  }, [user]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    document.documentElement.classList.toggle('dark', newMode);
  };

  const handleLogout = async () => {
    console.log('🏠 Dashboard: Début déconnexion');

    try {
      const result = await logout();
      if (result.success) {
        console.log('🏠 Dashboard: Déconnexion réussie');
        toast.success('Déconnexion réussie');
      } else {
        console.error('🏠 Dashboard: Erreur déconnexion:', result.error);
        toast.error(result.error);
      }
    } catch (error) {
      console.error('🏠 Dashboard: Erreur déconnexion inattendue:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const deleteBookmark = async (bookmarkId) => {
    try {
      await deleteDoc(doc(db, 'bookmarks', bookmarkId));
      toast.success('Favori supprimé');
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Tags disponibles pour les filtres
  const availableTags = [...new Set(bookmarks.flatMap(b => b.tags || []))].sort();

  // Fonction de filtrage avancée
  const getFilteredBookmarks = () => {
    let filtered = [...bookmarks];

    // Recherche par texte
    if (searchTerm) {
      filtered = filtered.filter(bookmark =>
        bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bookmark.tags && bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Filtre par collection (nouveau filtre ou ancien selectedCollection)
    const collectionFilter = searchFilters.collection || (selectedCollection !== 'all' ? selectedCollection : '');
    if (collectionFilter) {
      filtered = filtered.filter(bookmark => bookmark.collectionId === collectionFilter);
    }

    // Filtre par tags
    if (searchFilters.tags && searchFilters.tags.length > 0) {
      filtered = filtered.filter(bookmark =>
        bookmark.tags && searchFilters.tags.some(tag => bookmark.tags.includes(tag))
      );
    }

    // Filtre par date
    if (searchFilters.dateRange) {
      const now = new Date();
      const filterDate = new Date();

      switch (searchFilters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }

      if (searchFilters.dateRange !== '') {
        filtered = filtered.filter(bookmark => {
          const bookmarkDate = bookmark.createdAt?.toDate ? bookmark.createdAt.toDate() : new Date(bookmark.createdAt);
          return bookmarkDate >= filterDate;
        });
      }
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'url':
          aValue = a.url.toLowerCase();
          bValue = b.url.toLowerCase();
          break;
        case 'collection':
          const aCollection = collections.find(c => c.id === a.collectionId)?.name || '';
          const bCollection = collections.find(c => c.id === b.collectionId)?.name || '';
          aValue = aCollection.toLowerCase();
          bValue = bCollection.toLowerCase();
          break;
        default: // createdAt
          aValue = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          bValue = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          break;
      }

      if (sortBy === 'createdAt') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }
    });

    return filtered;
  };

  const filteredBookmarks = getFilteredBookmarks();

  // Fonctions d'import/export
  const exportBookmarks = () => {
    const dataToExport = {
      bookmarks: filteredBookmarks.map(bookmark => ({
        title: bookmark.title,
        url: bookmark.url,
        tags: bookmark.tags || [],
        collection: collections.find(c => c.id === bookmark.collectionId)?.name || null,
        createdAt: bookmark.createdAt
      })),
      exportedAt: new Date().toISOString(),
      exportedBy: user.email
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Favoris exportés !');
  };

  const importBookmarks = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        const bookmarksToImport = importData.bookmarks || importData; // Support différents formats

        let importCount = 0;
        for (const bookmark of bookmarksToImport) {
          if (bookmark.url && bookmark.title) {
            await addDoc(collection(db, 'bookmarks'), {
              url: bookmark.url,
              title: bookmark.title,
              tags: bookmark.tags || [],
              collectionId: null, // Peut être amélioré pour mapper les collections
              userId: user.uid,
              createdAt: new Date()
            });
            importCount++;
          }
        }

        toast.success(`${importCount} favoris importés !`);
        event.target.value = ''; // Reset input
      } catch (error) {
        console.error('Erreur import:', error);
        toast.error('Erreur lors de l\'import du fichier JSON');
      }
    };
    reader.readAsText(file);
  };

  // Configuration des raccourcis clavier
  const { showShortcutsHelp } = useKeyboardShortcuts({
    switchTab: (tab) => setActiveTab(tab),
    addBookmark: () => setShowAddForm(true),
    focusSearch: () => searchInputRef.current?.focus(),
    exportBookmarks: exportBookmarks,
    triggerImport: () => document.getElementById('import-input')?.click(),
    toggleDarkMode: toggleDarkMode,
    cycleViewMode: cycleViewMode,
    toggleFilters: () => {
      // Cette fonction sera liée au composant AdvancedSearch
      toast.info('🔧 Filtres - utilisez le bouton Filtres');
    },
    clearFilters: () => {
      setSearchTerm('');
      setSearchFilters({
        collection: '',
        tags: [],
        dateRange: '',
        status: ''
      });
      setSelectedCollection('all');
      toast.success('🧹 Filtres effacés');
    },
    refreshData: () => {
      // Force refresh - en production, vous pourriez recharger depuis Firebase
      window.location.reload();
    },
    showHelp: showShortcutsHelp,
    closeModals: () => {
      setShowAddForm(false);
      setPreviewBookmark(null);
    }
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Particules flottantes pour l'ambiance */}
      <FloatingParticles count={15} />

      {/* Header */}
      <header className="border-b border-border bg-card/90 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Bookmark className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-foreground">BookmarkApp</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Navigation Tabs */}
              <div className="hidden sm:flex items-center space-x-1 bg-accent rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'bookmarks'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Favoris
                </button>
                <NewFeatureBadge show={true}>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-300 flex items-center gap-1 hover:scale-105 ${
                      activeTab === 'analytics'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <BarChart3 className="h-3 w-3" />
                    Analytics
                  </button>
                </NewFeatureBadge>
                <NewFeatureBadge show={true}>
                  <button
                    onClick={() => setActiveTab('links')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-300 flex items-center gap-1 hover:scale-105 ${
                      activeTab === 'links'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Shield className="h-3 w-3" />
                    Liens
                  </button>
                </NewFeatureBadge>
              </div>

              <button
                onClick={() => setShowAddForm(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter</span>
              </button>

              {/* Import/Export */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportBookmarks}
                  className="p-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  title="Exporter les favoris"
                >
                  <Download className="h-4 w-4" />
                </button>

                <label className="p-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer" title="Importer des favoris">
                  <Upload className="h-4 w-4" />
                  <input
                    id="import-input"
                    type="file"
                    accept=".json"
                    onChange={importBookmarks}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Notification Center */}
              <NotificationCenter bookmarks={bookmarks} collections={collections} />

              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64">
            <CollectionManager
              collections={collections}
              selectedCollection={selectedCollection}
              onSelectCollection={setSelectedCollection}
              userId={user.uid}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'bookmarks' ? (
              <>
                {/* Advanced Search */}
                <AdvancedSearch
                  ref={searchInputRef}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  collections={collections}
                  availableTags={availableTags}
                  filters={searchFilters}
                  onFiltersChange={setSearchFilters}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  sortOrder={sortOrder}
                  onSortOrderChange={setSortOrder}
                />

            {/* View Controls avec compteurs animés */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-muted-foreground flex items-center gap-4">
                <span className="bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                  <AnimatedCounter to={filteredBookmarks.length} /> favori{filteredBookmarks.length !== 1 ? 's' : ''}
                  {bookmarks.length !== filteredBookmarks.length && (
                    <span className="text-xs opacity-70"> sur <AnimatedCounter to={bookmarks.length} /></span>
                  )}
                </span>
                {availableTags.length > 0 && (
                  <span className="text-xs bg-accent/50 px-2 py-1 rounded-full">
                    <AnimatedCounter to={availableTags.length} /> tags
                  </span>
                )}
                {collections.length > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    <AnimatedCounter to={collections.length} /> collections
                  </span>
                )}
              </div>

              <div className="flex rounded-md border border-input bg-background">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-l-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                  title="Vue liste"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                  title="Vue grille"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('gallery')}
                  className={`p-2 rounded-r-md transition-colors ${
                    viewMode === 'gallery'
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                  title="Vue galerie (Pinterest)"
                >
                  <Image className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Bookmarks Display */}
            {filteredBookmarks.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm || selectedCollection !== 'all'
                    ? 'Aucun favori trouvé'
                    : 'Aucun favori encore'
                  }
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedCollection !== 'all'
                    ? 'Essayez de modifier vos filtres de recherche'
                    : 'Commencez par ajouter votre premier favori'
                  }
                </p>
              </div>
            ) : (
              <FadeInList stagger={30}>
                <div className={
                  viewMode === 'gallery'
                    ? 'columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4'
                    : viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-3'
                }>
                  {filteredBookmarks.map((bookmark, index) => (
                  <div
                    key={bookmark.id}
                    className={`group bg-card border border-border rounded-lg p-4 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-out break-inside-avoid cursor-pointer relative overflow-hidden ${
                      viewMode === 'gallery' ? 'mb-4' : ''
                    }`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      ...(viewMode === 'gallery' ? {
                        minHeight: Math.floor(Math.random() * 150) + 200 + 'px'
                      } : {})
                    }}
                    onClick={() => setPreviewBookmark(bookmark)}
                  >
                    {/* Effet de hover subtil */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="flex items-start justify-between relative">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          {/* Favicon simulé */}
                          <div className="w-6 h-6 rounded bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200">
                            <span className="text-xs font-semibold text-primary">
                              {bookmark.title.charAt(0).toUpperCase()}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors duration-200">
                              {bookmark.title}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {bookmark.url}
                            </p>

                            {/* Tags avec animations */}
                            {bookmark.tags && bookmark.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {bookmark.tags.slice(0, 3).map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20 hover:bg-primary/20 transition-all duration-200 hover:scale-105"
                                    style={{ animationDelay: `${(index * 50) + (tagIndex * 100)}ms` }}
                                  >
                                    <Tag className="h-2 w-2" />
                                    {tag}
                                  </span>
                                ))}
                                {bookmark.tags.length > 3 && (
                                  <span className="text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded-full">
                                    +{bookmark.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            {bookmark.collectionId && (
                              <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-accent text-accent-foreground border border-accent/20 hover:bg-accent/80 transition-colors duration-200">
                                {collections.find(c => c.id === bookmark.collectionId)?.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions améliorées */}
                      <div className="flex items-center space-x-1 ml-4 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewBookmark(bookmark);
                          }}
                          className="p-2 rounded-md hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-110"
                          title="Aperçu"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-md hover:bg-blue-500 hover:text-white transition-all duration-200 hover:scale-110"
                          title="Ouvrir"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBookmark(bookmark.id);
                          }}
                          className="p-2 rounded-md hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-110"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Contenu supplémentaire pour la vue galerie */}
                    {viewMode === 'gallery' && (
                      <div className="mt-3 text-sm text-muted-foreground">
                        <div className="w-full h-20 bg-gradient-to-br from-primary/5 to-primary/10 rounded border border-primary/10 flex items-center justify-center">
                          <Bookmark className="h-6 w-6 text-primary/30" />
                        </div>
                        <p className="mt-2 line-clamp-3">
                          {bookmark.description ||
                           `Favori ajouté le ${new Date(bookmark.createdAt?.toDate?.() || bookmark.createdAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    )}
                  </div>
                  ))}
                </div>
              </FadeInList>
                )}
              </>
            ) : activeTab === 'analytics' ? (
              /* Analytics Tab */
              <Analytics bookmarks={bookmarks} collections={collections} />
            ) : (
              /* Link Checker Tab */
              <LinkChecker
                bookmarks={bookmarks}
                onBookmarkUpdate={() => {
                  // Optionnel: recharger les bookmarks après mise à jour
                }}
              />
            )}
          </main>
        </div>
      </div>

      {/* Add Bookmark Modal */}
      {showAddForm && (
        <AddBookmarkForm
          collections={collections}
          userId={user.uid}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {/* Bookmark Preview Modal */}
      {previewBookmark && (
        <BookmarkPreview
          bookmark={previewBookmark}
          collection={collections.find(c => c.id === previewBookmark.collectionId)}
          onClose={() => setPreviewBookmark(null)}
          onUpdate={(bookmark) => {
            // Optionnel: ouvrir le formulaire d'édition
            console.log('Update bookmark:', bookmark);
          }}
          onDelete={(bookmarkId) => {
            deleteBookmark(bookmarkId);
            setPreviewBookmark(null);
          }}
        />
      )}

      {/* Help Button */}
      <HelpButton onShowShortcuts={showShortcutsHelp} />
    </div>
  );
};

export default Dashboard;