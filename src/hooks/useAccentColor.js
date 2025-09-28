import { useState, useEffect } from 'react';

const ACCENT_COLORS = {
  blue: {
    name: 'Bleu',
    primary: 'rgb(59, 130, 246)',
    primaryHover: 'rgb(37, 99, 235)',
    light: 'rgb(219, 234, 254)',
    dark: 'rgb(30, 64, 175)',
    css: {
      '--color-primary': '59 130 246',
      '--color-primary-hover': '37 99 235',
      '--color-primary-foreground': '255 255 255',
      '--color-accent': '219 234 254',
      '--color-ring': '59 130 246'
    }
  },
  purple: {
    name: 'Violet',
    primary: 'rgb(147, 51, 234)',
    primaryHover: 'rgb(126, 34, 206)',
    light: 'rgb(233, 213, 255)',
    dark: 'rgb(107, 33, 168)',
    css: {
      '--color-primary': '147 51 234',
      '--color-primary-hover': '126 34 206',
      '--color-primary-foreground': '255 255 255',
      '--color-accent': '233 213 255',
      '--color-ring': '147 51 234'
    }
  },
  emerald: {
    name: 'Émeraude',
    primary: 'rgb(16, 185, 129)',
    primaryHover: 'rgb(5, 150, 105)',
    light: 'rgb(209, 250, 229)',
    dark: 'rgb(6, 120, 86)',
    css: {
      '--color-primary': '16 185 129',
      '--color-primary-hover': '5 150 105',
      '--color-primary-foreground': '255 255 255',
      '--color-accent': '209 250 229',
      '--color-ring': '16 185 129'
    }
  },
  red: {
    name: 'Rouge',
    primary: 'rgb(239, 68, 68)',
    primaryHover: 'rgb(220, 38, 38)',
    light: 'rgb(254, 226, 226)',
    dark: 'rgb(185, 28, 28)',
    css: {
      '--color-primary': '239 68 68',
      '--color-primary-hover': '220 38 38',
      '--color-primary-foreground': '255 255 255',
      '--color-accent': '254 226 226',
      '--color-ring': '239 68 68'
    }
  },
  orange: {
    name: 'Orange',
    primary: 'rgb(249, 115, 22)',
    primaryHover: 'rgb(234, 88, 12)',
    light: 'rgb(255, 237, 213)',
    dark: 'rgb(194, 65, 12)',
    css: {
      '--color-primary': '249 115 22',
      '--color-primary-hover': '234 88 12',
      '--color-primary-foreground': '255 255 255',
      '--color-accent': '255 237 213',
      '--color-ring': '249 115 22'
    }
  },
  pink: {
    name: 'Rose',
    primary: 'rgb(236, 72, 153)',
    primaryHover: 'rgb(219, 39, 119)',
    light: 'rgb(252, 231, 243)',
    dark: 'rgb(190, 24, 93)',
    css: {
      '--color-primary': '236 72 153',
      '--color-primary-hover': '219 39 119',
      '--color-primary-foreground': '255 255 255',
      '--color-accent': '252 231 243',
      '--color-ring': '236 72 153'
    }
  },
  indigo: {
    name: 'Indigo',
    primary: 'rgb(99, 102, 241)',
    primaryHover: 'rgb(79, 70, 229)',
    light: 'rgb(224, 231, 255)',
    dark: 'rgb(67, 56, 202)',
    css: {
      '--color-primary': '99 102 241',
      '--color-primary-hover': '79 70 229',
      '--color-primary-foreground': '255 255 255',
      '--color-accent': '224 231 255',
      '--color-ring': '99 102 241'
    }
  },
  teal: {
    name: 'Sarcelle',
    primary: 'rgb(20, 184, 166)',
    primaryHover: 'rgb(13, 148, 136)',
    light: 'rgb(204, 251, 241)',
    dark: 'rgb(15, 118, 110)',
    css: {
      '--color-primary': '20 184 166',
      '--color-primary-hover': '13 148 136',
      '--color-primary-foreground': '255 255 255',
      '--color-accent': '204 251 241',
      '--color-ring': '20 184 166'
    }
  }
};

const useAccentColor = () => {
  const [currentAccent, setCurrentAccent] = useState('blue');

  useEffect(() => {
    // Charger la couleur d'accent sauvegardée
    const saved = localStorage.getItem('bookmarkapp_accent_color');
    if (saved && ACCENT_COLORS[saved]) {
      setCurrentAccent(saved);
      applyAccentColor(saved);
    } else {
      // Appliquer la couleur par défaut
      applyAccentColor('blue');
    }
  }, []);

  const applyAccentColor = (colorKey) => {
    const color = ACCENT_COLORS[colorKey];
    if (!color) return;

    const root = document.documentElement;

    // Appliquer les variables CSS
    Object.entries(color.css).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Mettre à jour les variables Tailwind CSS
    root.style.setProperty('--primary', color.css['--color-primary']);
    root.style.setProperty('--primary-hover', color.css['--color-primary-hover']);
    root.style.setProperty('--primary-foreground', color.css['--color-primary-foreground']);
    root.style.setProperty('--accent', color.css['--color-accent']);
    root.style.setProperty('--ring', color.css['--color-ring']);
  };

  const changeAccentColor = (colorKey) => {
    if (!ACCENT_COLORS[colorKey]) return;

    setCurrentAccent(colorKey);
    applyAccentColor(colorKey);
    localStorage.setItem('bookmarkapp_accent_color', colorKey);

    // Déclencher un événement personnalisé pour notifier les autres composants
    window.dispatchEvent(new CustomEvent('accentColorChanged', {
      detail: { color: colorKey, colorData: ACCENT_COLORS[colorKey] }
    }));
  };

  const getCurrentColor = () => ACCENT_COLORS[currentAccent];

  const getAllColors = () => ACCENT_COLORS;

  return {
    currentAccent,
    changeAccentColor,
    getCurrentColor,
    getAllColors,
    ACCENT_COLORS
  };
};

export default useAccentColor;