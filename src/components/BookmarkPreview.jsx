import React, { useState, useEffect } from 'react';
import {
  Eye,
  X,
  ExternalLink,
  Calendar,
  Globe,
  Tag,
  Folder,
  Clock,
  Share2,
  Heart,
  Copy,
  Download,
  Edit3,
  Maximize2,
  Minimize2,
  RefreshCw,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

const BookmarkPreview = ({ bookmark, collection, onClose, onUpdate, onDelete }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [websiteData, setWebsiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(bookmark.isFavorite || false);

  // Génération d'URL de screenshot (utilise un service tiers comme screenshotapi.net)
  const getScreenshotUrl = (url) => {
    // Pour la démo, on utilise un service gratuit. En production, vous pourriez utiliser:
    // - https://screenshotapi.net/
    // - https://htmlcsstoimage.com/
    // - Votre propre service backend
    try {
      const encodedUrl = encodeURIComponent(url);
      // Service gratuit pour la démo (limité)
      return `https://api.screenshotmachine.com/?key=demo&url=${encodedUrl}&dimension=1024x768&cacheLimit=0`;
    } catch (error) {
      console.error('Error generating screenshot URL:', error);
      return null;
    }
  };

  // Extraire des métadonnées du site web
  useEffect(() => {
    const fetchWebsiteData = async () => {
      try {
        setLoading(true);

        // Simulation de récupération de métadonnées (en production, utilisez votre backend)
        await new Promise(resolve => setTimeout(resolve, 1000));

        const domain = new URL(bookmark.url).hostname.replace('www.', '');
        const mockData = {
          domain,
          title: bookmark.title,
          description: `Découvrez le contenu de ${bookmark.title} et explorez cette ressource intéressante.`,
          favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
          loadTime: Math.floor(Math.random() * 2000) + 500,
          status: 'online',
          lastChecked: new Date().toISOString(),
          visits: Math.floor(Math.random() * 100) + 1,
          tags: bookmark.tags || [],
          dateAdded: bookmark.createdAt
        };

        setWebsiteData(mockData);
      } catch (error) {
        console.error('Error fetching website data:', error);
        setWebsiteData({
          domain: 'Inconnu',
          title: bookmark.title,
          description: 'Impossible de récupérer les informations du site.',
          error: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWebsiteData();
  }, [bookmark]);

  const copyUrl = () => {
    navigator.clipboard.writeText(bookmark.url);
    toast.success('URL copiée !');
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris');
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

  const formatDate = (date) => {
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const screenshotUrl = getScreenshotUrl(bookmark.url);

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300 ${isFullscreen ? 'p-0' : ''}`}>
      <div className={`bg-card border border-border rounded-xl overflow-hidden transition-all duration-500 ease-out transform ${
        isFullscreen
          ? 'w-full h-full rounded-none'
          : 'w-full max-w-4xl max-h-[90vh] shadow-2xl scale-100 hover:scale-[1.01]'
      }`}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {websiteData?.favicon && (
              <img
                src={websiteData.favicon}
                alt="Favicon"
                className="w-6 h-6 rounded-sm"
                onError={() => {}}
              />
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-foreground truncate text-lg">
                {bookmark.title}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                {websiteData?.domain || 'Chargement...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-full transition-all duration-200 ${
                isFavorite
                  ? 'text-red-500 bg-red-50 hover:bg-red-100'
                  : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
              }`}
              title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Heart className={`h-4 w-4 transition-all duration-200 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={shareBookmark}
              className="p-2 rounded-full text-muted-foreground hover:text-blue-500 hover:bg-blue-50 transition-all duration-200"
              title="Partager"
            >
              <Share2 className="h-4 w-4" />
            </button>

            <button
              onClick={copyUrl}
              className="p-2 rounded-full text-muted-foreground hover:text-green-500 hover:bg-green-50 transition-all duration-200"
              title="Copier l'URL"
            >
              <Copy className="h-4 w-4" />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-accent transition-all duration-200"
              title={isFullscreen ? 'Fenêtre normale' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              title="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* Aperçu du site */}
          <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-background to-accent/10">
            <div className="space-y-6">
              {/* Screenshot */}
              <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-border/50">
                <div className="aspect-video relative group">
                  {screenshotUrl && !imageError ? (
                    <>
                      {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                          <div className="text-center space-y-3">
                            <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto" />
                            <p className="text-sm text-muted-foreground">Génération de l'aperçu...</p>
                          </div>
                        </div>
                      )}
                      <img
                        src={screenshotUrl}
                        alt={`Aperçu de ${bookmark.title}`}
                        className={`w-full h-full object-cover transition-all duration-500 ${
                          imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                        }`}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => {
                          setImageError(true);
                          setImageLoaded(true);
                        }}
                      />
                      {imageLoaded && !imageError && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4">
                            <a
                              href={bookmark.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-white/90 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-white transition-colors duration-200 backdrop-blur-sm"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Visiter le site
                            </a>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <div className="text-center space-y-3">
                        <ImageIcon className="h-12 w-12 text-primary/50 mx-auto" />
                        <p className="text-muted-foreground">Aperçu non disponible</p>
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Visiter quand même
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {websiteData?.description && (
                <div className="bg-card/50 p-4 rounded-lg border border-border/50">
                  <p className="text-muted-foreground leading-relaxed">
                    {websiteData.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Panneau latéral d'informations */}
          <div className="w-full lg:w-80 bg-card/50 border-l border-border p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  Informations
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">URL</p>
                      <p className="text-xs text-muted-foreground break-all">{bookmark.url}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Ajouté le</p>
                      <p className="text-xs text-muted-foreground">{formatDate(bookmark.createdAt)}</p>
                    </div>
                  </div>

                  {collection && (
                    <div className="flex items-start gap-3">
                      <Folder className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Collection</p>
                        <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">
                          {collection.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {websiteData && !loading && (
                    <>
                      <div className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Vitesse de chargement</p>
                          <p className="text-xs text-muted-foreground">{websiteData.loadTime}ms</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Zap className="h-4 w-4 text-green-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Statut</p>
                          <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 border border-green-200">
                            En ligne
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Tags */}
              {bookmark.tags && bookmark.tags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {bookmark.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20 hover:bg-primary/20 transition-colors duration-200"
                      >
                        <Tag className="h-2 w-2" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => window.open(bookmark.url, '_blank')}
                    className="flex items-center gap-2 px-3 py-2 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Ouvrir
                  </button>
                  <button
                    onClick={() => {
                      if (onUpdate) onUpdate(bookmark);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs border border-input rounded-md hover:bg-accent transition-colors duration-200"
                  >
                    <Edit3 className="h-3 w-3" />
                    Modifier
                  </button>
                </div>
              </div>

              {/* Statistiques rapides */}
              {websiteData && !loading && (
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-foreground text-sm">Aperçu rapide</h4>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary">{websiteData.visits || 0}</div>
                      <div className="text-xs text-muted-foreground">Visites</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">✓</div>
                      <div className="text-xs text-muted-foreground">Actif</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarkPreview;