import React from 'react';
import { Globe, Heart, Share2, Copy, Pencil, Trash, Check } from 'lucide-react';
import { toast } from 'sonner';
import { updateBookmark, deleteBookmark } from '../services/supabaseDataService';

const BookmarkCard = ({
  bookmark,
  onEdit,
  onDelete,
  onToggleFavorite,
  selectionMode = false,
  isSelected = false,
  onSelectionChange
}) => {
  const domain = new URL(bookmark.url).hostname.replace('www.', '');
  const favicon = bookmark.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  const imageUrl = bookmark.metadata?.image || favicon;

  const copyUrl = () => {
    navigator.clipboard.writeText(bookmark.url);
    toast.success('URL copiée !');
  };

  const shareBookmark = () => {
    if (navigator.share) {
      navigator.share({
        title: bookmark.title,
        url: bookmark.url,
        text: `Découvrez: ${bookmark.title}`
      });
    } else {
      copyUrl();
      toast.info('URL copiée pour partage');
    }
  };

  const handleCardClick = (e) => {
    if (selectionMode && onSelectionChange) {
      e.preventDefault();
      onSelectionChange(bookmark.id, !isSelected);
    }
  };

  return (
    <div
      className={`bg-card border rounded-lg shadow-sm overflow-hidden flex flex-col h-full transition-all duration-200 cursor-pointer ${
        selectionMode
          ? isSelected
            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
            : 'border-border hover:border-primary/50'
          : 'border-border hover:shadow-md'
      }`}
      onClick={handleCardClick}
    >
      <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={bookmark.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = favicon; e.target.className = "w-10 h-10 object-contain"; }}
          />
        ) : (
          <Globe className="h-12 w-12 text-muted-foreground" />
        )}
        <div className="absolute top-2 left-2 p-1 bg-background/80 rounded-md backdrop-blur-sm">
          <img src={favicon} alt="Favicon" className="w-5 h-5 rounded-sm" />
        </div>
        {selectionMode && (
          <div className="absolute top-2 right-2">
            <div
              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                isSelected
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-background/80 border-muted-foreground/50 backdrop-blur-sm'
              }`}
            >
              {isSelected && <Check className="w-3 h-3" />}
            </div>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">{bookmark.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{bookmark.description || bookmark.url}</p>
        <div className="flex flex-wrap gap-2 mb-3 mt-auto">
          {bookmark.tags?.map(tag => (
            <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">{domain}</p>
          {!selectionMode && (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(bookmark.id, !bookmark.is_favorite);
                }}
                className={`p-1 rounded-full transition-colors focus-ring ${
                  bookmark.is_favorite
                    ? 'text-destructive hover-effect' : 'text-muted-foreground hover:text-destructive hover-effect'
                }`}
                title={bookmark.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart className={`h-4 w-4 ${bookmark.is_favorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  shareBookmark();
                }}
                className="p-1 rounded-full text-muted-foreground hover:text-info hover-effect transition-colors focus-ring"
                title="Partager"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(bookmark);
                }}
                className="p-1 rounded-full text-muted-foreground hover:text-warning hover-effect transition-colors focus-ring"
                title="Modifier"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(bookmark.id);
                }}
                className="p-1 rounded-full text-muted-foreground hover:text-destructive hover-effect transition-colors focus-ring"
                title="Supprimer"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarkCard;
