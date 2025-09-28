import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon, CheckIcon, XMarkIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../contexts/NotificationContext';
import BaseModal from '../BaseModal';
import AnimatedButton from '../ui/AnimatedButton';
import LoadingSpinner from '../ui/LoadingSpinner';
import useToast from '../../hooks/useToast.jsx';

const NotificationModal = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  } = useNotifications();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const toast = useToast();

  const filters = [
    { id: 'all', label: 'Toutes', count: notifications.length },
    { id: 'unread', label: 'Non lues', count: unreadCount },
    { id: 'feature', label: 'Fonctionnalités', count: notifications.filter(n => n.type === 'feature').length },
    { id: 'security', label: 'Sécurité', count: notifications.filter(n => n.type === 'security').length }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !notification.read;
    return notification.type === selectedFilter;
  });

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'feature': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'security': return 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400';
      case 'improvement': return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'info': return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      toast.error('Erreur lors du marquage des notifications');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
      try {
        await clearAllNotifications();
        toast.success('Toutes les notifications ont été supprimées');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const footerContent = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex gap-2">
        {unreadCount > 0 && (
          <AnimatedButton
            variant="secondary"
            size="sm"
            onClick={handleMarkAllRead}
            icon={<CheckIcon className="w-4 h-4" />}
          >
            Tout marquer lu
          </AnimatedButton>
        )}
        {notifications.length > 0 && (
          <AnimatedButton
            variant="danger"
            size="sm"
            onClick={handleClearAll}
            icon={<TrashIcon className="w-4 h-4" />}
          >
            Tout supprimer
          </AnimatedButton>
        )}
      </div>
      <AnimatedButton
        variant="outline"
        onClick={onClose}
      >
        Fermer
      </AnimatedButton>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Centre de notifications"
      subtitle={`${notifications.length} notification${notifications.length > 1 ? 's' : ''} • ${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`}
      icon={<BellIcon />}
      size="lg"
      footerContent={footerContent}
    >
      <div className="p-6">
        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`
                inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${selectedFilter === filter.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {filter.label}
              {filter.count > 0 && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-semibold
                  ${selectedFilter === filter.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }
                `}>
                  {filter.count}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Liste des notifications */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="Chargement des notifications..." />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <BellIcon className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucune notification
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {selectedFilter === 'all'
                  ? 'Vous n\'avez aucune notification pour le moment.'
                  : `Aucune notification dans la catégorie "${filters.find(f => f.id === selectedFilter)?.label}".`
                }
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    relative p-4 rounded-xl border transition-all duration-200 hover:shadow-md
                    ${!notification.read
                      ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    {/* Icône de type */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${getNotificationTypeColor(notification.type)}`}>
                      {notification.icon}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {notification.message}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <motion.button
                            onClick={() => markAsRead(notification.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <EyeIcon className="w-3 h-3" />
                            Marquer lu
                          </motion.button>
                        )}

                        <motion.button
                          onClick={() => removeNotification(notification.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <XMarkIcon className="w-3 h-3" />
                          Supprimer
                        </motion.button>
                      </div>
                    </div>

                    {/* Indicateur non lu */}
                    {!notification.read && (
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default NotificationModal;