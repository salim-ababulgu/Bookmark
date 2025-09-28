import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;

    const saved = localStorage.getItem('darkMode');
    const isDark = saved ? JSON.parse(saved) : false;

    // Appliquer immédiatement le mode sombre si nécessaire
    document.documentElement.classList.toggle('dark', isDark);

    return isDark;
  });

  const toggleDarkMode = (showToast = true) => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));

    // Appliquer la transition fluide
    document.documentElement.classList.add('dark-mode-transition');
    document.documentElement.classList.toggle('dark', newMode);

    // Retirer la transition après l'animation
    setTimeout(() => {
      document.documentElement.classList.remove('dark-mode-transition');
    }, 300);

    // Toast pour feedback utilisateur (optionnel)
    if (showToast) {
      toast.success(`Mode ${newMode ? 'sombre' : 'clair'} activé`, {
        duration: 2000
      });
    }
  };

  // Détecter les changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      // Seulement si l'utilisateur n'a pas défini de préférence explicite
      const saved = localStorage.getItem('darkMode');
      if (!saved) {
        setDarkMode(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    darkMode,
    toggleDarkMode,
    setDarkMode: (mode) => {
      setDarkMode(mode);
      localStorage.setItem('darkMode', JSON.stringify(mode));
      document.documentElement.classList.toggle('dark', mode);
    }
  };
};