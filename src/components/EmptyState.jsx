import React from 'react';
import { BookmarkPlus, Search, Star, FolderOpen, Sparkles, ArrowRight } from 'lucide-react';

const EmptyState = ({
  type = 'bookmarks',
  title,
  description,
  action,
  actionLabel,
  illustration
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'bookmarks':
        return {
          title: 'Aucun favori trouvé',
          description: 'Commencez à sauvegarder vos liens préférés pour les retrouver facilement',
          illustration: <BookmarkPlus className="w-16 h-16 text-primary/60" />,
          actionLabel: 'Ajouter votre premier favori'
        };
      case 'search':
        return {
          title: 'Aucun résultat trouvé',
          description: 'Essayez de modifier vos critères de recherche ou vos filtres',
          illustration: <Search className="w-16 h-16 text-orange-500/60" />,
          actionLabel: 'Effacer les filtres'
        };
      case 'favorites':
        return {
          title: 'Aucun favori marqué',
          description: 'Marquez vos liens les plus importants comme favoris pour les retrouver rapidement',
          illustration: <Star className="w-16 h-16 text-yellow-500/60" />,
          actionLabel: 'Parcourir tous les favoris'
        };
      case 'collections':
        return {
          title: 'Aucune collection créée',
          description: 'Organisez vos favoris en collections thématiques pour une meilleure organisation',
          illustration: <FolderOpen className="w-16 h-16 text-purple-500/60" />,
          actionLabel: 'Créer votre première collection'
        };
      default:
        return {
          title: 'Aucun élément',
          description: 'Il n\'y a rien à afficher pour le moment',
          illustration: <Sparkles className="w-16 h-16 text-gray-400" />,
          actionLabel: 'Action'
        };
    }
  };

  const defaultContent = getDefaultContent();
  const finalTitle = title || defaultContent.title;
  const finalDescription = description || defaultContent.description;
  const finalIllustration = illustration || defaultContent.illustration;
  const finalActionLabel = actionLabel || defaultContent.actionLabel;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Animated container */}
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-full blur-3xl scale-150" />

        {/* Main illustration */}
        <div className="relative bg-muted/30 rounded-full p-8 mb-6 group hover:scale-105 transition-all duration-300 cursor-default">
          {finalIllustration}

          {/* Floating particles */}
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="absolute -bottom-1 -left-3 w-2 h-2 bg-purple-500/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 -right-4 w-1.5 h-1.5 bg-orange-500/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          {finalTitle}
        </h3>

        <p className="text-muted-foreground leading-relaxed">
          {finalDescription}
        </p>

        {/* Action button */}
        {action && (
          <button
            onClick={action}
            className="inline-flex items-center gap-2 px-6 py-3 mt-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 group"
          >
            <span>{finalActionLabel}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        )}
      </div>

      {/* Additional suggestions */}
      {type === 'bookmarks' && (
        <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border/50 max-w-lg">
          <p className="text-sm text-muted-foreground mb-3 font-medium">💡 Conseils pour bien commencer :</p>
          <ul className="text-xs text-muted-foreground space-y-2 text-left">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
              Utilisez <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs">Ctrl+N</kbd> pour ajouter rapidement un favori
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
              Organisez vos favoris avec des tags pour les retrouver facilement
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
              Marquez vos liens les plus importants comme favoris avec ⭐
            </li>
          </ul>
        </div>
      )}

      {type === 'search' && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <span className="text-xs text-muted-foreground">Essayez de rechercher :</span>
          {['documentation', 'tutorial', 'github', 'design'].map((term) => (
            <button
              key={term}
              onClick={() => {/* Implémenter la recherche rapide */}}
              className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded border border-border hover:border-primary/50 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmptyState;