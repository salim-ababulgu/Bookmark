import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Upload, X, Globe, ChevronRight, ChevronLeft,
  Bookmark, Search, Tags, BarChart3, Shield, Zap,
  CheckCircle, Play, Pause, RotateCcw
} from 'lucide-react';
import BaseModal from './BaseModal';
import { toast } from 'sonner';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { addBookmark } from '../services/supabaseDataService';
import { getDemoBookmarks, importBookmarks } from '../services/bookmarkImportService';

const EnhancedWelcomeModal = ({ isOpen, onClose }) => {
  const { user } = useSupabaseAuth();
  const [step, setStep] = useState(1);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [tourAutoPlay, setTourAutoPlay] = useState(true);
  const [completedFeatures, setCompletedFeatures] = useState([]);

  // Auto-play tour
  useEffect(() => {
    let interval;
    if (tourAutoPlay && step >= 2 && step <= 4) {
      interval = setInterval(() => {
        setStep(prev => prev < 4 ? prev + 1 : 2);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [tourAutoPlay, step]);

  const steps = [
    {
      id: 1,
      title: "Bienvenue dans BookmarkApp ! 🎉",
      subtitle: "Votre voyage vers une gestion de favoris révolutionnaire commence ici",
      content: "welcome"
    },
    {
      id: 2,
      title: "Sauvegarde instantanée",
      subtitle: "Ajoutez des favoris en un clic avec auto-detection du titre et favicon",
      content: "feature",
      icon: Zap,
      demo: "bookmark-creation"
    },
    {
      id: 3,
      title: "Organisation intelligente",
      subtitle: "Collections, tags et recherche avancée pour tout retrouver",
      content: "feature",
      icon: Search,
      demo: "organization"
    },
    {
      id: 4,
      title: "Analytics et insights",
      subtitle: "Suivez vos habitudes de lecture et découvrez vos tendances",
      content: "feature",
      icon: BarChart3,
      demo: "analytics"
    },
    {
      id: 5,
      title: "Importez vos données",
      subtitle: "Transférez vos favoris existants en quelques clics",
      content: "import"
    },
    {
      id: 6,
      title: "Vous êtes prêt !",
      subtitle: "Commencez à utiliser BookmarkApp dès maintenant",
      content: "completion"
    }
  ];

  const currentStep = steps.find(s => s.id === step);

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleImportBookmarks = async (importMethod) => {
    setIsImporting(true);
    setImportResults(null);

    try {
      let bookmarksToImport = [];

      if (importMethod === 'file') {
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
      } else if (importMethod === 'demo') {
        // Import de démonstration avec le nouveau service
        const demoData = getDemoBookmarks();
        await processImport(demoData.bookmarks);
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

    return bookmarks.slice(0, 50);
  };

  const processImport = async (bookmarks) => {
    if (bookmarks.length === 0) {
      toast.error('Aucun favori trouvé');
      setIsImporting(false);
      return;
    }

    const results = {
      total: bookmarks.length,
      success: 0,
      failed: 0
    };

    for (const bookmark of bookmarks) {
      try {
        const result = await addBookmark(bookmark, user.id);
        if (result.success) {
          results.success++;
        } else {
          results.failed++;
        }
        // Petit délai pour l'animation
        await new Promise(resolve => setTimeout(resolve, 100));
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

  const renderWelcomeContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 text-center space-y-6"
    >
      <motion.div
        className="relative mx-auto mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <div className="w-24 h-24 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-full flex items-center justify-center mx-auto relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />
          <Sparkles className="w-12 h-12 text-white relative z-10" />
        </div>
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
        >
          <CheckCircle className="w-4 h-4 text-white" />
        </motion.div>
      </motion.div>

      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Bienvenue dans BookmarkApp !
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto text-lg">
          Félicitations ! Votre compte a été créé avec succès.
          Découvrez comment révolutionner votre gestion de favoris.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-4 max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {[
          { icon: Zap, label: "Ajout instantané", color: "from-yellow-500 to-orange-500" },
          { icon: Search, label: "Recherche puissante", color: "from-blue-500 to-purple-500" },
          { icon: Tags, label: "Organisation smart", color: "from-green-500 to-teal-500" },
          { icon: BarChart3, label: "Analytics détaillés", color: "from-pink-500 to-red-500" }
        ].map((feature, index) => (
          <motion.div
            key={feature.label}
            className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 group cursor-pointer"
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setCompletedFeatures(prev => [...prev, feature.label])}
          >
            <div className={`w-8 h-8 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300`}>
              <feature.icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {feature.label}
            </span>
            {completedFeatures.includes(feature.label) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );

  const renderFeatureContent = () => {
    const feature = currentStep;
    const FeatureIcon = feature.icon;

    return (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="p-6 space-y-6"
      >
        <div className="text-center space-y-4">
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <FeatureIcon className="w-10 h-10 text-primary" />
          </motion.div>

          <div>
            <h3 className="text-2xl font-bold text-foreground">{feature.title}</h3>
            <p className="text-muted-foreground mt-2">{feature.subtitle}</p>
          </div>
        </div>

        {/* Demo area */}
        <motion.div
          className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-6 border border-border/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border/50">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground flex-1">https://exemple.com</span>
                <motion.div
                  className="w-4 h-4 bg-primary rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              </div>
              <div className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Titre et favicon détectés automatiquement !
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="flex gap-2">
                {["Travail", "Inspiration", "Ressources"].map((tag, i) => (
                  <motion.span
                    key={tag}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.2 }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                Collections intelligentes • Recherche en temps réel • Filtres avancés
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Favoris", value: "247", color: "text-blue-600" },
                { label: "Collections", value: "12", color: "text-green-600" },
                { label: "Cette semaine", value: "+23", color: "text-purple-600" }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-center p-3 bg-background rounded-lg border border-border/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Tour controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setTourAutoPlay(!tourAutoPlay)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {tourAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {tourAutoPlay ? 'Pause' : 'Lecture'}
          </button>

          <div className="flex gap-1">
            {[2, 3, 4].map((stepNum) => (
              <button
                key={stepNum}
                onClick={() => setStep(stepNum)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  step === stepNum ? 'bg-primary scale-125' : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            title="Reprendre le tour"
          >
            <RotateCcw className="w-4 h-4" />
            Reprendre
          </button>
        </div>
      </motion.div>
    );
  };

  const renderImportContent = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 space-y-6"
    >
      <div className="text-center space-y-3">
        <motion.div
          className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <Upload className="w-8 h-8 text-blue-600" />
        </motion.div>
        <h3 className="text-xl font-semibold text-foreground">
          Importer vos favoris existants ?
        </h3>
        <p className="text-muted-foreground">
          Commencez avec vos favoris actuels ou découvrez avec nos exemples
        </p>
      </div>

      {importResults ? (
        <motion.div
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="font-medium text-green-800 dark:text-green-400">Import terminé !</h4>
          <div className="text-sm text-green-700 dark:text-green-300">
            <p>✅ {importResults.success} favoris importés avec succès</p>
            {importResults.failed > 0 && (
              <p>❌ {importResults.failed} favoris n'ont pas pu être importés</p>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <motion.button
            onClick={() => handleImportBookmarks('demo')}
            disabled={isImporting}
            className="w-full p-4 border border-border rounded-lg hover:bg-accent/50 transition-all duration-300 text-left flex items-center gap-3 group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Essayer avec des exemples</p>
              <p className="text-sm text-muted-foreground">Démarrer avec des favoris populaires (GitHub, Stack Overflow...)</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
          </motion.button>

          <motion.button
            onClick={() => handleImportBookmarks('file')}
            disabled={isImporting}
            className="w-full p-4 border border-border rounded-lg hover:bg-accent/50 transition-all duration-300 text-left flex items-center gap-3 group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Depuis un fichier</p>
              <p className="text-sm text-muted-foreground">Importer un fichier HTML ou JSON de favoris</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
          </motion.button>
        </div>
      )}

      {isImporting && (
        <motion.div
          className="text-center py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-sm text-muted-foreground">Import en cours...</p>
        </motion.div>
      )}
    </motion.div>
  );

  const renderCompletionContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="relative mx-auto"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <motion.div
          className="absolute inset-0 bg-green-500/20 rounded-full"
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-foreground">Vous êtes prêt ! 🚀</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Votre compte BookmarkApp est configuré et prêt à l'emploi.
          Commencez dès maintenant à organiser vos favoris !
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {[
          { icon: Zap, label: "Ctrl+N", desc: "Ajouter un favori" },
          { icon: Search, label: "Ctrl+K", desc: "Recherche rapide" },
          { icon: Shield, label: "Ctrl+Alt+D", desc: "Mode sombre" }
        ].map((shortcut, index) => (
          <motion.div
            key={shortcut.label}
            className="p-3 bg-muted/50 rounded-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
          >
            <shortcut.icon className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-sm font-mono font-medium text-foreground">{shortcut.label}</div>
            <div className="text-xs text-muted-foreground">{shortcut.desc}</div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );

  const footerContent = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {step > 1 && (
          <button
            onClick={handlePrev}
            className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Progress indicators */}
        <div className="flex gap-1">
          {steps.map((s, index) => (
            <div
              key={s.id}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                step === s.id
                  ? 'bg-primary scale-125'
                  : step > s.id
                    ? 'bg-green-500'
                    : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {step < steps.length ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {step === 1 ? 'Commencer le tour' : 'Suivant'}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
          >
            <CheckCircle className="w-4 h-4" />
            Commencer à utiliser BookmarkApp
          </button>
        )}

        {step !== steps.length && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Ignorer
          </button>
        )}
      </div>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {}} // Empêcher fermeture par X
      title={currentStep?.title}
      subtitle={currentStep?.subtitle}
      icon={currentStep?.icon ? <currentStep.icon /> : <Sparkles />}
      footerContent={footerContent}
      size="lg"
      showNavbar={true}
      className="!max-w-2xl"
    >
      <AnimatePresence mode="wait">
        {step === 1 && renderWelcomeContent()}
        {(step === 2 || step === 3 || step === 4) && renderFeatureContent()}
        {step === 5 && renderImportContent()}
        {step === 6 && renderCompletionContent()}
      </AnimatePresence>
    </BaseModal>
  );
};

export default EnhancedWelcomeModal;