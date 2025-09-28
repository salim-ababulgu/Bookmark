import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';

const FeedbackButton = ({
  children,
  onClick,
  successMessage = "Succès !",
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  hapticFeedback = true,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const triggerHapticFeedback = () => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate([10, 5, 10]); // Pattern léger
    }
  };

  const handleClick = async (e) => {
    if (disabled || isLoading || isSuccess) return;

    triggerHapticFeedback();
    setIsLoading(true);

    try {
      await onClick(e);

      // Animation de succès
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      // Vibration d'erreur
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
    }
  };

  const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";

  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500",
    success: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl focus:ring-green-500",
    danger: "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl focus:ring-red-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-xl"
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      onClick={handleClick}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {/* Onde de clic */}
      <motion.div
        className="absolute inset-0 bg-white/20 rounded-inherit"
        initial={{ scale: 0, opacity: 0 }}
        animate={isLoading || isSuccess ? { scale: 1, opacity: [0, 0.5, 0] } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* Contenu du bouton */}
      <motion.div
        className="flex items-center justify-center"
        animate={{
          scale: isSuccess ? 1.1 : 1,
          rotate: isSuccess ? [0, 5, -5, 0] : 0
        }}
        transition={{ duration: 0.3 }}
      >
        {isLoading && (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {isSuccess && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center"
          >
            <CheckIcon className="w-4 h-4 mr-2" />
            <span>{successMessage}</span>
          </motion.div>
        )}

        {!isLoading && !isSuccess && (
          <span>{children}</span>
        )}
      </motion.div>

      {/* Effet de brillance pour le succès */}
      {isSuccess && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
      )}
    </motion.button>
  );
};

export default FeedbackButton;