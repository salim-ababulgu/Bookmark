import React, { useState } from 'react';
import { Sparkles, Upload, X, Globe } from 'lucide-react';
import BaseModal from './BaseModal';
import { toast } from 'sonner';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { addBookmark } from '../services/supabaseDataService';

const WelcomeModal = ({ isOpen, onClose }) => {
  const { user } = useSupabaseAuth();
  const [step, setStep] = useState(1); // 1: welcome, 2: import options
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const detectBrowser = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return { name: 'Chrome', icon: Globe };
    if (userAgent.includes('Firefox')) return { name: 'Firefox', icon: Globe };
    if (userAgent.includes('Safari')) return { name: 'Safari', icon: Globe };
    return { name: 'Navigateur', icon: Globe };
  };

  const browser = detectBrowser();
  const BrowserIcon = browser.icon;

  const handleImportBookmarks = async (importMethod) => {
    setIsImporting(true);
    setImportResults(null);

    try {
      let bookmarksToImport = [];

      if (importMethod === 'file') {
        // Créer un input file temporaire
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.html,.htm,.json';

        return new Promise((resolve) => {
          input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) {
              setIsImporting(false);
              return;
            }

            const reader = new FileReader();
            reader.onload = async (event) => {
              try {
                const content = event.target.result;

                if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
                  bookmarksToImport = parseHtmlBookmarks(content);
                } else if (file.name.endsWith('.json')) {
                  const data = JSON.parse(content);
                  bookmarksToImport = data.bookmarks || data || [];
                }

                await processImport(bookmarksToImport);
                resolve();
              } catch (error) {
                toast.error('Erreur lors de la lecture du fichier');
                setIsImporting(false);
              }
            };
            reader.readAsText(file);
          };
          input.click();
        });
      } else if (importMethod === 'browser') {
        // Simuler l'import depuis le navigateur
        toast.info(`Pour importer depuis ${browser.name}, suivez ces étapes:\n1. Allez dans les paramètres\n2. Exportez vos favoris\n3. Importez le fichier ici`);
        setIsImporting(false);
        return;
      }
    } catch (error) {
      console.error('Erreur import:', error);
      toast.error('Erreur lors de l\'import');
      setIsImporting(false);
    }
  };

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

    return bookmarks.slice(0, 50); // Limiter à 50 pour éviter les surcharges
  };

  const processImport = async (bookmarks) => {
    if (bookmarks.length === 0) {
      toast.error('Aucun favori trouvé dans le fichier');
      setIsImporting(false);
      return;
    }

    const results = {
      total: bookmarks.length,
      success: 0,
      failed: 0
    };

    for (const bookmark of bookmarks.slice(0, 10)) { // Limiter à 10 pour la démo
      try {
        const result = await addBookmark(bookmark, user.id);
        if (result.success) {
          results.success++;
        } else {
          results.failed++;
        }
      } catch (error) {
        results.failed++;
      }
    }

    setImportResults(results);
    setIsImporting(false);

    if (results.success > 0) {
      toast.success(`${results.success} favoris importés avec succès !`);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onClose();
    }
  };

  const welcomeContent = (
    <div className="p-6 text-center space-y-6">
      <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-10 h-10 text-white" />
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-foreground">
          Bienvenue dans BookmarkApp ! 🎉
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Félicitations pour votre inscription ! Votre compte a été créé avec succès.
          Prêt à organiser vos favoris comme jamais auparavant ?
        </p>
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-foreground">Que pouvez-vous faire ?</h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>✨ Organiser vos liens avec des collections</p>
          <p>🏷️ Ajouter des tags et descriptions</p>
          <p>📊 Suivre vos statistiques de lecture</p>
          <p>💾 Importer/exporter vos données</p>
        </div>
      </div>
    </div>
  );

  const importContent = (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">
          Importer vos favoris existants ?
        </h3>
        <p className="text-muted-foreground">
          Vous pouvez importer vos favoris depuis votre navigateur pour commencer rapidement.
        </p>
      </div>

      {importResults ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-green-800">Import terminé !</h4>
          <div className="text-sm text-green-700">
            <p>{importResults.success} favoris importés avec succès</p>
            {importResults.failed > 0 && (
              <p>{importResults.failed} favoris n'ont pas pu être importés</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={() => handleImportBookmarks('browser')}
            disabled={isImporting}
            className="w-full p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors text-left flex items-center gap-3"
          >
            <BrowserIcon className="w-6 h-6 text-primary" />
            <div>
              <p className="font-medium text-foreground">Depuis {browser.name}</p>
              <p className="text-sm text-muted-foreground">Importer depuis votre navigateur actuel</p>
            </div>
          </button>

          <button
            onClick={() => handleImportBookmarks('file')}
            disabled={isImporting}
            className="w-full p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors text-left flex items-center gap-3"
          >
            <Upload className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-foreground">Depuis un fichier</p>
              <p className="text-sm text-muted-foreground">Importer un fichier HTML ou JSON</p>
            </div>
          </button>
        </div>
      )}

      {isImporting && (
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Import en cours...</p>
        </div>
      )}
    </div>
  );

  const footerContent = (
    <div className="flex justify-between gap-3">
      {step === 1 ? (
        <>
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            Passer
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Continuer
          </button>
        </>
      ) : (
        <>
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-accent/50 transition-colors"
          >
            Ignorer
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Terminer
          </button>
        </>
      )}
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {}} // Empêcher la fermeture par clic sur X
      title={step === 1 ? "Bienvenue !" : "Import de données"}
      subtitle={step === 1 ? "Votre compte a été créé avec succès" : "Importez vos favoris existants"}
      icon={step === 1 ? <Sparkles /> : <Upload />}
      footerContent={footerContent}
      size="md"
      showNavbar={true}
      className="!max-w-lg"
    >
      {step === 1 ? welcomeContent : importContent}
    </BaseModal>
  );
};

export default WelcomeModal;