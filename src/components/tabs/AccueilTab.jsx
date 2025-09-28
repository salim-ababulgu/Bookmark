import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Tag, ExternalLink, Clock } from 'lucide-react';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../services/supabase';
import EmptyState from '../EmptyState';
import { BookmarkListSkeleton } from '../Skeleton';

const AccueilTab = ({ searchInputRef }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useSupabaseAuth();

  const sortOptions = [
    { value: 'date', label: 'Date d\'ajout' },
    { value: 'title', label: 'Titre' },
    { value: 'domain', label: 'Domaine' }
  ];

  const filterOptions = [
    { value: 'all', label: 'Tous' },
    { value: 'favorites', label: 'Favoris' },
    { value: 'recent', label: 'Cette semaine' }
  ];

  // Fetch bookmarks
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setBookmarks(data || []);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [user]);

  // Filter and sort bookmarks
  useEffect(() => {
    let filtered = [...bookmarks];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(bookmark =>
        bookmark.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
          const domainA = new URL(a.url).hostname;
          const domainB = new URL(b.url).hostname;
          return domainA.localeCompare(domainB);
        case 'date':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    setFilteredBookmarks(filtered);
  }, [bookmarks, searchTerm, sortBy, filterBy]);

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
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
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Mes Favoris récents</h2>
        <p className="text-muted-foreground">
          {filteredBookmarks.length} favori{filteredBookmarks.length !== 1 ? 's' : ''} trouvé{filteredBookmarks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Rechercher dans vos favoris... (Ctrl+S)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-primary/50"
          />
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookmarks List */}
      <div className="space-y-3">
        {filteredBookmarks.length === 0 ? (
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
                // Ouvrir le modal d'ajout
                document.querySelector('[data-add-bookmark]')?.click();
              }
            }}
            actionLabel={searchTerm || filterBy !== 'all' ? 'Effacer les filtres' : undefined}
          />
        ) : (
          filteredBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="group flex items-start gap-4 p-4 bg-background border border-border rounded-lg hover:bg-accent/50 transition-colors"
            >
              {/* No Favicon - Just colored indicator */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <ExternalLink className="w-5 h-5 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {bookmark.title || 'Sans titre'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {bookmark.description || getDomain(bookmark.url)}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(bookmark.created_at)}
                      </span>
                      {bookmark.tags && bookmark.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {bookmark.tags.slice(0, 2).join(', ')}
                          {bookmark.tags.length > 2 && ` +${bookmark.tags.length - 2}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-muted-foreground hover:text-primary transition-colors"
                      title="Ouvrir le lien"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredBookmarks.length > 0 && (
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            {filteredBookmarks.length} sur {bookmarks.length} favoris affichés
          </p>
        </div>
      )}
    </div>
  );
};

export default AccueilTab;