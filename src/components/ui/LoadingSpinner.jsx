import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  text = '',
  className = ''
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colors = {
    primary: 'border-blue-600',
    secondary: 'border-gray-600',
    success: 'border-green-600',
    danger: 'border-red-600',
    warning: 'border-yellow-600'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <motion.div
        className={`${sizes[size]} border-2 ${colors[color]} border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-600 dark:text-gray-300"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;