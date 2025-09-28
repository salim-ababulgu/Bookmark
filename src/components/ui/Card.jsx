import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Card = ({
  children,
  className = '',
  hover = true,
  padding = 'md',
  rounded = 'lg',
  shadow = 'md',
  ...props
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const roundedStyles = {
    none: '',
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl'
  };

  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-lg',
    lg: 'shadow-xl',
    xl: 'shadow-2xl'
  };

  const baseStyles = cn(
    'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300',
    paddingStyles[padding],
    roundedStyles[rounded],
    shadowStyles[shadow],
    className
  );

  if (hover) {
    return (
      <motion.div
        className={baseStyles}
        whileHover={{
          y: -4,
          scale: 1.02,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseStyles} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={cn('mb-4', className)}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={cn('text-xl font-semibold text-gray-900 dark:text-white', className)}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={cn('text-gray-600 dark:text-gray-300 mt-2', className)}>
    {children}
  </p>
);

const CardContent = ({ children, className = '' }) => (
  <div className={cn('', className)}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={cn('mt-6 flex items-center justify-between', className)}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };