import React from 'react';
import { motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import useToast from '../hooks/useToast.jsx';

const ColorPicker = ({ className = '' }) => {
  const { accentColor, accentColors, changeAccentColor } = useTheme();
  const toast = useToast();

  const handleColorChange = (colorKey) => {
    changeAccentColor(colorKey);
    toast.success(`Couleur d'accent changée : ${accentColors[colorKey].name}`);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Couleur d'accent</span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {Object.entries(accentColors).map(([colorKey, colorData]) => (
          <motion.button
            key={colorKey}
            onClick={() => handleColorChange(colorKey)}
            className={`
              relative w-12 h-12 rounded-xl border-2 transition-all duration-200
              focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:outline-none
              group overflow-hidden
              ${accentColor === colorKey
                ? 'border-gray-400 dark:border-gray-500 ring-2 ring-gray-300 dark:ring-gray-600'
                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
            style={{ backgroundColor: colorData.primary }}
            title={colorData.name}
            whileHover={{ scale: accentColor === colorKey ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Effet de brillance au survol */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />

            {/* Icône de sélection */}
            {accentColor === colorKey && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-1">
                  <Check className="w-4 h-4 text-white drop-shadow-sm" />
                </div>
              </motion.div>
            )}

            {/* Overlay au survol */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 rounded-xl"></div>
          </motion.button>
        ))}
      </div>

      {/* Aperçu de la couleur sélectionnée */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        <motion.div
          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: accentColors[accentColor].primary }}
          layoutId="selected-color"
        />
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {accentColors[accentColor].name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Couleur principale de l'interface
          </div>
        </div>
      </motion.div>

      <p className="text-xs text-muted-foreground">
        Choisissez une couleur pour personnaliser l'interface
      </p>
    </div>
  );
};

export default ColorPicker;