import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, AlertCircle, XCircle, Info, Zap,
  Bookmark, Download, Upload, Share, Heart,
  Star, Plus, X, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

// Context for advanced feedback
const FeedbackContext = createContext();

// Feedback types with their configurations
const FEEDBACK_TYPES = {
  success: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
    accentColor: 'from-green-500 to-emerald-500'
  },
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800',
    accentColor: 'from-red-500 to-rose-500'
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    accentColor: 'from-yellow-500 to-orange-500'
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    accentColor: 'from-blue-500 to-indigo-500'
  },
  bookmark: {
    icon: Bookmark,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    accentColor: 'from-purple-500 to-pink-500'
  }
};

// Toast notifications with enhanced styling
export const showAdvancedToast = (type, message, options = {}) => {
  const config = FEEDBACK_TYPES[type] || FEEDBACK_TYPES.info;
  const Icon = config.icon;

  toast.custom((t) => (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`
        ${config.bgColor} ${config.borderColor}
        border rounded-xl p-4 shadow-lg backdrop-blur-sm
        max-w-md w-full relative overflow-hidden
      `}
    >
      {/* Accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${config.accentColor}`} />

      <div className="flex items-start gap-3 ml-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
          className={`${config.color} mt-0.5`}
        >
          <Icon className="w-5 h-5" />
        </motion.div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{message}</p>
          {options.description && (
            <p className="text-xs text-muted-foreground mt-1">{options.description}</p>
          )}

          {options.action && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={options.action.onClick}
              className={`
                mt-2 text-xs font-medium ${config.color}
                hover:underline transition-colors
              `}
            >
              {options.action.label}
            </motion.button>
          )}
        </div>

        <button
          onClick={() => toast.dismiss(t)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar for auto-dismiss */}
      {options.duration !== Infinity && (
        <motion.div
          className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${config.accentColor} rounded-full`}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: (options.duration || 4000) / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  ), {
    duration: options.duration || 4000,
    id: options.id
  });
};

// Floating action feedback
export const FloatingActionFeedback = ({ isVisible, type, message, position = 'center' }) => {
  if (!isVisible) return null;

  const config = FEEDBACK_TYPES[type] || FEEDBACK_TYPES.success;
  const Icon = config.icon;

  const positionClasses = {
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0, y: -20 }}
      className={`
        fixed ${positionClasses[position]} z-50
        ${config.bgColor} ${config.borderColor}
        border rounded-xl p-4 shadow-xl backdrop-blur-md
      `}
    >
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
          className={`${config.color}`}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
        <p className="font-medium text-foreground">{message}</p>
      </div>
    </motion.div>
  );
};

// Progress indicator with steps
export const StepProgress = ({ steps, currentStep, variant = 'horizontal' }) => {
  return (
    <div className={`flex ${variant === 'horizontal' ? 'flex-row' : 'flex-col'} gap-2`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isUpcoming = index > currentStep;

        return (
          <div key={index} className="flex items-center gap-2">
            <motion.div
              className={`
                w-8 h-8 rounded-full border-2 flex items-center justify-center relative
                ${isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : isCurrent
                    ? 'bg-primary border-primary text-white'
                    : 'bg-background border-muted text-muted-foreground'
                }
              `}
              initial={false}
              animate={{
                scale: isCurrent ? 1.1 : 1,
                boxShadow: isCurrent ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none'
              }}
            >
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <CheckCircle className="w-4 h-4" />
                </motion.div>
              ) : (
                <span className="text-xs font-bold">{index + 1}</span>
              )}
            </motion.div>

            {variant === 'horizontal' && index < steps.length - 1 && (
              <motion.div
                className={`
                  h-0.5 w-8 rounded-full
                  ${isCompleted ? 'bg-green-500' : 'bg-muted'}
                `}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isCompleted ? 1 : 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Loading states with context
export const LoadingOverlay = ({ isVisible, message = 'Chargement...', progress = null }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-background border border-border rounded-xl p-6 shadow-xl min-w-[300px]"
      >
        <div className="text-center space-y-4">
          <motion.div
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />

          <div>
            <p className="font-medium text-foreground">{message}</p>
            {progress !== null && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progression</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Provider component
export const AdvancedFeedbackProvider = ({ children }) => {
  const [loadingState, setLoadingState] = useState({ isVisible: false, message: '', progress: null });
  const [floatingFeedback, setFloatingFeedback] = useState({ isVisible: false, type: 'success', message: '' });

  const showLoading = (message = 'Chargement...', progress = null) => {
    setLoadingState({ isVisible: true, message, progress });
  };

  const hideLoading = () => {
    setLoadingState({ isVisible: false, message: '', progress: null });
  };

  const showFloatingFeedback = (type, message, duration = 2000) => {
    setFloatingFeedback({ isVisible: true, type, message });
    setTimeout(() => {
      setFloatingFeedback({ isVisible: false, type: 'success', message: '' });
    }, duration);
  };

  const value = {
    showLoading,
    hideLoading,
    showFloatingFeedback,
    showAdvancedToast
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <AnimatePresence>
        <LoadingOverlay {...loadingState} />
        <FloatingActionFeedback {...floatingFeedback} />
      </AnimatePresence>
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within AdvancedFeedbackProvider');
  }
  return context;
};

export default AdvancedFeedbackProvider;