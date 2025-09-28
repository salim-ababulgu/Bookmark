import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PageTransition = ({
  children,
  className = '',
  variant = 'fade',
  duration = 0.3,
  delay = 0
}) => {
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    },
    slideRight: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 }
    },
    blur: {
      initial: { opacity: 0, filter: 'blur(8px)' },
      animate: { opacity: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, filter: 'blur(8px)' }
    }
  };

  const transition = {
    duration,
    delay,
    ease: [0.25, 0.46, 0.45, 0.94] // Bezier curve for smooth animation
  };

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants[variant]}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

// Hook pour les transitions de liste
export const useStaggeredAnimation = (items, delay = 0.1) => {
  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: delay
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  };

  return { containerVariants, itemVariants };
};

// Composant pour les listes avec animation échelonnée
export const StaggeredList = ({
  children,
  className = '',
  staggerDelay = 0.1,
  ...props
}) => {
  const { containerVariants, itemVariants } = useStaggeredAnimation([], staggerDelay);

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default PageTransition;