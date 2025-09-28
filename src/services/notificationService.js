import { supabase } from './supabase';

class NotificationService {
  constructor() {
    this.listeners = new Set();
    this.isInitialized = false;
    this.subscription = null;
  }

  // Initialiser le service de notifications
  async initialize(userId) {
    if (this.isInitialized) return;

    try {
      // Initialiser avec des notifications en mémoire uniquement
      this.mockNotifications = this.getMockNotifications();
      console.log('📱 Notifications mock initialisées en mémoire');

      // S'abonner aux changements en temps réel sur la table notifications (si elle existe)
      this.subscription = supabase
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            this.handleRealtimeUpdate(payload);
          }
        )
        .subscribe();

      this.isInitialized = true;
      console.log('🔔 Service de notifications initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation notifications:', error);
    }
  }

  // Gérer les mises à jour en temps réel
  handleRealtimeUpdate(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        this.notifyListeners('new_notification', newRecord);
        this.showSystemNotification(newRecord);
        break;
      case 'UPDATE':
        this.notifyListeners('notification_updated', newRecord);
        break;
      case 'DELETE':
        this.notifyListeners('notification_deleted', oldRecord);
        break;
    }
  }

  // Afficher une notification système (browser notification)
  async showSystemNotification(notification) {
    if (!('Notification' in window)) return;

    // Demander la permission si nécessaire
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      const systemNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: `bookmark-${notification.id}`,
        requireInteraction: false,
        silent: false,
        timestamp: Date.now(),
        data: {
          id: notification.id,
          type: notification.type,
          url: notification.action_url
        }
      });

      // Auto-fermer après 5 secondes
      setTimeout(() => {
        systemNotification.close();
      }, 5000);

      // Gérer les clics sur la notification
      systemNotification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        if (notification.action_url) {
          window.open(notification.action_url, '_blank');
        }
        systemNotification.close();
      };
    }
  }

  // Envoyer une notification
  async sendNotification(userId, notification) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title: notification.title,
          message: notification.message,
          type: notification.type || 'info',
          icon: notification.icon || '📢',
          action_url: notification.action_url,
          read: false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ Erreur envoi notification:', error);
      throw error;
    }
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId, userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.warn('⚠️ Table notifications non trouvée, utilisation du mode démo');

      // Fallback vers les notifications en mémoire
      if (this.mockNotifications) {
        this.mockNotifications = this.mockNotifications.map(n =>
          n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n
        );
        this.notifyListeners('notification_updated', { id: notificationId, read: true });
      }
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
    } catch (error) {
      console.warn('⚠️ Table notifications non trouvée, utilisation du mode démo');

      // Fallback vers les notifications en mémoire
      if (this.mockNotifications) {
        this.mockNotifications = this.mockNotifications.map(n => ({
          ...n,
          read: true,
          read_at: new Date().toISOString()
        }));
        this.notifyListeners('notifications_all_read', {});
      }
    }
  }

  // Supprimer une notification
  async deleteNotification(notificationId, userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.warn('⚠️ Table notifications non trouvée, utilisation du mode démo');

      // Fallback vers les notifications en mémoire
      if (this.mockNotifications) {
        this.mockNotifications = this.mockNotifications.filter(n => n.id !== notificationId);
        this.notifyListeners('notification_deleted', { id: notificationId });
      }
    }
  }

  // Récupérer les notifications d'un utilisateur
  async getNotifications(userId, limit = 50, offset = 0) {
    try {
      // Essayer d'abord Supabase
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('⚠️ Table notifications non trouvée, utilisation du mode démo');

      // Fallback vers les notifications en mémoire
      if (this.mockNotifications) {
        return this.mockNotifications.slice(offset, offset + limit);
      }

      return this.getMockNotifications().slice(offset, offset + limit);
    }
  }

  // Récupérer le nombre de notifications non lues
  async getUnreadCount(userId) {
    try {
      // Essayer d'abord Supabase
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.warn('⚠️ Table notifications non trouvée, utilisation du mode démo');

      // Fallback vers les notifications en mémoire
      if (this.mockNotifications) {
        return this.mockNotifications.filter(n => !n.read).length;
      }

      return this.getMockNotifications().filter(n => !n.read).length;
    }
  }

  // Notifications mock pour démonstration
  getMockNotifications() {
    return [
      {
        id: 1,
        title: 'Interface modernisée avec onglets',
        message: 'Navigation simplifiée avec Dashboard, Analytics et Liens dans une interface à onglets sophistiquée.',
        type: 'feature',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        read: false,
        icon: '🎨'
      },
      {
        id: 2,
        title: 'Récupération automatique de titre',
        message: 'Ajout d\'un favori simplifié avec récupération automatique du titre et favicon.',
        type: 'feature',
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        read: false,
        icon: '⚡'
      },
      {
        id: 3,
        title: 'Système de couleurs d\'accent',
        message: 'Personnalisez l\'interface avec 8 couleurs d\'accent différentes dans les paramètres.',
        type: 'feature',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        read: false,
        icon: '🌈'
      },
      {
        id: 4,
        title: 'Avatars personnalisables',
        message: 'Utilisez votre image personnalisée, Gravatar ou les initiales pour votre profil.',
        type: 'feature',
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        read: false,
        icon: '👤'
      },
      {
        id: 5,
        title: 'Notifications améliorées',
        message: 'Centre de notifications avec animations fluides et gestion avancée.',
        type: 'feature',
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        read: false,
        icon: '🔔'
      }
    ];
  }

  // Ajouter un listener pour les événements de notifications
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notifier tous les listeners
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('❌ Erreur listener notification:', error);
      }
    });
  }

  // Types de notifications prédéfinis
  static NotificationTypes = {
    BOOKMARK_ADDED: 'bookmark_added',
    BOOKMARK_UPDATED: 'bookmark_updated',
    BOOKMARK_DELETED: 'bookmark_deleted',
    COLLECTION_CREATED: 'collection_created',
    IMPORT_COMPLETED: 'import_completed',
    EXPORT_COMPLETED: 'export_completed',
    SECURITY_ALERT: 'security_alert',
    FEATURE_UPDATE: 'feature_update',
    SYSTEM_MESSAGE: 'system_message'
  };

  // Templates de notifications
  static Templates = {
    bookmarkAdded: (title) => ({
      title: 'Favori ajouté',
      message: `"${title}" a été ajouté à vos favoris`,
      type: NotificationService.NotificationTypes.BOOKMARK_ADDED,
      icon: '🔖'
    }),

    bookmarkUpdated: (title) => ({
      title: 'Favori modifié',
      message: `"${title}" a été mis à jour`,
      type: NotificationService.NotificationTypes.BOOKMARK_UPDATED,
      icon: '✏️'
    }),

    collectionCreated: (name) => ({
      title: 'Collection créée',
      message: `La collection "${name}" a été créée`,
      type: NotificationService.NotificationTypes.COLLECTION_CREATED,
      icon: '📁'
    }),

    importCompleted: (count) => ({
      title: 'Import terminé',
      message: `${count} favoris ont été importés avec succès`,
      type: NotificationService.NotificationTypes.IMPORT_COMPLETED,
      icon: '📥'
    }),

    securityAlert: (message) => ({
      title: 'Alerte de sécurité',
      message: message,
      type: NotificationService.NotificationTypes.SECURITY_ALERT,
      icon: '🔒'
    })
  };

  // Nettoyer les ressources
  cleanup() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.listeners.clear();
    this.isInitialized = false;
  }
}

// Instance singleton
const notificationService = new NotificationService();

export default notificationService;