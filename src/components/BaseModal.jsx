import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

const BaseModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footerContent,
  size = 'md',
  showNavbar = true,
  showFooter = true,
  className = '',
  closeOnBackdrop = true,
  closeOnEscape = true
}) => {
  // Gérer l'échappement avec Escape
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Empêcher le scroll du body quand la modal est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
              relative bg-card rounded-2xl shadow-2xl border border-border/50
              w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col ${className}
            `}
            onClick={(e) => e.stopPropagation()}
          >

            {/* Header */}
            {showNavbar && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-b border-border/30 backdrop-blur-sm rounded-t-2xl overflow-hidden"
              >
                {/* Pattern décoratif */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

                <div className="relative flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    {icon && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="p-3 bg-primary/15 rounded-xl shadow-lg"
                      >
                        {React.cloneElement(icon, { className: "h-6 w-6 text-primary" })}
                      </motion.div>
                    )}
                    <div>
                      <motion.h2
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl font-semibold text-foreground tracking-tight"
                      >
                        {title}
                      </motion.h2>
                      {subtitle && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-sm text-muted-foreground mt-1"
                        >
                          {subtitle}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="group p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    title="Fermer"
                  >
                    <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </motion.button>
                </div>

                {/* Ligne décorative animée */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
                />
              </motion.div>
            )}

            {/* Contenu principal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1 overflow-y-auto overscroll-contain modal-scroll"
              style={{
                maxHeight: showNavbar && showFooter && footerContent
                  ? 'calc(85vh - 180px)'
                  : showNavbar
                    ? 'calc(85vh - 100px)'
                    : 'calc(85vh - 60px)',
                minHeight: '200px'
              }}
            >
              {children}
            </motion.div>

            {/* Footer sophistiqué */}
            {showFooter && footerContent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative bg-gradient-to-r from-muted/20 via-muted/10 to-accent/10 border-t border-border/30 backdrop-blur-sm rounded-b-2xl overflow-hidden"
              >
                {/* Ligne décorative */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

                {/* Pattern décoratif */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

                <div className="relative p-4">
                  {footerContent}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default BaseModal;