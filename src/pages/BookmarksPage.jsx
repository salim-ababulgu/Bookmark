import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { getUserBookmarks, getUserCollections, updateBookmark, deleteBookmark as deleteBookmarkService } from '../services/supabaseDataService';
import { toast } from 'sonner';
import { Bookmark, Folder, Tag, Plus, LayoutList, Grip, Image, CheckSquare, Square, FolderPlus, Upload, Download } from 'lucide-react';
import AdvancedSearch from '../components/AdvancedSearch';
import BookmarkPreview from '../components/BookmarkPreview';
import BookmarkCard from '../components/BookmarkCard';
import EditBookmarkModal from '../components/EditBookmarkModal';
import CollectionModal from '../components/CollectionModal';
import ImportExportModal from '../components/ImportExportModal';
import { BookmarkCardSkeleton, BookmarkListSkeleton } from '../components/Skeleton';

const BookmarksPage = () => {
  const { user } = useSupabaseAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    collection: '',
    tags: [],
    dateRange: '',
    status: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'gallery'
  const [selectedBookmark, setSelectedBookmark] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // États pour les modals et sélection multiple
  const [editBookmarkModal, setEditBookmarkModal] = useState({ isOpen: false, bookmark: null });
  const [collectionModal, setCollectionModal] = useState({ isOpen: false, selectedBookmarks: [] });
  const [importExportModal, setImportExportModal] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedBookmarks, setSelectedBookmarks] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const bookmarksResult = await getUserBookmarks(user.id);
        if (bookmarksResult.success) {
          setBookmarks(bookmarksResult.data);
        } else {
          throw new Error(bookmarksResult.error);
        }

        const collectionsResult = await getUserCollections(user.id);
        if (collectionsResult.success) {
          setCollections(collectionsResult.data);
        } else {
          throw new Error(collectionsResult.error);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Erreur lors du chargement des favoris et collections.');
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const handleSortOrderChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
  };

  const allTags = [...new Set(bookmarks.flatMap(b => b.tags || []))].sort();

  const filteredAndSortedBookmarks = bookmarks
    .filter(bookmark => {
      const matchesSearch = searchTerm === '' ||
                            bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            bookmark.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (bookmark.tags && bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesCollection = filters.collection === '' || bookmark.collection_id === filters.collection;

      const matchesTags = filters.tags?.length === 0 ||
                          (bookmark.tags && filters.tags.every(filterTag => bookmark.tags.includes(filterTag)));

      const matchesDateRange = () => {
        if (!filters.dateRange) return true;
        const bookmarkDate = new Date(bookmark.created_at);
        const now = new Date();
        const filterDate = new Date();

        switch (filters.dateRange) {
          case 'today':
            filterDate.setHours(0, 0, 0, 0);
            now.setHours(0, 0, 0, 0);
            return bookmarkDate.toDateString() === now.toDateString();
          case 'week':
            filterDate.setDate(now.getDate() - 7);
            return bookmarkDate >= filterDate;
          case 'month':
            filterDate.setMonth(now.getMonth() - 1);
            return bookmarkDate >= filterDate;
          case 'year':
            filterDate.setFullYear(now.getFullYear() - 1);
            return bookmarkDate >= filterDate;
          default:
            return true;
        }
      };

      return matchesSearch && matchesCollection && matchesTags && matchesDateRange();
    })
    .sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];

      if (sortBy === 'collection') {
        const collectionA = collections.find(c => c.id === a.collection_id)?.name || '';
        const collectionB = collections.find(c => c.id === b.collection_id)?.name || '';
        return sortOrder === 'asc' ? collectionA.localeCompare(collectionB) : collectionB.localeCompare(collectionA);
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      } else if (valueA instanceof Date && valueB instanceof Date) {
        return sortOrder === 'asc' ? valueA.getTime() - valueB.getTime() : valueB.getTime() - valueA.getTime();
      }
      return 0;
    });

  const handleEditBookmark = (bookmarkToEdit) => {
    setEditBookmarkModal({ isOpen: true, bookmark: bookmarkToEdit });
  };

  const handleEditBookmarkClose = () => {
    setEditBookmarkModal({ isOpen: false, bookmark: null });
  };

  const handleBookmarkUpdated = (updatedBookmark) => {
    setBookmarks(prev => prev.map(b => b.id === updatedBookmark.id ? updatedBookmark : b));
    loadData(); // Recharger pour s'assurer de la cohérence
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce favori ?')) return;

    setLoading(true);
    try {
      const result = await deleteBookmarkService(bookmarkId, user.id);
      if (result.success) {
        toast.success('Favori supprimé avec succès !');
        setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Erreur suppression favori:', err);
      toast.error('Erreur lors de la suppression du favori.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (bookmarkId, isFavorite) => {
    try {
      const result = await updateBookmark(bookmarkId, { is_favorite: isFavorite }, user.id);
      if (result.success) {
        toast.success(isFavorite ? 'Ajouté aux favoris !' : 'Retiré des favoris !');
        setBookmarks(prev => prev.map(b => b.id === bookmarkId ? { ...b, is_favorite: isFavorite } : b));
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Erreur toggle favori:', err);
      toast.error('Erreur lors de la mise à jour du favori.');
    }
  };

  // Gestion de la sélection multiple
  const handleSelectionModeToggle = () => {
    setSelectionMode(!selectionMode);
    setSelectedBookmarks(new Set());
  };

  const handleBookmarkSelection = (bookmarkId, isSelected) => {
    const newSelectedBookmarks = new Set(selectedBookmarks);
    if (isSelected) {
      newSelectedBookmarks.add(bookmarkId);
    } else {
      newSelectedBookmarks.delete(bookmarkId);
    }
    setSelectedBookmarks(newSelectedBookmarks);
  };

  const handleSelectAll = () => {
    if (selectedBookmarks.size === currentBookmarks.length) {
      setSelectedBookmarks(new Set());
    } else {
      setSelectedBookmarks(new Set(currentBookmarks.map(b => b.id)));
    }
  };

  // Gestion des collections
  const handleCreateCollection = () => {
    setCollectionModal({
      isOpen: true,
      selectedBookmarks: Array.from(selectedBookmarks)
    });
  };

  const handleCollectionSaved = (newCollection) => {
    setCollections(prev => [newCollection, ...prev]);
    loadData(); // Recharger pour synchroniser
  };

  // Gestion import/export
  const handleImportSuccess = () => {
    loadData();
    setImportExportModal(false);
  };

  const indexOfLastBookmark = currentPage * itemsPerPage;
  const indexOfFirstBookmark = indexOfLastBookmark - itemsPerPage;
  const currentBookmarks = filteredAndSortedBookmarks.slice(indexOfFirstBookmark, indexOfLastBookmark);

  const totalPages = Math.ceil(filteredAndSortedBookmarks.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 space-y-2">
          <div className="h-9 w-48 bg-muted/50 rounded-md animate-pulse"></div>
          <div className="h-4 w-96 bg-muted/50 rounded-md animate-pulse"></div>
        </div>

        {/* Search skeleton */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-10 bg-muted/50 rounded-md animate-pulse"></div>
            <div className="h-10 bg-muted/50 rounded-md animate-pulse"></div>
            <div className="h-10 bg-muted/50 rounded-md animate-pulse"></div>
            <div className="h-10 bg-muted/50 rounded-md animate-pulse"></div>
          </div>
        </div>

        {/* View mode skeleton */}
        <div className="flex justify-end mb-4">
          <div className="h-10 w-32 bg-muted/50 rounded-md animate-pulse"></div>
        </div>

        {/* Content skeleton based on view mode */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <BookmarkCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <BookmarkListSkeleton key={index} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">Mes Favoris</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setImportExportModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-input rounded-lg hover:bg-accent transition-colors focus-ring"
            title="Import/Export"
          >
            <Upload className="h-4 w-4" />
            Import/Export
          </button>
          <button
            onClick={handleSelectionModeToggle}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors focus-ring ${
              selectionMode
                ? 'bg-primary text-primary-foreground'
                : 'border border-input hover:bg-accent'
            }`}
            title={selectionMode ? 'Désactiver la sélection' : 'Activer la sélection multiple'}
          >
            {selectionMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            {selectionMode ? 'Désélectionner' : 'Sélectionner'}
          </button>
        </div>
      </div>

      {/* Barre d'actions pour la sélection multiple */}
      {selectionMode && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-primary font-medium">
                {selectedBookmarks.size} favori(s) sélectionné(s)
              </span>
              <button
                onClick={handleSelectAll}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {selectedBookmarks.size === currentBookmarks.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateCollection}
                disabled={selectedBookmarks.size === 0}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 focus-ring"
              >
                <FolderPlus className="h-4 w-4" />
                Créer collection
              </button>
            </div>
          </div>
        </div>
      )}

      <AdvancedSearch
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        collections={collections}
        availableTags={allTags}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        sortOrder={sortOrder}
        onSortOrderChange={handleSortOrderChange}
      />

      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-l-md border border-r-0 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground hover:bg-accent border-input'}`}
            title="Vue Liste"
          >
            <LayoutList className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 border border-r-0 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground hover:bg-accent border-input'}`}
            title="Vue Grille"
          >
            <Grip className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('gallery')}
            className={`px-4 py-2 rounded-r-md border transition-colors ${viewMode === 'gallery' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground hover:bg-accent border-input'}`}
            title="Vue Galerie"
          >
            <Image className="h-5 w-5" />
          </button>
        </div>
      </div>

      {filteredAndSortedBookmarks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Bookmark className="mx-auto h-12 w-12 mb-4" />
          <p className="text-xl font-semibold">Aucun favori trouvé</p>
          <p className="mt-2">Ajustez vos filtres ou ajoutez de nouveaux favoris.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {viewMode === 'list' && (
            <div className="space-y-4">
              {currentBookmarks.map(bookmark => (
                <div
                  key={bookmark.id}
                  className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedBookmark(bookmark)}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-md bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-lg font-medium">
                    {bookmark.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground truncate">{bookmark.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{bookmark.url}</p>
                    {bookmark.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {bookmark.tags.map(tag => (
                          <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground flex-shrink-0">
                    Ajouté le {new Date(bookmark.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentBookmarks.map(bookmark => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onEdit={handleEditBookmark}
                  onDelete={handleDeleteBookmark}
                  onToggleFavorite={handleToggleFavorite}
                  selectionMode={selectionMode}
                  isSelected={selectedBookmarks.has(bookmark.id)}
                  onSelectionChange={handleBookmarkSelection}
                />
              ))}
            </div>
          )}

          {viewMode === 'gallery' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-min">
              {currentBookmarks.map(bookmark => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onEdit={handleEditBookmark}
                  onDelete={handleDeleteBookmark}
                  onToggleFavorite={handleToggleFavorite}
                  selectionMode={selectionMode}
                  isSelected={selectedBookmarks.has(bookmark.id)}
                  onSelectionChange={handleBookmarkSelection}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-input rounded-md bg-background text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          {[...Array(totalPages).keys()].map(number => (
            <button
              key={number + 1}
              onClick={() => paginate(number + 1)}
              className={`px-4 py-2 border rounded-md ${currentPage === number + 1 ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground hover:bg-accent border-input'}`}
            >
              {number + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-input rounded-md bg-background text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      )}

      {selectedBookmark && (
        <BookmarkPreview
          bookmark={selectedBookmark}
          onClose={() => setSelectedBookmark(null)}
        />
      )}

      {/* Modal d'édition de favori */}
      <EditBookmarkModal
        isOpen={editBookmarkModal.isOpen}
        onClose={handleEditBookmarkClose}
        bookmark={editBookmarkModal.bookmark}
        onBookmarkUpdated={handleBookmarkUpdated}
      />

      {/* Modal de création de collection */}
      <CollectionModal
        isOpen={collectionModal.isOpen}
        onClose={() => setCollectionModal({ isOpen: false, selectedBookmarks: [] })}
        selectedBookmarks={collectionModal.selectedBookmarks}
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

export default BookmarksPage;
