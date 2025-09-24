import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, TrendingUp } from 'lucide-react';

// Composant pour les particules flottantes (version simplifiée)
export const FloatingParticles = ({ count = 20 }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.3 + 0.1
    }));
    setParticles(newParticles);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-primary/20 animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDuration: `${Math.random() * 3 + 2}s`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );
};

// Badge animé pour les nouvelles fonctionnalités
export const NewFeatureBadge = ({ children, show = true }) => {
  if (!show) return children;

  return (
    <div className="relative">
      {children}
      <div className="absolute -top-2 -right-2 animate-pulse">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
          NEW
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-3 h-3 text-yellow-200 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Indicateur de performance animé
export const PerformanceIndicator = ({ value, label, color = "primary" }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const getColorClasses = (color) => {
    const colors = {
      primary: 'from-blue-500 to-purple-600',
      success: 'from-green-500 to-emerald-600',
      warning: 'from-yellow-500 to-orange-600',
      danger: 'from-red-500 to-pink-600'
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="relative group">
      <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground font-medium">{label}</span>
          <TrendingUp className="h-4 w-4 text-primary animate-pulse" />
        </div>

        <div className="text-2xl font-bold mb-3 group-hover:scale-110 transition-transform duration-300">
          <span
            className={`bg-gradient-to-r ${getColorClasses(color)} bg-clip-text text-transparent`}
          >
            {animatedValue}
          </span>
        </div>

        {/* Barre de progression animée */}
        <div className="w-full bg-border rounded-full h-2 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getColorClasses(color)} rounded-full transition-all duration-1000 ease-out relative`}
            style={{ width: `${Math.min((animatedValue / Math.max(value, 100)) * 100, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour les animations de chargement
export const LoadingSpinner = ({ size = "md", color = "primary" }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colors = {
    primary: 'border-primary',
    white: 'border-white',
    gray: 'border-gray-500'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} ${colors[color]} border-2 border-t-transparent rounded-full animate-spin`} />
    </div>
  );
};

// Toast personnalisé avec animations
export const AnimatedToast = ({ message, type = "info", duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    const styles = {
      info: 'bg-blue-500 border-blue-400',
      success: 'bg-green-500 border-green-400',
      warning: 'bg-yellow-500 border-yellow-400',
      error: 'bg-red-500 border-red-400'
    };
    return styles[type] || styles.info;
  };

  const getIcon = () => {
    const icons = {
      info: '💡',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    return icons[type] || icons.info;
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      visible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
    }`}>
      <div className={`${getTypeStyles()} text-white px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{getIcon()}</span>
          <span className="font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
};

// Animation d'apparition en fondu pour les listes (version simplifiée)
export const FadeInList = ({ children, stagger = 50 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className={`transform transition-all duration-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            transitionDelay: `${index * stagger}ms`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// Effet de brillance sur les boutons (version simplifiée)
export const ShimmerButton = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`relative overflow-hidden bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
      {children}
    </button>
  );
};

// Compteur animé
export const AnimatedCounter = ({ from = 0, to, duration = 1000, formatter = (n) => n }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setCount(Math.floor(from + (to - from) * easeOutQuart));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [from, to, duration]);

  return <span>{formatter(count)}</span>;
};

export default {
  FloatingParticles,
  NewFeatureBadge,
  PerformanceIndicator,
  LoadingSpinner,
  AnimatedToast,
  FadeInList,
  ShimmerButton,
  AnimatedCounter
};