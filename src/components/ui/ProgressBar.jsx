import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({
  progress = 0,
  max = 100,
  showPercentage = true,
  color = 'primary',
  size = 'md',
  animated = true,
  className = ''
}) => {
  const percentage = Math.min(Math.max((progress / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  };

  const colors = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-500',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    info: 'bg-gradient-to-r from-cyan-500 to-blue-500'
  };

  return (
    <div className={`w-full ${className}`}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progression
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          className={`${sizes[size]} ${colors[color]} rounded-full relative overflow-hidden`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 0.5 : 0,
            ease: 'easeOut'
          }}
        >
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressBar;