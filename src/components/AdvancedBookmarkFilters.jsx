import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, X, Calendar, Tag, Globe, Star,
  Clock, Eye, Archive, SlidersHorizontal, ChevronDown,
  ChevronUp, RefreshCw, Bookmark, Heart, TrendingUp
} from 'lucide-react';

const AdvancedBookmarkFilters = ({
  bookmarks = [],
  onFiltersChange,
  initialFilters = {},
  className = ""
}) => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all', // all, favorites, archived, unread, read
    tags: [],
    domains: [],
    dateRange: 'all', // all, today, week, month, year, custom
    sortBy: 'created_at',
    sortOrder: 'desc',
    customDateStart: '',
    customDateEnd: '',
    ...initialFilters
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableDomains, setAvailableDomains] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Extract available tags and domains from bookmarks
  useEffect(() => {
    const tags = new Set();
    const domains = new Set();

    bookmarks.forEach(bookmark => {
      // Extract tags
      if (bookmark.tags) {
        bookmark.tags.forEach(tag => tags.add(tag));
      }

      // Extract domains
      try {
        const domain = new URL(bookmark.url).hostname.replace('www.', '');
        domains.add(domain);
      } catch {
        // Invalid URL, skip
      }
    });

    setAvailableTags(Array.from(tags).sort());
    setAvailableDomains(Array.from(domains).sort());
  }, [bookmarks]);

  // Generate search suggestions
  useEffect(() => {
    if (filters.search.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    const suggestions = new Set();
    const searchLower = filters.search.toLowerCase();

    bookmarks.forEach(bookmark => {
      // Title suggestions
      if (bookmark.title?.toLowerCase().includes(searchLower)) {
        suggestions.add({
          type: 'title',
          text: bookmark.title,
          icon: Bookmark
        });
      }

      // Tag suggestions
      bookmark.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(searchLower)) {
          suggestions.add({
            type: 'tag',
            text: tag,
            icon: Tag
          });
        }
      });

      // Domain suggestions
      try {
        const domain = new URL(bookmark.url).hostname.replace('www.', '');
        if (domain.toLowerCase().includes(searchLower)) {
          suggestions.add({
            type: 'domain',
            text: domain,
            icon: Globe
          });
        }
      } catch {
        // Invalid URL, skip
      }
    });

    setSearchSuggestions(Array.from(suggestions).slice(0, 8));
  }, [filters.search, bookmarks]);

  // Update parent component when filters change
  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addTag = (tag) => {
    if (!filters.tags.includes(tag)) {
      updateFilter('tags', [...filters.tags, tag]);
    }
  };

  const removeTag = (tag) => {
    updateFilter('tags', filters.tags.filter(t => t !== tag));
  };

  const addDomain = (domain) => {
    if (!filters.domains.includes(domain)) {
      updateFilter('domains', [...filters.domains, domain]);
    }
  };

  const removeDomain = (domain) => {
    updateFilter('domains', filters.domains.filter(d => d !== domain));
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      tags: [],
      domains: [],
      dateRange: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc',
      customDateStart: '',
      customDateEnd: ''
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== 'all') count++;
    if (filters.tags.length > 0) count++;
    if (filters.domains.length > 0) count++;
    if (filters.dateRange !== 'all') count++;
    return count;
  };

  const statusOptions = [
    { value: 'all', label: 'Tous les favoris', icon: Eye },
    { value: 'favorites', label: 'Mes favoris', icon: Heart },
    { value: 'unread', label: 'Non lus', icon: Eye },
    { value: 'read', label: 'Lus', icon: Eye },
    { value: 'archived', label: 'Archivés', icon: Archive }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'Toutes les dates' },
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'year', label: 'Cette année' },
    { value: 'custom', label: 'Période personnalisée' }
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date d\'ajout' },
    { value: 'title', label: 'Titre' },
    { value: 'domain', label: 'Domaine' },
    { value: 'updated_at', label: 'Dernière modification' }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher dans vos favoris..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full pl-10 pr-12 py-3 border border-border rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-primary/50"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        <AnimatePresence>
          {showSuggestions && searchSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden"
            >
              {searchSuggestions.map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                  <button
                    key={`${suggestion.type}-${suggestion.text}`}
                    onClick={() => {
                      updateFilter('search', suggestion.text);
                      setShowSuggestions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-accent transition-colors"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-sm">{suggestion.text}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {suggestion.type}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Filters & Advanced Toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Sort */}
        <div className="flex items-center gap-1">
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="px-3 py-2 border border-border rounded-l-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2 py-2 border border-l-0 border-border rounded-r-lg bg-background hover:bg-accent transition-colors"
            title={`Tri ${filters.sortOrder === 'asc' ? 'croissant' : 'décroissant'}`}
          >
            {filters.sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center gap-2 px-3 py-2 border border-border rounded-lg transition-colors ${
            showAdvancedFilters || getActiveFiltersCount() > 0
              ? 'bg-primary text-primary-foreground'
              : 'bg-background hover:bg-accent'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm">Filtres</span>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {getActiveFiltersCount()}
            </span>
          )}
          {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Clear Filters */}
        {getActiveFiltersCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Effacer
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-border rounded-lg p-4 bg-muted/20 space-y-4"
          >
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Période
              </label>
              <div className="flex gap-2">
                <select
                  value={filters.dateRange}
                  onChange={(e) => updateFilter('dateRange', e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  {dateRangeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {filters.dateRange === 'custom' && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="date"
                    value={filters.customDateStart}
                    onChange={(e) => updateFilter('customDateStart', e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <input
                    type="date"
                    value={filters.customDateEnd}
                    onChange={(e) => updateFilter('customDateEnd', e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              )}
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags ({availableTags.length} disponibles)
                </label>
                <div className="space-y-2">
                  {/* Selected Tags */}
                  {filters.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {filters.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Available Tags */}
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                    {availableTags
                      .filter(tag => !filters.tags.includes(tag))
                      .slice(0, 20)
                      .map(tag => (
                        <button
                          key={tag}
                          onClick={() => addTag(tag)}
                          className="px-2 py-1 text-xs border border-border rounded-full hover:bg-accent transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Domains Filter */}
            {availableDomains.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Domaines ({availableDomains.length} disponibles)
                </label>
                <div className="space-y-2">
                  {/* Selected Domains */}
                  {filters.domains.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {filters.domains.map(domain => (
                        <span
                          key={domain}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-full text-xs"
                        >
                          {domain}
                          <button
                            onClick={() => removeDomain(domain)}
                            className="hover:bg-white/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Available Domains */}
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                    {availableDomains
                      .filter(domain => !filters.domains.includes(domain))
                      .slice(0, 20)
                      .map(domain => (
                        <button
                          key={domain}
                          onClick={() => addDomain(domain)}
                          className="px-2 py-1 text-xs border border-border rounded-full hover:bg-accent transition-colors"
                        >
                          {domain}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Summary */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>{getActiveFiltersCount()} filtre{getActiveFiltersCount() > 1 ? 's' : ''} actif{getActiveFiltersCount() > 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
};

export default AdvancedBookmarkFilters;