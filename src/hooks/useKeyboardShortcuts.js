import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export const useKeyboardShortcuts = (handlers = {}) => {
  const handleKeyDown = useCallback((event) => {
    // Ignorer si l'utilisateur tape dans un input/textarea
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.isContentEditable
    ) {
      return;
    }

    const { key, ctrlKey, metaKey, altKey, shiftKey } = event;
    const isCtrlOrCmd = ctrlKey || metaKey;

    // Définir les raccourcis
    const shortcuts = {
      // Navigation
      '1': () => handlers.switchTab?.('bookmarks'),
      '2': () => handlers.switchTab?.('analytics'),
      '3': () => handlers.switchTab?.('links'),

      // Actions principales
      'n': () => {
        if (isCtrlOrCmd) {
          event.preventDefault();
          handlers.addBookmark?.();
          toast.info('💫 Nouveau favori (Ctrl+N)', {
            description: 'Formulaire d\'ajout ouvert'
          });
        }
      },

      's': () => {
        if (isCtrlOrCmd) {
          event.preventDefault();
          handlers.focusSearch?.();
          toast.info('🔍 Recherche active (Ctrl+S)', {
            description: 'Tapez pour rechercher'
          });
        }
      },

      'e': () => {
        if (isCtrlOrCmd && altKey) {
          event.preventDefault();
          handlers.exportBookmarks?.();
          toast.info('📤 Export lancé (Ctrl+Alt+E)', {
            description: 'Téléchargement en cours...'
          });
        }
      },

      'i': () => {
        if (isCtrlOrCmd && altKey) {
          event.preventDefault();
          handlers.triggerImport?.();
          toast.info('📥 Import (Ctrl+Alt+I)', {
            description: 'Sélectionnez votre fichier'
          });
        }
      },

      'd': () => {
        if (isCtrlOrCmd && altKey) {
          event.preventDefault();
          handlers.toggleDarkMode?.();
          toast.info('🌓 Mode sombre basculé (Ctrl+Alt+D)');
        }
      },

      // Vues
      'v': () => {
        if (!isCtrlOrCmd && !altKey) {
          handlers.cycleViewMode?.();
          toast.info('👁️ Vue changée (V)', {
            description: 'Liste → Grille → Galerie'
          });
        }
      },

      // Filtres rapides
      'f': () => {
        if (!isCtrlOrCmd && !altKey) {
          handlers.toggleFilters?.();
          toast.info('🔧 Filtres basculés (F)');
        }
      },

      // Raccourcis avec Shift
      'F': () => {
        if (shiftKey && !isCtrlOrCmd) {
          handlers.clearFilters?.();
          toast.info('🧹 Filtres effacés (Shift+F)');
        }
      },

      'R': () => {
        if (shiftKey && !isCtrlOrCmd) {
          handlers.refreshData?.();
          toast.info('🔄 Données actualisées (Shift+R)');
        }
      },

      // Aide
      '?': () => {
        if (!isCtrlOrCmd && !altKey) {
          handlers.showHelp?.();
        }
      },

      // Escape pour fermer
      'Escape': () => {
        handlers.closeModals?.();
      }
    };

    // Exécuter le raccourci correspondant
    const shortcut = shortcuts[key];
    if (shortcut) {
      shortcut();
    }

  }, [handlers]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Fonction utilitaire pour afficher l'aide des raccourcis
  const showShortcutsHelp = () => {
    toast.info('⌨️ Raccourcis clavier', {
      description: `
🔢 1,2,3 - Changer d'onglet
➕ Ctrl+N - Nouveau favori
🔍 Ctrl+S - Rechercher
📤 Ctrl+Alt+E - Exporter
📥 Ctrl+Alt+I - Importer
🌓 Ctrl+Alt+D - Mode sombre
👁️ V - Changer la vue
🔧 F - Basculer filtres
🧹 Shift+F - Effacer filtres
🔄 Shift+R - Actualiser
❓ ? - Cette aide
      `,
      duration: 8000
    });
  };

  return { showShortcutsHelp };
};