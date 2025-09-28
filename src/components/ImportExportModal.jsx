import React, { useState } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { addBookmark, getUserBookmarks, getUserCollections } from '../services/supabaseDataService';
import { toast } from 'sonner';
import { X, Upload, Download, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const ImportExportModal = ({ isOpen, onClose, onImportSuccess }) => {
  const { user } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState('import');
  const [importData, setImportData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importResults, setImportResults] = useState(null);

  // Fonction pour exporter les favoris
  const handleExport = async () => {
    setIsLoading(true);
    try {
      // Récupérer les favoris et collections
      const [bookmarksResult, collectionsResult] = await Promise.all([
        getUserBookmarks(user.id),
        getUserCollections(user.id)
      ]);

      if (!bookmarksResult.success || !collectionsResult.success) {
        throw new Error('Erreur lors de la récupération des données');
      }

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        userEmail: user.email,
        bookmarks: bookmarksResult.data,
        collections: collectionsResult.data
      };

      // Créer et télécharger le fichier JSON
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `bookmarks_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      toast.success(`${bookmarksResult.data.length} favoris exportés avec succès !`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('Erreur lors de l\'export des favoris');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour traiter l'import depuis un fichier
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      toast.error('Veuillez sélectionner un fichier JSON');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImportData(e.target.result);
    };
    reader.readAsText(file);
  };

  // Fonction pour parser les favoris HTML (bookmarks de navigateur)
  const parseHtmlBookmarks = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const links = doc.querySelectorAll('a[href]');

    const bookmarks = [];
    links.forEach((link) => {
      const url = link.getAttribute('href');
      const title = link.textContent.trim();

      if (url && title && url.startsWith('http')) {
        bookmarks.push({
          title,
          url,
          description: '',
          tags: [],
          is_favorite: false,
          is_read: false
        });
      }
    });

    return bookmarks;
  };

  // Fonction pour parser le JSON d'export
  const parseJsonBookmarks = (jsonContent) => {
    try {
      const data = JSON.parse(jsonContent);

      // Si c'est un export de notre app
      if (data.bookmarks && Array.isArray(data.bookmarks)) {
        return data.bookmarks.map(bookmark => ({
          title: bookmark.title || 'Titre manquant',
          url: bookmark.url,
          description: bookmark.description || '',
          tags: bookmark.tags || [],
          is_favorite: bookmark.is_favorite || false,
          is_read: bookmark.is_read || false
        }));
      }

      // Si c'est un array direct de bookmarks
      if (Array.isArray(data)) {
        return data.map(bookmark => ({
          title: bookmark.title || bookmark.name || 'Titre manquant',
          url: bookmark.url || bookmark.uri,
          description: bookmark.description || '',
          tags: bookmark.tags || [],
          is_favorite: bookmark.is_favorite || false,
          is_read: bookmark.is_read || false
        }));
      }

      throw new Error('Format JSON non reconnu');
    } catch (error) {
      throw new Error(`Erreur de parsing JSON: ${error.message}`);
    }
  };

  // Fonction principale d'import
  const handleImport = async () => {
    if (!importData.trim()) {
      toast.error('Veuillez coller ou sélectionner des données à importer');
      return;
    }

    setIsLoading(true);
    setImportResults(null);

    try {
      let bookmarksToImport = [];

      // Détecter le format et parser
      if (importData.trim().startsWith('<') || importData.includes('<!DOCTYPE')) {
        // Format HTML (export de navigateur)
        bookmarksToImport = parseHtmlBookmarks(importData);
      } else {
        // Format JSON
        bookmarksToImport = parseJsonBookmarks(importData);
      }

      if (bookmarksToImport.length === 0) {
        toast.error('Aucun favori trouvé dans les données fournies');
        return;
      }

      // Importer les favoris
      const results = {
        total: bookmarksToImport.length,
        success: 0,
        failed: 0,
        duplicates: 0,
        errors: []
      };

      // Récupérer les favoris existants pour éviter les doublons
      const existingBookmarksResult = await getUserBookmarks(user.id);
      const existingUrls = existingBookmarksResult.success
        ? existingBookmarksResult.data.map(b => b.url)
        : [];

      for (const bookmark of bookmarksToImport) {
        try {
          // Vérifier les doublons
          if (existingUrls.includes(bookmark.url)) {
            results.duplicates++;
            continue;
          }

          // Valider l'URL
          new URL(bookmark.url);

          // Importer le favori
          const result = await addBookmark(bookmark, user.id);

          if (result.success) {
            results.success++;
            existingUrls.push(bookmark.url); // Ajouter à la liste pour éviter les doublons dans le même batch
          } else {
            results.failed++;
            results.errors.push(`${bookmark.title}: ${result.error}`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`${bookmark.title}: ${error.message}`);
        }
      }

      setImportResults(results);

      if (results.success > 0) {
        toast.success(`${results.success} favoris importés avec succès !`);
        onImportSuccess?.();
      }

      if (results.failed > 0) {
        toast.error(`${results.failed} favoris n'ont pas pu être importés`);
      }

    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      toast.error('Erreur lors de l\'import des favoris');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setImportData('');
      setImportResults(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 pb-20">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl border border-border max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {activeTab === 'import' ? <Upload className="h-5 w-5 text-primary" /> : <Download className="h-5 w-5 text-primary" />}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Import / Export
              </h2>
              <p className="text-sm text-muted-foreground">
                Gérez vos favoris avec les outils d'import et d'export
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors focus-ring"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'import'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Importer
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'export'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Download className="h-4 w-4 inline mr-2" />
            Exporter
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === 'import' ? (
            <div className="space-y-6">
              {/* Instructions d'import */}
              <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                <h3 className="font-medium text-info mb-2">Comment importer vos favoris :</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Chrome/Edge:</strong> Exportez depuis Menu → Favoris → Gestionnaire → Exporter</li>
                  <li>• <strong>Firefox:</strong> Exportez depuis Bibliothèque → Marque-pages → Importer et sauvegarder</li>
                  <li>• <strong>Safari:</strong> Exportez depuis Fichier → Exporter les signets</li>
                  <li>• <strong>JSON:</strong> Fichiers d'export de cette application ou format personnalisé</li>
                </ul>
              </div>

              {/* Import depuis fichier */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sélectionner un fichier
                </label>
                <input
                  type="file"
                  accept=".json,.html,.htm"
                  onChange={handleFileImport}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus-ring"
                  disabled={isLoading}
                />
              </div>

              {/* Ou coller les données */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Ou coller les données directement
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Collez ici le contenu de votre fichier d'export de favoris (HTML ou JSON)..."
                  rows="8"
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus-ring resize-none font-mono text-xs"
                  disabled={isLoading}
                />
              </div>

              {/* Résultats de l'import */}
              {importResults && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-primary/10 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-primary">{importResults.total}</div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-green-600">{importResults.success}</div>
                      <div className="text-xs text-muted-foreground">Réussis</div>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-orange-600">{importResults.duplicates}</div>
                      <div className="text-xs text-muted-foreground">Doublons</div>
                    </div>
                    <div className="bg-red-100 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-red-600">{importResults.failed}</div>
                      <div className="text-xs text-muted-foreground">Échoués</div>
                    </div>
                  </div>

                  {importResults.errors.length > 0 && (
                    <details className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <summary className="cursor-pointer font-medium text-red-700">
                        Voir les erreurs ({importResults.errors.length})
                      </summary>
                      <div className="mt-2 space-y-1 text-xs text-red-600 max-h-32 overflow-y-auto">
                        {importResults.errors.map((error, index) => (
                          <div key={index}>• {error}</div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {/* Bouton d'import */}
              <button
                onClick={handleImport}
                disabled={isLoading || !importData.trim()}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 focus-ring"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Importation en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Importer les favoris
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Instructions d'export */}
              <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                <h3 className="font-medium text-info mb-2">Export des données :</h3>
                <p className="text-sm text-muted-foreground">
                  Téléchargez tous vos favoris et collections au format JSON.
                  Ce fichier peut être réimporté dans cette application ou utilisé pour sauvegarder vos données.
                </p>
              </div>

              {/* Informations sur l'export */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Tous vos favoris seront inclus</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Toutes vos collections seront incluses</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Format JSON compatible pour réimport</span>
                </div>
              </div>

              {/* Bouton d'export */}
              <button
                onClick={handleExport}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 focus-ring"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Export en cours...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Télécharger mes favoris
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportExportModal;