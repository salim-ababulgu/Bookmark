import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLinkIcon, PencilIcon, TrashIcon, HeartIcon, ShareIcon, FolderIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import useToast from '../../hooks/useToast.jsx';

const AnimatedBookmarkCard = ({
  bookmark,
  onEdit,
  onDelete,
  onToggleFavorite,
  viewMode = 'grid' // 'list', 'grid', 'masonry'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const toast = useToast();

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: bookmark.title,
          text: bookmark.description,
          url: bookmark.url,
        });
      } else {
        await navigator.clipboard.writeText(bookmark.url);
        toast.success('Lien copié dans le presse-papiers !');
      }
    } catch (error) {
      toast.error('Erreur lors du partage');
    }
  };

  const handleVisit = () => {
    window.open(bookmark.url, '_blank');
    toast.info(`Ouverture de ${bookmark.title}`);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    }
  };

  const imageVariants = {
    hidden: { scale: 1.2, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    },
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2
      }
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
      >
        <div className="flex items-center p-4 space-x-4">
          {/* Favicon */}
          <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
            {bookmark.favicon && !imageError ? (
              <img
                src={bookmark.favicon}
                alt=""
                className="w-8 h-8 object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <ExternalLinkIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {bookmark.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {bookmark.description || bookmark.url}
            </p>
            <div className="flex items-center mt-2 space-x-2">
              {bookmark.collection && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  <FolderIcon className="w-3 h-3 mr-1" />
                  {bookmark.collection}
                </span>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(bookmark.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center space-x-1"
                >
                  <motion.button
                    onClick={handleShare}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ShareIcon className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => onEdit(bookmark)}
                    className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => onDelete(bookmark)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => onToggleFavorite(bookmark)}
              className="p-2 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {bookmark.is_favorite ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-gray-400 hover:text-red-500" />
              )}
            </motion.button>

            <motion.button
              onClick={handleVisit}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Visiter
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid/Masonry view
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-2xl transition-shadow duration-300 group cursor-pointer"
      onClick={handleVisit}
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <AnimatePresence>
          {bookmark.thumbnail && !imageError ? (
            <motion.img
              variants={imageVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              src={bookmark.thumbnail}
              alt={bookmark.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ExternalLinkIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </AnimatePresence>

        {/* Hover overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center space-x-3"
              >
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ShareIcon className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(bookmark);
                  }}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <PencilIcon className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(bookmark);
                  }}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <TrashIcon className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Favorite indicator */}
        <div className="absolute top-3 right-3">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(bookmark);
            }}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {bookmark.is_favorite ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-white" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {bookmark.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {bookmark.description || bookmark.url}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {bookmark.collection && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                <FolderIcon className="w-3 h-3 mr-1" />
                {bookmark.collection}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(bookmark.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default AnimatedBookmarkCard;