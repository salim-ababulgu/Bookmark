import React, { useState } from 'react';
import { Search, Filter, Calendar, Tag, Folder, SortAsc, SortDesc, X } from 'lucide-react';

const AdvancedSearch = ({
  searchTerm,
  onSearchChange,
  collections,
  availableTags,
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTagFilter = (tag) => {
    const currentTags = filters.tags || [];
    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];

    onFiltersChange({
      ...filters,
      tags: updatedTags
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      collection: '',
      tags: [],
      dateRange: '',
      status: ''
    });
    onSearchChange('');
  };

  const hasActiveFilters = searchTerm || filters.collection ||
                          (filters.tags && filters.tags.length > 0) ||
                          filters.dateRange || filters.status;

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      {/* Barre de recherche principale */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher dans vos favoris..."
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`px-4 py-2 border border-input rounded-md transition-colors flex items-center gap-2 ${
            isExpanded || hasActiveFilters
              ? 'bg-primary text-primary-foreground'
              : 'bg-background hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <Filter className="h-4 w-4" />
          Filtres
          {hasActiveFilters && (
            <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
              {[
                searchTerm && 1,
                filters.collection && 1,
                filters.tags?.length || 0,
                filters.dateRange && 1,
                filters.status && 1
              ].filter(Boolean).reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Filtres avancés */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filtre par collection */}
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <Folder className="h-4 w-4" />
                Collection
              </label>
              <select
                value={filters.collection || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  collection: e.target.value
                })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring"
              >
                <option value="">Toutes les collections</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre par date */}
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                Période d'ajout
              </label>
              <select
                value={filters.dateRange || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  dateRange: e.target.value
                })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring"
              >
                <option value="">Toute période</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
            </div>

            {/* Tri */}
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                Trier par
              </label>
              <div className="flex gap-1">
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-input rounded-l-md bg-background text-foreground focus:ring-2 focus:ring-ring"
                >
                  <option value="createdAt">Date d'ajout</option>
                  <option value="title">Titre</option>
                  <option value="url">URL</option>
                  <option value="collection">Collection</option>
                </select>
                <button
                  onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-l-0 border-input rounded-r-md bg-background hover:bg-accent transition-colors"
                  title={sortOrder === 'asc' ? 'Ordre croissant' : 'Ordre décroissant'}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Filtre par tags */}
          {availableTags && availableTags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4" />
                Tags populaires
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.slice(0, 15).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagFilter(tag)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      filters.tags?.includes(tag)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-input hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <div className="text-sm text-muted-foreground">
              {hasActiveFilters ? 'Filtres actifs' : 'Aucun filtre actif'}
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <X className="h-3 w-3" />
                Effacer tout
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;