import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ACCENT_COLORS = {
  blue: {
    name: 'Bleu',
    light: {
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      primaryForeground: '#ffffff',
      accent: '#eff6ff',
      accentForeground: '#1e40af',
      ring: '#3b82f640'
    },
    dark: {
      primary: '#3b82f6',
      primaryHover: '#60a5fa',
      primaryForeground: '#ffffff',
      accent: '#1e3a8a',
      accentForeground: '#dbeafe',
      ring: '#3b82f640'
    }
  },
  green: {
    name: 'Vert',
    light: {
      primary: '#16a34a',
      primaryHover: '#15803d',
      primaryForeground: '#ffffff',
      accent: '#f0fdf4',
      accentForeground: '#166534',
      ring: '#22c55e40'
    },
    dark: {
      primary: '#22c55e',
      primaryHover: '#4ade80',
      primaryForeground: '#ffffff',
      accent: '#14532d',
      accentForeground: '#dcfce7',
      ring: '#22c55e40'
    }
  },
  purple: {
    name: 'Violet',
    light: {
      primary: '#9333ea',
      primaryHover: '#7c3aed',
      primaryForeground: '#ffffff',
      accent: '#faf5ff',
      accentForeground: '#6b21a8',
      ring: '#a855f740'
    },
    dark: {
      primary: '#a855f7',
      primaryHover: '#c084fc',
      primaryForeground: '#ffffff',
      accent: '#4c1d95',
      accentForeground: '#e9d5ff',
      ring: '#a855f740'
    }
  },
  pink: {
    name: 'Rose',
    light: {
      primary: '#db2777',
      primaryHover: '#be185d',
      primaryForeground: '#ffffff',
      accent: '#fdf2f8',
      accentForeground: '#9d174d',
      ring: '#ec489940'
    },
    dark: {
      primary: '#ec4899',
      primaryHover: '#f472b6',
      primaryForeground: '#ffffff',
      accent: '#831843',
      accentForeground: '#fce7f3',
      ring: '#ec489940'
    }
  },
  orange: {
    name: 'Orange',
    light: {
      primary: '#ea580c',
      primaryHover: '#c2410c',
      primaryForeground: '#ffffff',
      accent: '#fff7ed',
      accentForeground: '#9a3412',
      ring: '#f9731640'
    },
    dark: {
      primary: '#f97316',
      primaryHover: '#fb923c',
      primaryForeground: '#ffffff',
      accent: '#7c2d12',
      accentForeground: '#fed7aa',
      ring: '#f9731640'
    }
  },
  red: {
    name: 'Rouge',
    light: {
      primary: '#dc2626',
      primaryHover: '#b91c1c',
      primaryForeground: '#ffffff',
      accent: '#fef2f2',
      accentForeground: '#991b1b',
      ring: '#ef444440'
    },
    dark: {
      primary: '#ef4444',
      primaryHover: '#f87171',
      primaryForeground: '#ffffff',
      accent: '#7f1d1d',
      accentForeground: '#fecaca',
      ring: '#ef444440'
    }
  },
  teal: {
    name: 'Sarcelle',
    light: {
      primary: '#0d9488',
      primaryHover: '#0f766e',
      primaryForeground: '#ffffff',
      accent: '#f0fdfa',
      accentForeground: '#134e4a',
      ring: '#14b8a640'
    },
    dark: {
      primary: '#14b8a6',
      primaryHover: '#2dd4bf',
      primaryForeground: '#ffffff',
      accent: '#134e4a',
      accentForeground: '#ccfbf1',
      ring: '#14b8a640'
    }
  },
  indigo: {
    name: 'Indigo',
    light: {
      primary: '#4f46e5',
      primaryHover: '#4338ca',
      primaryForeground: '#ffffff',
      accent: '#f8faff',
      accentForeground: '#3730a3',
      ring: '#6366f140'
    },
    dark: {
      primary: '#6366f1',
      primaryHover: '#818cf8',
      primaryForeground: '#ffffff',
      accent: '#312e81',
      accentForeground: '#e0e7ff',
      ring: '#6366f140'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [accentColor, setAccentColor] = useState('blue');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Charger les préférences sauvegardées
  useEffect(() => {
    try {
      const savedAccentColor = localStorage.getItem('bookmarkapp-accent-color');
      const savedDarkMode = localStorage.getItem('bookmarkapp-dark-mode');

      if (savedAccentColor && ACCENT_COLORS[savedAccentColor]) {
        setAccentColor(savedAccentColor);
      }

      if (savedDarkMode !== null) {
        setIsDarkMode(savedDarkMode === 'true');
      } else {
        // Détecter la préférence système
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
      }
    } catch (error) {
      console.warn('Failed to load theme preferences:', error);
      // Utiliser les valeurs par défaut
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Appliquer le thème au DOM
  useEffect(() => {
    const root = document.documentElement;
    const themeColors = ACCENT_COLORS[accentColor][isDarkMode ? 'dark' : 'light'];

    // Convertir les couleurs hex en format HSL pour les variables CSS
    const hexToHsl = (hex) => {
      if (!hex || !hex.startsWith('#')) return '0 0% 0%';

      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Appliquer les couleurs d'accent adaptées au mode
    root.style.setProperty('--primary', hexToHsl(themeColors.primary));
    root.style.setProperty('--primary-hover', hexToHsl(themeColors.primaryHover));
    root.style.setProperty('--primary-foreground', hexToHsl(themeColors.primaryForeground));
    root.style.setProperty('--accent', hexToHsl(themeColors.accent));
    root.style.setProperty('--accent-foreground', hexToHsl(themeColors.accentForeground));
    root.style.setProperty('--ring', hexToHsl(themeColors.primary));

    // Appliquer le mode sombre
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Sauvegarder les préférences dans localStorage
    try {
      localStorage.setItem('bookmarkapp-accent-color', accentColor);
      localStorage.setItem('bookmarkapp-dark-mode', isDarkMode.toString());
    } catch (error) {
      console.warn('Failed to save theme preferences:', error);
    }
  }, [accentColor, isDarkMode]);

  const changeAccentColor = (colorKey) => {
    if (ACCENT_COLORS[colorKey]) {
      setAccentColor(colorKey);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const getCurrentAccentColor = () => {
    return ACCENT_COLORS[accentColor][isDarkMode ? 'dark' : 'light'];
  };

  const value = {
    accentColor,
    accentColors: ACCENT_COLORS,
    currentAccentColor: getCurrentAccentColor(),
    changeAccentColor,
    isDarkMode,
    toggleDarkMode,
    getCurrentAccentColor,
    availableColors: Object.keys(ACCENT_COLORS)
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};