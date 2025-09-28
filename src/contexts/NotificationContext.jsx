import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabaseAuth } from './SupabaseAuthContext';
import UpdateService from '../services/updateService';
import notificationService from '../services/notificationService';
import useToast from '../hooks/useToast.jsx';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useSupabaseAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Notifications des nouvelles fonctionnalités ajoutées
  const mockNotifications = [
    {
      id: 1,
      title: 'Interface modernisée avec onglets',
      message: 'Navigation simplifiée avec Dashboard, Analytics et Liens dans une interface à onglets sophistiquée.',
      type: 'feature',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false,
      icon: '🎨'
    },
    {
      id: 2,
      title: 'Récupération automatique de titre',
      message: 'Ajout d\'un favori simplifié avec récupération automatique du titre et favicon.',
      type: 'feature',
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      read: false,
      icon: '⚡'
    },
    {
      id: 3,
      title: 'Système de couleurs d\'accent',
      message: 'Personnalisez l\'interface avec 8 couleurs d\'accent différentes dans les paramètres.',
      type: 'feature',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      read: false,
      icon: '🌈'
    },
    {
      id: 4,
      title: 'Avatars personnalisables',
      message: 'Utilisez votre image personnalisée, Gravatar ou les initiales pour votre profil.',
      type: 'feature',
      timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
      read: false,
      icon: '👤'
    },
    {
      id: 5,
      title: 'Modal de bienvenue amélioré',
      message: 'Nouveau système d\'onboarding avec import de favoris depuis votre navigateur.',
      type: 'feature',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      icon: '🎉'
    },
    {
      id: 2,
      title: 'Mise à jour de sécurité',
      message: 'Votre application a été mise à jour avec les derniers correctifs de sécurité.',
      type: 'security',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      icon: '🔒'
    },
    {
      id: 3,
      title: 'Performance améliorée',
      message: 'La vitesse de chargement des signets a été optimisée.',
      type: 'improvement',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      icon: '⚡'
    }
  ];

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      localStorage.setItem('bookmarkapp_notifications', JSON.stringify(updated));
      setUnreadCount(updated.filter(n => !n.read).length);
      return updated;
    });
  };

  useEffect(() => {
    if (user) {
      initializeNotifications();
    }

    return () => {
      notificationService.cleanup();
    };
  }, [user]);

  const initializeNotifications = async () => {
    try {
      setIsLoading(true);

      // Initialiser le service de notifications en temps réel
      await notificationService.initialize(user.id);

      // Charger les notifications existantes
      await loadNotifications();

      // Écouter les événements de notifications en temps réel
      const unsubscribe = notificationService.addListener((event, data) => {
        handleRealtimeNotification(event, data);
      });

      // Vérifier les nouvelles mises à jour
      const newUpdates = UpdateService.checkForNewUpdates();
      for (const update of newUpdates) {
        if (!UpdateService.isUpdateSeen(update.id)) {
          await sendNotification({
            title: update.title,
            message: update.message,
            type: update.type,
            icon: update.icon
          });
          UpdateService.markUpdateAsSeen(update.id);
        }
      }

      // Démarrer la vérification périodique des mises à jour
      const checkInterval = UpdateService.startPeriodicCheck(async (updates) => {
        for (const update of updates) {
          if (!UpdateService.isUpdateSeen(update.id)) {
            await sendNotification({
              title: update.title,
              message: update.message,
              type: update.type,
              icon: update.icon
            });
            UpdateService.markUpdateAsSeen(update.id);
          }
        }
      }, 60);

      return () => {
        unsubscribe();
        if (checkInterval) {
          clearInterval(checkInterval);
        }
      };
    } catch (error) {
      console.error('❌ Erreur initialisation notifications:', error);
      // Fallback vers les notifications mock en cas d'erreur
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data);
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('❌ Erreur chargement notifications:', error);
    }
  };

  const handleRealtimeNotification = (event, data) => {
    switch (event) {
      case 'new_notification':
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast.info(data.title, { duration: 4000 });
        break;
      case 'notification_updated':
        setNotifications(prev =>
          prev.map(n => n.id === data.id ? data : n)
        );
        if (data.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        break;
      case 'notification_deleted':
        setNotifications(prev => prev.filter(n => n.id !== data.id));
        if (!data.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        break;
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId, user.id);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ Erreur marquage notification:', error);
      toast.error('Erreur lors du marquage de la notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      console.error('❌ Erreur marquage notifications:', error);
      toast.error('Erreur lors du marquage des notifications');
    }
  };

  const removeNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId, user.id);
      const wasUnread = notifications.find(n => n.id === notificationId)?.read === false;
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification supprimée');
    } catch (error) {
      console.error('❌ Erreur suppression notification:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const clearAllNotifications = async () => {
    try {
      // Supprimer toutes les notifications une par une
      const deletePromises = notifications.map(n =>
        notificationService.deleteNotification(n.id, user.id)
      );
      await Promise.all(deletePromises);

      setNotifications([]);
      setUnreadCount(0);
      toast.success('Toutes les notifications ont été supprimées');
    } catch (error) {
      console.error('❌ Erreur suppression notifications:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const sendNotification = async (notification) => {
    try {
      await notificationService.sendNotification(user.id, notification);
      toast.success('Notification envoyée');
    } catch (error) {
      console.error('❌ Erreur envoi notification:', error);
      toast.error('Erreur lors de l\'envoi de la notification');
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    clearAllNotifications,
    sendNotification,
    loadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};