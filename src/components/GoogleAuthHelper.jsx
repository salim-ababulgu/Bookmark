import React, { useState } from 'react';
import { AlertCircle, Shield, RefreshCw, Eye, Chrome, Globe } from 'lucide-react';

const GoogleAuthHelper = ({ onRetry, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const solutions = [
    {
      icon: Shield,
      title: "Désactivez votre bloqueur de publicités",
      description: "AdBlock, uBlock Origin, AdBlock Plus bloquent Google",
      steps: [
        "Cliquez sur l'icône de votre bloqueur dans la barre d'outils",
        "Désactivez-le pour ce site (localhost:3001)",
        "Ou ajoutez *.google.com à votre whitelist"
      ]
    },
    {
      icon: Eye,
      title: "Testez en mode incognito/privé",
      description: "Les extensions sont souvent désactivées en mode privé",
      steps: [
        "Ouvrez une nouvelle fenêtre privée (Ctrl+Shift+N)",
        "Accédez à localhost:3001",
        "Essayez la connexion Google"
      ]
    },
    {
      icon: Chrome,
      title: "Vérifiez les extensions de navigateur",
      description: "D'autres extensions peuvent bloquer les requêtes",
      steps: [
        "Accédez aux paramètres des extensions",
        "Désactivez temporairement les extensions de confidentialité",
        "Rechargez la page et réessayez"
      ]
    },
    {
      icon: Globe,
      title: "Whitelist les domaines Google",
      description: "Autorisez spécifiquement les domaines nécessaires",
      steps: [
        "Ajoutez *.google.com à votre whitelist",
        "Ajoutez *.googleapis.com",
        "Ajoutez accounts.google.com"
      ]
    }
  ];

  return (
    <div className={`bg-orange-50 border border-orange-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-orange-800 mb-2">
            Connexion Google bloquée
          </h3>
          <p className="text-sm text-orange-700 mb-3">
            Votre navigateur ou une extension bloque la connexion à Google.
            Voici comment résoudre le problème :
          </p>

          {!isExpanded ? (
            <div className="space-y-2">
              <div className="text-sm text-orange-700">
                <strong>Solution rapide :</strong> Désactivez temporairement votre bloqueur de publicités ou testez en mode incognito.
              </div>
              <button
                onClick={() => setIsExpanded(true)}
                className="text-sm text-orange-800 underline hover:no-underline"
              >
                Voir toutes les solutions →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {solutions.map((solution, index) => {
                const Icon = solution.icon;
                return (
                  <div key={index} className="bg-white rounded-lg p-3 border border-orange-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Icon className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {solution.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {solution.description}
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          {solution.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start gap-2">
                              <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => setIsExpanded(false)}
                className="text-sm text-orange-800 underline hover:no-underline"
              >
                ← Réduire
              </button>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-orange-200">
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer la connexion Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthHelper;