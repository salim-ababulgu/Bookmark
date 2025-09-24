import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, Trash2, Settings } from 'lucide-react';
import { toast } from 'sonner';

const NotificationCenter = ({ bookmarks = [], collections = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    enableStats: true,
    enableTips: true,
    enableUpdates: true,
    enableAchievements: true
  });

  // Générer des notifications intelligentes
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications = [];
      const now = new Date();

      // Stats et achievements
      if (settings.enableStats) {
        if (bookmarks.length > 0) {
          const recent = bookmarks.filter(b => {
            const created = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return (now - created) < 24 * 60 * 60 * 1000; // 24h
          }).length;

          if (recent > 0) {
            newNotifications.push({
              id: 'daily-stats',
              type: 'info',
              title: `📈 ${recent} nouveau${recent > 1 ? 'x' : ''} favori${recent > 1 ? 's' : ''} aujourd'hui`,
              description: 'Votre collection grandit !',
              timestamp: now,
              action: () => toast.success('🎉 Continuez comme ça !')
            });
          }

          // Achievement pour milestones
          if (bookmarks.length === 10) {
            newNotifications.push({
              id: 'milestone-10',
              type: 'success',
              title: '🎊 Premier milestone atteint !',
              description: '10 favoris sauvegardés. Félicitations !',
              timestamp: now,
              badge: 'NEW'
            });
          } else if (bookmarks.length === 50) {
            newNotifications.push({
              id: 'milestone-50',
              type: 'success',
              title: '🚀 Super collection !',
              description: '50 favoris ! Vous êtes un vrai collectionneur.',
              timestamp: now,
              badge: 'ACHIEVEMENT'
            });
          } else if (bookmarks.length === 100) {
            newNotifications.push({
              id: 'milestone-100',
              type: 'success',
              title: '💫 Master Bookmarker !',
              description: '100 favoris ! Vous maîtrisez l\'art de la curation.',
              timestamp: now,
              badge: 'MASTER'
            });
          }
        }
      }

      // Tips et suggestions
      if (settings.enableTips && bookmarks.length > 5) {
        // Suggest collections si pas encore utilisées
        if (collections.length === 0) {
          newNotifications.push({
            id: 'tip-collections',
            type: 'info',
            title: '💡 Conseil : Organisez avec des collections',
            description: 'Créez des collections pour mieux organiser vos favoris',
            timestamp: now,
            action: () => toast.info('Créez votre première collection dans la sidebar !')
          });
        }

        // Suggest tags si pas utilisés
        const hasTaggedBookmarks = bookmarks.some(b => b.tags && b.tags.length > 0);
        if (!hasTaggedBookmarks) {
          newNotifications.push({
            id: 'tip-tags',
            type: 'info',
            title: '🏷️ Conseil : Utilisez les tags',
            description: 'Les tags permettent une recherche plus précise',
            timestamp: now,
            action: () => toast.info('Ajoutez des tags lors de la création d\'un favori !')
          });
        }
      }

      // Notifications de nouvelles fonctionnalités
      if (settings.enableUpdates) {
        newNotifications.push({
          id: 'feature-analytics',
          type: 'info',
          title: '🆕 Nouveau : Dashboard Analytics',
          description: 'Découvrez vos statistiques de navigation',
          timestamp: new Date(now - 60 * 60 * 1000), // Il y a 1h
          badge: 'NEW',
          action: () => {
            toast.success('Onglet Analytics activé !');
            // Ici on pourrait déclencher une navigation vers l'onglet analytics
          }
        });

        newNotifications.push({
          id: 'feature-preview',
          type: 'info',
          title: '✨ Nouveau : Prévisualisation des sites',
          description: 'Cliquez sur l\'œil pour voir un aperçu avec screenshot',
          timestamp: new Date(now - 30 * 60 * 1000), // Il y a 30min
          badge: 'NEW'
        });
      }

      return newNotifications;
    };

    setNotifications(generateNotifications());
  }, [bookmarks.length, collections.length, settings]);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'NEW': return 'bg-blue-500 text-white';
      case 'ACHIEVEMENT': return 'bg-yellow-500 text-black';
      case 'MASTER': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification supprimée');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('Toutes les notifications supprimées');
  };

  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `Il y a ${hours}h`;
    if (minutes > 0) return `Il y a ${minutes}min`;
    return 'À l\'instant';
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Tout effacer
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-accent rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Aucune notification</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Les notifications apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 mb-2 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {getIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground text-sm truncate">
                              {notification.title}
                            </h4>
                            {notification.badge && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${getBadgeColor(notification.badge)}`}>
                                {notification.badge}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground mb-2">
                            {notification.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(notification.timestamp)}
                            </span>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {notification.action && (
                                <button
                                  onClick={notification.action}
                                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                                >
                                  Action
                                </button>
                              )}
                              <button
                                onClick={() => dismissNotification(notification.id)}
                                className="p-1 hover:bg-destructive/20 hover:text-destructive rounded transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Settings */}
            <div className="p-3 border-t border-border">
              <button
                onClick={() => {
                  setIsOpen(false);
                  toast.info('⚙️ Paramètres de notification - Bientôt disponible !');
                }}
                className="w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Settings className="h-3 w-3" />
                Paramètres des notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;