import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const FloatingActionButton = ({
  children,
  actions = [],
  className = '',
  position = 'bottom-right'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const positions = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className={`${positions[position]} z-50 ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-4 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.id || index}
                initial={{ scale: 0, y: 50 }}
                animate={{
                  scale: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: index * 0.1
                  }
                }}
                exit={{
                  scale: 0,
                  y: 50,
                  transition: {
                    delay: (actions.length - index - 1) * 0.05
                  }
                }}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:shadow-xl transition-shadow duration-200 group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={action.label}
              >
                {action.icon}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={toggleMenu}
        className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg text-white hover:shadow-xl transition-shadow duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {children || (isOpen ? <XMarkIcon className="w-6 h-6" /> : <PlusIcon className="w-6 h-6" />)}
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;