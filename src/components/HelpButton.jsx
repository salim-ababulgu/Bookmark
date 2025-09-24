import React, { useState } from 'react';
import { HelpCircle, Keyboard, Zap, X, Sparkles } from 'lucide-react';
import { NewFeatureBadge } from './AnimatedComponents';

const HelpButton = ({ onShowShortcuts }) => {
  const [showHelp, setShowHelp] = useState(false);

  const tips = [
    {
      icon: '🔍',
      title: 'Recherche rapide',
      description: 'Appuyez sur Ctrl+S pour accéder instantanément à la barre de recherche'
    },
    {
      icon: '➕',
      title: 'Ajouter rapidement',
      description: 'Ctrl+N pour ouvrir le formulaire d\'ajout de favori'
    },
    {
      icon: '👁️',
      title: 'Prévisualisation',
      description: 'Cliquez sur l\'icône œil ou sur un favori pour voir l\'aperçu avec screenshot'
    },
    {
      icon: '🔢',
      title: 'Navigation rapide',
      description: 'Utilisez 1, 2, 3 pour naviguer entre Favoris, Analytics, et Liens'
    },
    {
      icon: '🎨',
      title: 'Changer de vue',
      description: 'Appuyez sur V pour cycler entre les vues Liste, Grille, et Galerie'
    },
    {
      icon: '🌓',
      title: 'Mode sombre',
      description: 'Ctrl+Alt+D pour basculer entre thème clair et sombre'
    },
    {
      icon: '📤',
      title: 'Export/Import',
      description: 'Ctrl+Alt+E pour exporter, Ctrl+Alt+I pour importer vos favoris'
    },
    {
      icon: '🧹',
      title: 'Nettoyage rapide',
      description: 'Shift+F pour effacer tous les filtres de recherche'
    }
  ];

  return (
    <>
      <NewFeatureBadge show={true}>
        <button
          onClick={() => setShowHelp(true)}
          className="fixed bottom-6 right-6 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-40"
          title="Aide et raccourcis clavier"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </NewFeatureBadge>

      {showHelp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl w-full max-w-3xl max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">BookmarkApp - Guide d'utilisation</h2>
                    <p className="text-muted-foreground">Découvrez toutes les fonctionnalités et raccourcis</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-8">
                {/* Nouvelles fonctionnalités */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    🎉 Nouvelles fonctionnalités
                  </h3>
                  <div className="grid gap-3">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="font-medium text-blue-700 dark:text-blue-300">📊 Analytics Dashboard</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        Statistiques détaillées, sites populaires, et analyse de vos habitudes
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="font-medium text-green-700 dark:text-green-300">🔗 Détecteur de liens brisés</div>
                      <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Vérification automatique et surveillance des liens morts
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="font-medium text-orange-700 dark:text-orange-300">👁️ Prévisualisation avancée</div>
                      <div className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                        Screenshots des sites, métadonnées, et aperçu complet
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conseils et astuces */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    💡 Conseils et astuces
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {tips.map((tip, index) => (
                      <div key={index} className="p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{tip.icon}</span>
                          <div>
                            <div className="font-medium text-foreground">{tip.title}</div>
                            <div className="text-sm text-muted-foreground mt-1">{tip.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      onShowShortcuts();
                      setShowHelp(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Keyboard className="h-4 w-4" />
                    Voir tous les raccourcis
                  </button>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-accent transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpButton;