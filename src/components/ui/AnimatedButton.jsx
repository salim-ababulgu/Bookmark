import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const AnimatedButton = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon,
  ...props
}) => {
  const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white focus:ring-gray-500",
    outline: "border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 focus:ring-gray-500",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 focus:ring-gray-500",
    success: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl focus:ring-green-500",
    danger: "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl focus:ring-red-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-xl",
    xl: "px-8 py-4 text-lg rounded-xl"
  };

  return (
    <motion.button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {/* Shine effect for primary buttons */}
      {(variant === 'primary' || variant === 'success' || variant === 'danger') && (
        <motion.div
          className="absolute inset-0 rounded-inherit bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%', opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      )}

      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {icon && !loading && (
        <span className="mr-2">{icon}</span>
      )}

      <span className="relative">{children}</span>
    </motion.button>
  );
};

export default AnimatedButton;