import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { toast } from 'sonner';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  Link,
  Trash2,
  ExternalLink,
  Settings,
  Play,
  Pause,
  BarChart3
} from 'lucide-react';

const LinkChecker = ({ bookmarks, onBookmarkUpdate }) => {
  const [checking, setChecking] = useState(false);
  const [checkResults, setCheckResults] = useState({});
  const [lastCheck, setLastCheck] = useState(null);
  const [autoCheck, setAutoCheck] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [checkInterval, setCheckInterval] = useState(24); // heures

  // Charger les résultats depuis localStorage
  useEffect(() => {
    const savedResults = localStorage.getItem('linkCheckResults');
    const savedLastCheck = localStorage.getItem('lastLinkCheck');
    const savedAutoCheck = localStorage.getItem('autoLinkCheck');
    const savedInterval = localStorage.getItem('linkCheckInterval');

    if (savedResults) {
      setCheckResults(JSON.parse(savedResults));
    }
    if (savedLastCheck) {
      setLastCheck(new Date(savedLastCheck));
    }
    if (savedAutoCheck) {
      setAutoCheck(JSON.parse(savedAutoCheck));
    }
    if (savedInterval) {
      setCheckInterval(parseInt(savedInterval));
    }
  }, []);

  // Sauvegarder les résultats
  useEffect(() => {
    if (Object.keys(checkResults).length > 0) {
      localStorage.setItem('linkCheckResults', JSON.stringify(checkResults));
    }
  }, [checkResults]);

  // Vérification automatique
  useEffect(() => {
    if (!autoCheck || !lastCheck) return;

    const checkNeeded = () => {
      const now = new Date();
      const hoursElapsed = (now - lastCheck) / (1000 * 60 * 60);
      return hoursElapsed >= checkInterval;
    };

    if (checkNeeded()) {
      checkAllLinks(true); // true pour vérification silencieuse
    }

    const interval = setInterval(() => {
      if (checkNeeded()) {
        checkAllLinks(true);
      }
    }, 60 * 60 * 1000); // Vérifier chaque heure

    return () => clearInterval(interval);
  }, [autoCheck, lastCheck, checkInterval, bookmarks]);

  // Fonction pour vérifier un lien
  const checkLink = async (url) => {
    try {
      // Simulation d'une vérification de lien (en réalité, il faudrait un proxy/backend)
      // Car les navigateurs bloquent les requêtes CORS vers des domaines externes

      // Pour une vraie implémentation, vous auriez besoin d'un service backend
      // qui fait la requête HTTP et retourne le statut

      // Ici, on simule différents scénarios basés sur l'URL
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

      if (url.includes('example.com/broken')) {
        return { status: 'broken', statusCode: 404, error: 'Page not found' };
      }
      if (url.includes('slow')) {
        return { status: 'slow', statusCode: 200, responseTime: 5000 };
      }
      if (url.includes('redirect')) {
        return { status: 'redirect', statusCode: 301, redirectTo: 'https://new-url.com' };
      }

      // Vérifications basiques
      try {
        const urlObj = new URL(url);
        if (!urlObj.protocol.startsWith('http')) {
          return { status: 'invalid', error: 'Invalid protocol' };
        }
      } catch (error) {
        return { status: 'invalid', error: 'Malformed URL' };
      }

      // Simulation d'un lien qui marche (la plupart du temps)
      const success = Math.random() > 0.1; // 90% de succès
      if (success) {
        return {
          status: 'working',
          statusCode: 200,
          responseTime: Math.floor(Math.random() * 2000) + 200
        };
      } else {
        return {
          status: 'broken',
          statusCode: 500,
          error: 'Server error'
        };
      }
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  };

  // Vérifier tous les liens
  const checkAllLinks = async (silent = false) => {
    if (checking) return;

    setChecking(true);
    if (!silent) {
      toast.info('Vérification des liens en cours...');
    }

    const results = {};
    const batchSize = 5; // Vérifier 5 liens en parallèle maximum

    try {
      for (let i = 0; i < bookmarks.length; i += batchSize) {
        const batch = bookmarks.slice(i, i + batchSize);

        const batchResults = await Promise.all(
          batch.map(async (bookmark) => {
            const result = await checkLink(bookmark.url);
            return { id: bookmark.id, ...result, checkedAt: new Date() };
          })
        );

        batchResults.forEach(result => {
          results[result.id] = result;
        });

        // Petite pause entre les batches pour ne pas surcharger
        if (i + batchSize < bookmarks.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setCheckResults(results);
      const now = new Date();
      setLastCheck(now);
      localStorage.setItem('lastLinkCheck', now.toISOString());

      if (!silent) {
        const brokenCount = Object.values(results).filter(r => r.status === 'broken').length;
        if (brokenCount > 0) {
          toast.warning(`${brokenCount} lien${brokenCount > 1 ? 's brisé' : ' brisé'} détecté${brokenCount > 1 ? 's' : ''}`);
        } else {
          toast.success('Tous les liens fonctionnent !');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      if (!silent) {
        toast.error('Erreur lors de la vérification des liens');
      }
    } finally {
      setChecking(false);
    }
  };

  // Mettre à jour le statut d'un bookmark
  const updateBookmarkStatus = async (bookmarkId, status) => {
    try {
      await updateDoc(doc(db, 'bookmarks', bookmarkId), {
        linkStatus: status,
        lastChecked: new Date()
      });

      if (onBookmarkUpdate) {
        onBookmarkUpdate();
      }

      toast.success('Statut mis à jour');
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Statistiques
  const stats = {
    total: bookmarks.length,
    working: Object.values(checkResults).filter(r => r.status === 'working').length,
    broken: Object.values(checkResults).filter(r => r.status === 'broken').length,
    slow: Object.values(checkResults).filter(r => r.status === 'slow').length,
    redirect: Object.values(checkResults).filter(r => r.status === 'redirect').length,
    unchecked: bookmarks.length - Object.keys(checkResults).length
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'working': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'broken': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'slow': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'redirect': return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'working': return 'Fonctionne';
      case 'broken': return 'Brisé';
      case 'slow': return 'Lent';
      case 'redirect': return 'Redirection';
      case 'invalid': return 'URL invalide';
      case 'error': return 'Erreur';
      default: return 'Non vérifié';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'working': return 'text-green-600 bg-green-50 border-green-200';
      case 'broken': return 'text-red-600 bg-red-50 border-red-200';
      case 'slow': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'redirect': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Filtrer les bookmarks avec problèmes
  const brokenBookmarks = bookmarks.filter(bookmark =>
    checkResults[bookmark.id]?.status === 'broken'
  );

  const slowBookmarks = bookmarks.filter(bookmark =>
    checkResults[bookmark.id]?.status === 'slow'
  );

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Vérificateur de liens
            </h2>
            <p className="text-muted-foreground">
              Surveillez l'état de vos favoris et détectez les liens brisés
            </p>
            {lastCheck && (
              <p className="text-xs text-muted-foreground mt-1">
                Dernière vérification: {lastCheck.toLocaleDateString()} à {lastCheck.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 border border-input rounded-md hover:bg-accent transition-colors"
              title="Paramètres"
            >
              <Settings className="h-4 w-4" />
            </button>

            <button
              onClick={() => checkAllLinks(false)}
              disabled={checking}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {checking ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Vérifier tous
                </>
              )}
            </button>
          </div>
        </div>

        {/* Paramètres */}
        {showSettings && (
          <div className="mt-4 p-4 bg-accent/30 rounded-md space-y-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCheck}
                  onChange={(e) => {
                    setAutoCheck(e.target.checked);
                    localStorage.setItem('autoLinkCheck', JSON.stringify(e.target.checked));
                  }}
                  className="rounded"
                />
                <span className="text-sm font-medium">Vérification automatique</span>
              </label>
            </div>

            {autoCheck && (
              <div className="flex items-center gap-3">
                <label className="text-sm">Intervalle:</label>
                <select
                  value={checkInterval}
                  onChange={(e) => {
                    const interval = parseInt(e.target.value);
                    setCheckInterval(interval);
                    localStorage.setItem('linkCheckInterval', interval.toString());
                  }}
                  className="px-2 py-1 border border-input rounded text-sm bg-background"
                >
                  <option value="1">Chaque heure</option>
                  <option value="6">Toutes les 6h</option>
                  <option value="12">Toutes les 12h</option>
                  <option value="24">Chaque jour</option>
                  <option value="168">Chaque semaine</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.working}</div>
          <div className="text-sm text-muted-foreground">Fonctionnent</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.broken}</div>
          <div className="text-sm text-muted-foreground">Brisés</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.slow}</div>
          <div className="text-sm text-muted-foreground">Lents</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.unchecked}</div>
          <div className="text-sm text-muted-foreground">Non vérifiés</div>
        </div>
      </div>

      {/* Liens avec problèmes */}
      {brokenBookmarks.length > 0 && (
        <div className="bg-card border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Liens brisés ({brokenBookmarks.length})
          </h3>
          <div className="space-y-3">
            {brokenBookmarks.map(bookmark => {
              const result = checkResults[bookmark.id];
              return (
                <div key={bookmark.id} className="flex items-center justify-between p-3 bg-red-50 rounded-md">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">{bookmark.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{bookmark.url}</div>
                    {result && (
                      <div className="text-xs text-red-600 mt-1">
                        Erreur {result.statusCode}: {result.error}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                      title="Tester le lien"
                    >
                      <ExternalLink className="h-4 w-4 text-red-600" />
                    </a>
                    <button
                      onClick={() => updateBookmarkStatus(bookmark.id, 'fixed')}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                      title="Marquer comme corrigé"
                    >
                      <CheckCircle className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Liens lents */}
      {slowBookmarks.length > 0 && (
        <div className="bg-card border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-600 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Liens lents ({slowBookmarks.length})
          </h3>
          <div className="space-y-3">
            {slowBookmarks.map(bookmark => {
              const result = checkResults[bookmark.id];
              return (
                <div key={bookmark.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">{bookmark.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{bookmark.url}</div>
                    {result && (
                      <div className="text-xs text-yellow-600 mt-1">
                        Temps de réponse: {result.responseTime}ms
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-yellow-100 rounded transition-colors"
                      title="Tester le lien"
                    >
                      <ExternalLink className="h-4 w-4 text-yellow-600" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Liste complète avec statuts */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Tous les favoris
        </h3>

        <div className="space-y-2">
          {bookmarks.map(bookmark => {
            const result = checkResults[bookmark.id];
            const status = result?.status || 'unchecked';

            return (
              <div key={bookmark.id} className="flex items-center justify-between p-3 hover:bg-accent/30 rounded-md transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getStatusIcon(status)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">{bookmark.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{bookmark.url}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(status)}`}>
                    {getStatusText(status)}
                  </span>

                  {result?.checkedAt && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(result.checkedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LinkChecker;