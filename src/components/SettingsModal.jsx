import React, { useState, useEffect } from 'react';
import { Settings, Palette, Moon, Sun, Download, Upload, Trash2, Shield } from 'lucide-react';
import BaseModal from './BaseModal';
import { useTheme } from '../contexts/ThemeContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { toast } from 'sonner';

const SettingsModal = ({ isOpen, onClose }) => {
  const { isDarkMode, toggleDarkMode, accentColor, accentColors, changeAccentColor } = useTheme();
  const { user } = useSupabaseAuth();
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    defaultView: 'list',
    itemsPerPage: 20
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, [isOpen]);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
    toast.success('Paramètres sauvegardés');
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const exportSettings = () => {
    const exportData = {
      settings,
      theme: {
        isDarkMode,
        accentColor
      },
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmarkapp-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Paramètres exportés');
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);

        if (importData.settings) {
          saveSettings(importData.settings);
        }

        if (importData.theme) {
          if (importData.theme.accentColor && accentColors[importData.theme.accentColor]) {
            changeAccentColor(importData.theme.accentColor);
          }
          if (typeof importData.theme.isDarkMode === 'boolean' && importData.theme.isDarkMode !== isDarkMode) {
            toggleDarkMode();
          }
        }

        toast.success('Paramètres importés avec succès');
      } catch (error) {
        toast.error('Erreur lors de l\'importation des paramètres');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const resetSettings = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
      const defaultSettings = {
        notifications: true,
        autoSave: true,
        defaultView: 'list',
        itemsPerPage: 20
      };
      saveSettings(defaultSettings);
      changeAccentColor('blue');
      if (isDarkMode) {
        toggleDarkMode();
      }
      toast.success('Paramètres réinitialisés');
    }
  };

  const footerContent = (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 px-4 py-2.5 text-foreground border border-border/50 rounded-lg hover:bg-accent/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:outline-none"
      >
        Fermer
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Paramètres"
      subtitle="Personnalisez votre expérience BookmarkApp"
      icon={<Settings />}
      footerContent={footerContent}
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* Theme Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Thème et Apparence
          </h3>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <div>
                <div className="font-medium text-foreground">Mode sombre</div>
                <div className="text-sm text-muted-foreground">
                  {isDarkMode ? 'Interface sombre activée' : 'Interface claire activée'}
                </div>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDarkMode ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Accent Color */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="font-medium text-foreground mb-3">Couleur d'accent</div>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(accentColors).map(([key, color]) => (
                <button
                  key={key}
                  onClick={() => changeAccentColor(key)}
                  className={`w-full p-3 rounded-lg border-2 transition-all ${
                    accentColor === key
                      ? 'border-primary shadow-lg shadow-primary/25'
                      : 'border-border hover:border-primary/50'
                  }`}
                  style={{ backgroundColor: color.accent }}
                >
                  <div
                    className="w-6 h-6 rounded-full mx-auto"
                    style={{ backgroundColor: color.primary }}
                  />
                  <div className="text-xs mt-2 text-foreground">{color.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Application Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Préférences de l'application
          </h3>

          <div className="space-y-3">
            {/* Notifications */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium text-foreground">Notifications</div>
                <div className="text-sm text-muted-foreground">Recevoir les notifications de l'app</div>
              </div>
              <button
                onClick={() => handleSettingChange('notifications', !settings.notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Auto Save */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium text-foreground">Sauvegarde automatique</div>
                <div className="text-sm text-muted-foreground">Sauvegarder automatiquement les modifications</div>
              </div>
              <button
                onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoSave ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Default View */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="font-medium text-foreground mb-2">Vue par défaut</div>
              <select
                value={settings.defaultView}
                onChange={(e) => handleSettingChange('defaultView', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
              >
                <option value="list">Liste</option>
                <option value="grid">Grille</option>
                <option value="cards">Cartes</option>
              </select>
            </div>

            {/* Items Per Page */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="font-medium text-foreground mb-2">Éléments par page</div>
              <select
                value={settings.itemsPerPage}
                onChange={(e) => handleSettingChange('itemsPerPage', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
              >
                <option value={10}>10 éléments</option>
                <option value={20}>20 éléments</option>
                <option value={50}>50 éléments</option>
                <option value={100}>100 éléments</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Gestion des données
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={exportSettings}
              className="flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>

            <label className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-950/40 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              Importer
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="hidden"
              />
            </label>

            <button
              onClick={resetSettings}
              className="flex items-center justify-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="border-t border-border pt-4">
          <div className="text-sm text-muted-foreground">
            Connecté en tant que <span className="font-medium text-foreground">{user?.email}</span>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default SettingsModal;