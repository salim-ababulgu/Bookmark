import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreHorizontal, Edit3, Trash2, Copy, Share, Archive,
  ExternalLink, Tag, Star, Download, Eye, EyeOff,
  Bookmark, Heart, Clock, AlertTriangle
} from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { updateBookmark, deleteBookmark } from '../services/supabaseDataService';
import { showAdvancedToast } from './feedback/AdvancedFeedbackSystem';

const BookmarkQuickActions = ({
  bookmark,
  onEdit,
  onUpdate,
  onDelete,
  className = "",
  trigger = "click" // "click" or "hover"
}) => {
  const { user } = useSupabaseAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFavorite = async () => {
    setIsLoading(true);
    try {
      const updatedData = { ...bookmark, is_favorite: !bookmark.is_favorite };
      const result = await updateBookmark(bookmark.id, updatedData);

      if (result.success) {
        onUpdate?.(result.data);
        showAdvancedToast('success',
          bookmark.is_favorite ? 'Retiré des favoris' : 'Ajouté aux favoris'
        );
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showAdvancedToast('error', 'Erreur', {
        description: 'Impossible de modifier le favori'
      });
    } finally {
      setIsLoading(false);
      setIsMenuOpen(false);
    }
  };

  const handleToggleArchive = async () => {
    setIsLoading(true);
    try {
      const updatedData = { ...bookmark, is_archived: !bookmark.is_archived };
      const result = await updateBookmark(bookmark.id, updatedData);

      if (result.success) {
        onUpdate?.(result.data);
        showAdvancedToast('success',
          bookmark.is_archived ? 'Désarchivé' : 'Archivé'
        );
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showAdvancedToast('error', 'Erreur', {
        description: 'Impossible de modifier le statut'
      });
    } finally {
      setIsLoading(false);
      setIsMenuOpen(false);
    }
  };

  const handleToggleRead = async () => {
    setIsLoading(true);
    try {
      const updatedData = { ...bookmark, is_read: !bookmark.is_read };
      const result = await updateBookmark(bookmark.id, updatedData);

      if (result.success) {
        onUpdate?.(result.data);
        showAdvancedToast('success',
          bookmark.is_read ? 'Marqué comme non lu' : 'Marqué comme lu'
        );
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showAdvancedToast('error', 'Erreur', {
        description: 'Impossible de modifier le statut de lecture'
      });
    } finally {
      setIsLoading(false);
      setIsMenuOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce favori ?')) {
      setIsMenuOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteBookmark(bookmark.id);
      if (result.success) {
        onDelete?.(bookmark.id);
        showAdvancedToast('success', 'Favori supprimé');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showAdvancedToast('error', 'Erreur', {
        description: 'Impossible de supprimer le favori'
      });
    } finally {
      setIsLoading(false);
      setIsMenuOpen(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url);
      showAdvancedToast('success', 'URL copiée dans le presse-papiers');
    } catch (error) {
      showAdvancedToast('error', 'Erreur', {
        description: 'Impossible de copier l\'URL'
      });
    }
    setIsMenuOpen(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: bookmark.title,
          text: bookmark.description,
          url: bookmark.url
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      await handleCopyUrl();
    }
    setIsMenuOpen(false);
  };

  const handleEdit = () => {
    onEdit?.(bookmark);
    setIsMenuOpen(false);
  };

  const handleOpenLink = () => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
    setIsMenuOpen(false);
  };

  const actions = [
    {
      id: 'open',
      label: 'Ouvrir le lien',
      icon: ExternalLink,
      onClick: handleOpenLink,
      color: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20'
    },
    {
      id: 'edit',
      label: 'Modifier',
      icon: Edit3,
      onClick: handleEdit,
      color: 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-950/20'
    },
    {
      id: 'favorite',
      label: bookmark.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris',
      icon: Heart,
      onClick: handleToggleFavorite,
      color: bookmark.is_favorite
        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
        : 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-950/20',
      filled: bookmark.is_favorite
    },
    {
      id: 'read',
      label: bookmark.is_read ? 'Marquer comme non lu' : 'Marquer comme lu',
      icon: bookmark.is_read ? EyeOff : Eye,
      onClick: handleToggleRead,
      color: bookmark.is_read
        ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20'
        : 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-950/20'
    },
    {
      id: 'archive',
      label: bookmark.is_archived ? 'Désarchiver' : 'Archiver',
      icon: Archive,
      onClick: handleToggleArchive,
      color: bookmark.is_archived
        ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20'
        : 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-950/20'
    },
    {
      id: 'copy',
      label: 'Copier l\'URL',
      icon: Copy,
      onClick: handleCopyUrl,
      color: 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-950/20'
    },
    {
      id: 'share',
      label: 'Partager',
      icon: Share,
      onClick: handleShare,
      color: 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-950/20'
    },
    {
      id: 'delete',
      label: 'Supprimer',
      icon: Trash2,
      onClick: handleDelete,
      color: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20',
      destructive: true
    }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        onMouseEnter={() => trigger === 'hover' && setIsMenuOpen(true)}
        onMouseLeave={() => trigger === 'hover' && setIsMenuOpen(false)}
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isLoading}
        title="Actions rapides"
      >
        <MoreHorizontal className="w-4 h-4" />
      </motion.button>

      {/* Actions Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-50 py-1"
              onMouseEnter={() => trigger === 'hover' && setIsMenuOpen(true)}
              onMouseLeave={() => trigger === 'hover' && setIsMenuOpen(false)}
            >
              {/* Bookmark info header */}
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-medium text-foreground truncate">
                  {bookmark.title || 'Sans titre'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {new URL(bookmark.url).hostname}
                </p>
              </div>

              {/* Quick indicators */}
              <div className="px-3 py-2 border-b border-border">
                <div className="flex items-center gap-2 text-xs">
                  {bookmark.is_favorite && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-full">
                      <Heart className="w-3 h-3 fill-current" />
                      Favori
                    </span>
                  )}
                  {bookmark.is_read && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-full">
                      <Eye className="w-3 h-3" />
                      Lu
                    </span>
                  )}
                  {bookmark.is_archived && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full">
                      <Archive className="w-3 h-3" />
                      Archivé
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="py-1">
                {actions.map((action, index) => {
                  const Icon = action.icon;
                  const isDestructive = action.destructive;

                  return (
                    <React.Fragment key={action.id}>
                      {/* Separator before destructive actions */}
                      {isDestructive && index > 0 && (
                        <div className="border-t border-border my-1" />
                      )}

                      <motion.button
                        onClick={action.onClick}
                        disabled={isLoading}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                          isDestructive
                            ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                            : action.color
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className={`w-4 h-4 ${action.filled ? 'fill-current' : ''}`} />
                        <span className="flex-1 text-left">{action.label}</span>
                        {isLoading && (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
                        )}
                      </motion.button>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Footer with metadata */}
              <div className="px-3 py-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>
                    Ajouté {new Intl.DateTimeFormat('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }).format(new Date(bookmark.created_at))}
                  </span>
                </div>
                {bookmark.tags && bookmark.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Tag className="w-3 h-3" />
                    <span className="truncate">
                      {bookmark.tags.slice(0, 2).join(', ')}
                      {bookmark.tags.length > 2 && ` +${bookmark.tags.length - 2}`}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookmarkQuickActions;