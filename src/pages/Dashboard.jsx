import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
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
  ExternalLink
} from 'lucide-react';
import AddBookmarkForm from '../components/AddBookmarkForm';
import CollectionManager from '../components/CollectionManager';

const Dashboard = ({ user }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('all');

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
    try {
      await signOut(auth);
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
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

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCollection = selectedCollection === 'all' || bookmark.collectionId === selectedCollection;
    return matchesSearch && matchesCollection;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Bookmark className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-foreground">BookmarkApp</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter</span>
              </button>

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <button
                onClick={handleLogout}
                className="p-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
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
            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher dans vos favoris..."
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>

              <div className="flex rounded-md border border-input bg-background">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-l-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-r-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
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
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-3'
              }>
                {filteredBookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          {bookmark.title}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {bookmark.url}
                        </p>
                        {bookmark.collectionId && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-accent text-accent-foreground">
                            {collections.find(c => c.id === bookmark.collectionId)?.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => deleteBookmark(bookmark.id)}
                          className="p-1 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
    </div>
  );
};

export default Dashboard;