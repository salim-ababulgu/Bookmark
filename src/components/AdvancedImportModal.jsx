import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Globe, Check, X, AlertTriangle,
  FolderOpen, Star, Clock, Download, ArrowRight,
  Shield, Zap, Eye, ChevronDown, ChevronUp,
  Filter, Search, Bookmark
} from 'lucide-react';
import BaseModal from './BaseModal';
import { importBookmarks, getDemoBookmarks } from '../services/bookmarkImportService';
import { addBookmark } from '../services/supabaseDataService';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useFeedback, showAdvancedToast } from './feedback/AdvancedFeedbackSystem';

const AdvancedImportModal = ({ isOpen, onClose, onImportComplete }) => {
  const { user } = useSupabaseAuth();
  const { showLoading, hideLoading } = useFeedback();

  const [step, setStep] = useState('select'); // select, preview, import, complete
  const [importData, setImportData] = useState(null);
  const [selectedBookmarks, setSelectedBookmarks] = useState([]);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResults, setImportResults] = useState(null);
  const [previewFilters, setPreviewFilters] = useState({
    search: '',
    showFolders: true,
    selectedFolders: []
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;

    setIsProcessing(true);
    showLoading('Analyse du fichier...');

    try {
      const result = await importBookmarks(file, {
        maxBookmarks: 10000,
        validateUrls: true,
        includeFolders: true,
        onProgress: (progress) => {
          const messages = {
            validation: 'Validation du fichier...',
            parsing: 'Analyse des favoris...',
            processing: 'Traitement des données...',
            filtering: 'Filtrage des doublons...',
            completed: 'Analyse terminée !'
          };
          showLoading(messages[progress.step] || 'Traitement...');
        }
      });

      if (result.bookmarks.length === 0) {
        hideLoading();
        showAdvancedToast('warning', 'Aucun favori trouvé', {
          description: 'Le fichier ne contient aucun favori valide à importer',
          duration: 4000
        });
        return;
      }

      setImportData(result);
      setSelectedBookmarks(result.bookmarks.map(b => b.url));
      setStep('preview');
      hideLoading();

      showAdvancedToast('success', 'Fichier analysé avec succès !', {
        description: `${result.stats.total} favoris trouvés${result.stats.folders > 0 ? ` dans ${result.stats.folders} dossiers` : ''}`,
        duration: 3000
      });

    } catch (error) {
      hideLoading();
      showAdvancedToast('error', 'Erreur d\'analyse', {
        description: error.message,
        duration: 5000
      });
      console.error('Import error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [showLoading, hideLoading]);


  const handleImport = async () => {
    if (!importData || selectedBookmarks.length === 0) return;

    const bookmarksToImport = importData.bookmarks.filter(b =>
      selectedBookmarks.includes(b.url)
    );

    setStep('import');
    setImportProgress({ current: 0, total: bookmarksToImport.length });

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    for (let i = 0; i < bookmarksToImport.length; i++) {
      const bookmark = bookmarksToImport[i];
      setImportProgress({ current: i + 1, total: bookmarksToImport.length });

      try {
        const result = await addBookmark(bookmark, user.id);
        if (result.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push(`${bookmark.title}: ${result.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${bookmark.title}: ${error.message}`);
      }

      // Petit délai pour l'animation
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setImportResults(results);
    setStep('complete');

    if (results.success > 0) {
      onImportComplete?.(results.success);
      showAdvancedToast('success', 'Import terminé !', {
        description: `${results.success} favoris importés avec succès`,
        duration: 4000
      });
    }
  };

  const filteredBookmarks = importData?.bookmarks.filter(bookmark => {
    const matchesSearch = !previewFilters.search ||
      bookmark.title.toLowerCase().includes(previewFilters.search.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(previewFilters.search.toLowerCase());

    const matchesFolder = previewFilters.selectedFolders.length === 0 ||
      previewFilters.selectedFolders.includes(bookmark.folder);

    return matchesSearch && matchesFolder;
  }) || [];

  const toggleBookmarkSelection = (url) => {
    setSelectedBookmarks(prev =>
      prev.includes(url)
        ? prev.filter(u => u !== url)
        : [...prev, url]
    );
  };

  const toggleAllBookmarks = () => {
    const allVisible = filteredBookmarks.map(b => b.url);
    const allSelected = allVisible.every(url => selectedBookmarks.includes(url));

    if (allSelected) {
      setSelectedBookmarks(prev => prev.filter(url => !allVisible.includes(url)));
    } else {
      setSelectedBookmarks(prev => [...new Set([...prev, ...allVisible])]);
    }
  };

  const renderSelectStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="text-center space-y-4">
        <motion.div
          className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <Upload className="w-10 h-10 text-white" />
        </motion.div>

        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Importer vos favoris
          </h3>
          <p className="text-muted-foreground mt-2">
            Importez facilement vos favoris depuis n'importe quel navigateur
          </p>
        </div>
      </div>

      {/* Options d'import */}
      <div className="space-y-3">
        {/* Import depuis fichier */}
        <motion.label
          className="block p-4 border-2 border-dashed border-border hover:border-primary/50 rounded-xl cursor-pointer transition-all duration-300 group"
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <input
            type="file"
            accept=".html,.htm,.json"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            className="hidden"
            disabled={isProcessing}
          />

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground">Sélectionner un fichier de favoris</h4>
              <p className="text-sm text-muted-foreground">
                Fichiers d'export de Chrome, Firefox, Safari ou Edge (HTML/JSON)
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </motion.label>

      </div>

      {/* Formats supportés */}
      <motion.div
        className="bg-muted/50 rounded-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-foreground">Comment exporter vos favoris</span>
        </div>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• <strong>Chrome/Edge:</strong> Menu → Favoris → Gestionnaire de favoris → Exporter les favoris</li>
          <li>• <strong>Firefox:</strong> Bibliothèque → Marque-pages → Afficher tous les marque-pages → Importer et sauvegarder</li>
          <li>• <strong>Safari:</strong> Fichier → Exporter les signets</li>
          <li>• <strong>Sécurité:</strong> Validation automatique des fichiers importés</li>
        </ul>
      </motion.div>
    </motion.div>
  );

  const renderPreviewStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Stats et contrôles */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Prévisualisation de l'import</h4>
              <p className="text-sm text-muted-foreground">
                {selectedBookmarks.length} sur {importData?.stats.total} favoris sélectionnés
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleAllBookmarks}
              className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {filteredBookmarks.every(b => selectedBookmarks.includes(b.url)) ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
          </div>
        </div>

        {/* Import Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-center border border-blue-200 dark:border-blue-800">
            <div className="text-lg font-bold text-blue-600">{importData?.stats.total || 0}</div>
            <div className="text-xs text-muted-foreground">Total trouvés</div>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg text-center border border-green-200 dark:border-green-800">
            <div className="text-lg font-bold text-green-600">{selectedBookmarks.length}</div>
            <div className="text-xs text-muted-foreground">À importer</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg text-center border border-purple-200 dark:border-purple-800">
            <div className="text-lg font-bold text-purple-600">{importData?.stats.folders || 0}</div>
            <div className="text-xs text-muted-foreground">Dossiers</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg text-center border border-orange-200 dark:border-orange-800">
            <div className="text-lg font-bold text-orange-600">{importData?.stats.format || 'N/A'}</div>
            <div className="text-xs text-muted-foreground">Format</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={previewFilters.search}
                onChange={(e) => setPreviewFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-md bg-background"
              />
            </div>
          </div>

          {importData?.folders?.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  setPreviewFilters(prev => ({
                    ...prev,
                    selectedFolders: prev.selectedFolders.includes(e.target.value)
                      ? prev.selectedFolders.filter(f => f !== e.target.value)
                      : [...prev.selectedFolders, e.target.value]
                  }));
                }
              }}
              className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
            >
              <option value="">Filtrer par dossier</option>
              {importData.folders.map(folder => (
                <option key={folder} value={folder}>
                  {folder} {previewFilters.selectedFolders.includes(folder) ? '✓' : ''}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Liste des favoris */}
      <div className="max-h-96 overflow-y-auto space-y-2 p-4 border border-border rounded-lg">
        <AnimatePresence>
          {filteredBookmarks.map((bookmark, index) => (
            <motion.div
              key={`bookmark-${bookmark.url}-${index}`}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.02 }}
              className={`
                flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer
                ${selectedBookmarks.includes(bookmark.url)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-accent/50'
                }
              `}
              onClick={() => toggleBookmarkSelection(bookmark.url)}
            >
              <div className="flex-shrink-0 mt-1">
                <div className={`
                  w-4 h-4 rounded border-2 flex items-center justify-center
                  ${selectedBookmarks.includes(bookmark.url)
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                  }
                `}>
                  {selectedBookmarks.includes(bookmark.url) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-foreground truncate">
                  {bookmark.title}
                </h5>
                <p className="text-sm text-muted-foreground truncate">
                  {bookmark.url}
                </p>
                {bookmark.folder && (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                    <FolderOpen className="w-3 h-3" />
                    {bookmark.folder}
                  </span>
                )}
              </div>

              {bookmark.is_favorite && (
                <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredBookmarks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Aucun favori trouvé avec ces filtres</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderImportStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 text-center space-y-6"
    >
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
        <Download className="w-8 h-8 text-blue-600" />
      </div>

      <div>
        <h3 className="text-xl font-semibold text-foreground">Import en cours...</h3>
        <p className="text-muted-foreground mt-2">
          {importProgress.current} sur {importProgress.total} favoris
        </p>
      </div>

      <div className="space-y-2">
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {Math.round((importProgress.current / importProgress.total) * 100)}% terminé
        </p>
      </div>
    </motion.div>
  );

  const renderCompleteStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 text-center space-y-6"
    >
      <motion.div
        className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
      >
        <Check className="w-10 h-10 text-green-600" />
      </motion.div>

      <div>
        <h3 className="text-xl font-semibold text-foreground">Import terminé !</h3>
        <p className="text-muted-foreground mt-2">
          {importResults?.success > 0
            ? `${importResults.success} favoris ont été importés avec succès`
            : 'Import terminé'
          }
        </p>
      </div>

      {importResults && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg text-center border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600">{importResults.success}</div>
              <div className="text-xs text-muted-foreground">Importés</div>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg text-center border border-red-200 dark:border-red-800">
              <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
              <div className="text-xs text-muted-foreground">Échecs</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg text-center border border-yellow-200 dark:border-yellow-800">
              <div className="text-2xl font-bold text-yellow-600">{importResults.skipped || 0}</div>
              <div className="text-xs text-muted-foreground">Ignorés</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progression</span>
              <span className="text-foreground">
                {Math.round((importResults.success / (importResults.success + importResults.failed + (importResults.skipped || 0))) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(importResults.success / (importResults.success + importResults.failed + (importResults.skipped || 0))) * 100}%`
                }}
              />
            </div>
          </div>

          {importResults.errors.length > 0 && (
            <details className="text-left">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                Voir les erreurs ({importResults.errors.length})
              </summary>
              <div className="mt-2 text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
                {importResults.errors.map((error, index) => (
                  <div key={index} className="p-2 bg-red-50 dark:bg-red-950/20 rounded">
                    {error}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </motion.div>
  );

  const getStepContent = () => {
    switch (step) {
      case 'select': return renderSelectStep();
      case 'preview': return renderPreviewStep();
      case 'import': return renderImportStep();
      case 'complete': return renderCompleteStep();
      default: return renderSelectStep();
    }
  };

  const getFooterContent = () => {
    if (step === 'select') {
      return (
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Annuler
          </button>
        </div>
      );
    }

    if (step === 'preview') {
      return (
        <div className="flex justify-between">
          <button
            onClick={() => setStep('select')}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Retour
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleImport}
              disabled={selectedBookmarks.length === 0}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Importer {selectedBookmarks.length} favoris
            </button>
          </div>
        </div>
      );
    }

    if (step === 'complete') {
      return (
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Terminer
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={step === 'import' ? () => {} : onClose}
      title="Import de favoris"
      subtitle="Importez vos favoris depuis n'importe quel navigateur"
      icon={<Upload />}
      footerContent={getFooterContent()}
      size="lg"
      className="!max-w-3xl"
    >
      {getStepContent()}
    </BaseModal>
  );
};

export default AdvancedImportModal;