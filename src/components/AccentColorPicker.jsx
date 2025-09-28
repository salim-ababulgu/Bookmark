import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, Smartphone, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const AccentColorPicker = ({ className = '' }) => {
  const {
    accentColor,
    changeAccentColor,
    availableColors,
    accentColors,
    isDarkMode,
    toggleDarkMode
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);

  const colorDisplayNames = {
    blue: 'Bleu',
    green: 'Vert',
    purple: 'Violet',
    pink: 'Rose',
    orange: 'Orange',
    red: 'Rouge',
    teal: 'Sarcelle',
    indigo: 'Indigo'
  };

  const handleColorChange = (colorKey) => {
    changeAccentColor(colorKey);
    setIsOpen(false);
  };

  const getCurrentColorValue = (colorKey, mode = isDarkMode ? 'dark' : 'light') => {
    return accentColors[colorKey]?.[mode]?.primary || '#3b82f6';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-accent/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Ouvrir le sélecteur de couleur et de thème"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border-2 border-background shadow-sm"
            style={{ backgroundColor: getCurrentColorValue(accentColor) }}
          />
          <Palette className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-foreground hidden sm:inline">
          {colorDisplayNames[accentColor] || 'Couleur'}
        </span>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="absolute top-full right-0 mt-2 w-80 bg-background border border-border rounded-xl shadow-2xl z-50 p-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Personnalisation</h3>
                </div>

                {/* Theme toggle */}
                <motion.button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Basculer vers le mode ${isDarkMode ? 'clair' : 'sombre'}`}
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Clair</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Sombre</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Mode Preview */}
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Mode {isDarkMode ? 'sombre' : 'clair'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Les couleurs s'adaptent automatiquement au mode choisi
                </p>
              </div>

              {/* Color Grid */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Couleur d'accent
                </label>

                <div className="grid grid-cols-4 gap-2">
                  {availableColors.map((colorKey) => {
                    const isSelected = accentColor === colorKey;
                    const lightColor = getCurrentColorValue(colorKey, 'light');
                    const darkColor = getCurrentColorValue(colorKey, 'dark');

                    return (
                      <motion.button
                        key={colorKey}
                        onClick={() => handleColorChange(colorKey)}
                        className={`
                          relative p-3 rounded-lg border-2 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary/50
                          ${isSelected
                            ? 'border-primary shadow-lg shadow-primary/25'
                            : 'border-border hover:border-muted-foreground'
                          }
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title={colorDisplayNames[colorKey]}
                        aria-label={`Sélectionner la couleur ${colorDisplayNames[colorKey]}`}
                        aria-pressed={isSelected}
                      >
                        {/* Dual color preview */}
                        <div className="flex rounded-md overflow-hidden h-8">
                          <div
                            className="flex-1 flex items-center justify-center relative"
                            style={{ backgroundColor: lightColor }}
                          >
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500 }}
                              >
                                <Check className="w-3 h-3 text-white drop-shadow-sm" />
                              </motion.div>
                            )}
                          </div>
                          <div
                            className="flex-1 flex items-center justify-center"
                            style={{ backgroundColor: darkColor }}
                          >
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
                              >
                                <Check className="w-3 h-3 text-white drop-shadow-sm" />
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {/* Color name */}
                        <div className="mt-2 text-xs font-medium text-center text-foreground">
                          {colorDisplayNames[colorKey]}
                        </div>

                        {/* Selected indicator */}
                        {isSelected && (
                          <motion.div
                            className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <Check className="w-2.5 h-2.5 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Current selection info */}
              <motion.div
                className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getCurrentColorValue(accentColor) }}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {colorDisplayNames[accentColor]} sélectionné
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Cette couleur sera utilisée pour les boutons, liens et éléments interactifs
                </p>
              </motion.div>

              {/* Info footer */}
              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Smartphone className="w-3 h-3" />
                  <span>Vos préférences sont sauvegardées automatiquement</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccentColorPicker;