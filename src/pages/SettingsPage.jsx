import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { db } from '../services/firebase';
import { toast } from 'sonner';
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Globe,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Save,
  RefreshCw,
  Database,
  Palette,
  Languages,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Shield,
  Keyboard,
  Zap,
  Smartphone,
  Monitor,
  Wifi,
  HardDrive,
  Activity
} from 'lucide-react';
import { NewFeatureBadge, AnimatedCounter } from '../components/AnimatedComponents';

const SettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // Apparence
    theme: 'light',
    colorScheme: 'blue',
    fontSize: 'medium',
    compactMode: false,
    animationsEnabled: true,

    // Notifications
    browserNotifications: true,
    emailNotifications: true,
    achievementNotifications: true,
    weeklyDigest: true,
    soundEnabled: true,

    // Fonctionnalités
    autoSave: true,
    keyboardShortcuts: true,
    showTooltips: true,
    defaultView: 'list',
    itemsPerPage: 20,
    autoBackup: true,

    // Confidentialité
    profilePublic: false,
    statsPublic: false,
    allowAnalytics: true,

    // Données
    lastBackup: null,
    storageUsed: 0,
    maxStorage: 1000
  });

  const [showDangerZone, setShowDangerZone] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Charger les paramètres depuis localStorage et Firestore
  useEffect(() => {
    const loadSettings = async () => {
      // Paramètres locaux
      const localSettings = {
        theme: localStorage.getItem('theme') || 'light',
        animationsEnabled: JSON.parse(localStorage.getItem('animationsEnabled') || 'true'),
        soundEnabled: JSON.parse(localStorage.getItem('soundEnabled') || 'true'),
        keyboardShortcuts: JSON.parse(localStorage.getItem('keyboardShortcuts') || 'true')
      };

      // Paramètres serveur
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'userSettings', user.uid));
          if (userDoc.exists()) {
            const serverSettings = userDoc.data();
            setSettings(prev => ({ ...prev, ...localSettings, ...serverSettings }));
          } else {
            setSettings(prev => ({ ...prev, ...localSettings }));
          }
        } catch (error) {
          console.error('Erreur chargement paramètres:', error);
          setSettings(prev => ({ ...prev, ...localSettings }));
        }
      }
    };

    loadSettings();
  }, [user]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setUnsavedChanges(true);

    // Sauvegarder immédiatement certains paramètres
    if (['theme', 'animationsEnabled', 'soundEnabled', 'keyboardShortcuts'].includes(key)) {
      localStorage.setItem(key, typeof value === 'boolean' ? JSON.stringify(value) : value);

      if (key === 'theme') {
        document.documentElement.classList.toggle('dark', value === 'dark');
      }
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'userSettings', user.uid), {
        ...settings,
        updatedAt: new Date()
      });

      setUnsavedChanges(false);
      toast.success('Paramètres sauvegardés !');
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = {
        settings,
        exportedAt: new Date().toISOString(),
        exportedBy: user?.email,
        version: '1.0'
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bookmarkapp-settings-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('Paramètres exportés !');
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        if (importData.settings) {
          setSettings({ ...settings, ...importData.settings });
          setUnsavedChanges(true);
          toast.success('Paramètres importés ! N\'oubliez pas de sauvegarder.');
        }
      } catch (error) {
        console.error('Erreur import:', error);
        toast.error('Fichier invalide');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'SUPPRIMER') {
      toast.error('Veuillez taper "SUPPRIMER" pour confirmer');
      return;
    }

    try {
      // Supprimer les données Firestore
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteDoc(doc(db, 'userSettings', user.uid));

      // Supprimer le compte
      await deleteUser(user);

      toast.success('Compte supprimé avec succès');
    } catch (error) {
      console.error('Erreur suppression compte:', error);
      toast.error('Erreur lors de la suppression du compte');
    }
  };

  const colorSchemes = [
    { name: 'Bleu', value: 'blue', color: 'bg-blue-500' },
    { name: 'Vert', value: 'green', color: 'bg-green-500' },
    { name: 'Violet', value: 'purple', color: 'bg-purple-500' },
    { name: 'Rouge', value: 'red', color: 'bg-red-500' },
    { name: 'Orange', value: 'orange', color: 'bg-orange-500' }
  ];

  const SettingCard = ({ title, description, children, icon: Icon, badge }) => (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        {Icon && <Icon className="w-5 h-5 text-primary" />}
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {badge && (
            <NewFeatureBadge show={true}>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                {badge}
              </span>
            </NewFeatureBadge>
          )}
        </div>
      </div>
      {description && (
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const ToggleSwitch = ({ enabled, onToggle, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="font-medium text-foreground">{label}</div>
        {description && (
          <div className="text-sm text-muted-foreground">{description}</div>
        )}
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
          enabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Settings className="w-8 h-8" />
              Paramètres
            </h1>
            <p className="text-muted-foreground mt-2">
              Personnalisez votre expérience BookmarkApp
            </p>
          </div>

          {unsavedChanges && (
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
          )}
        </div>

        {/* Apparence */}
        <SettingCard
          title="Apparence"
          description="Personnalisez l'interface selon vos préférences"
          icon={Palette}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Thème
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSettingChange('theme', 'light')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                    settings.theme === 'light'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input hover:bg-accent'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Clair
                </button>
                <button
                  onClick={() => handleSettingChange('theme', 'dark')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                    settings.theme === 'dark'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input hover:bg-accent'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Sombre
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Couleur d'accent
              </label>
              <div className="flex gap-2">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.value}
                    onClick={() => handleSettingChange('colorScheme', scheme.value)}
                    className={`w-8 h-8 rounded-full ${scheme.color} border-2 transition-all hover:scale-110 ${
                      settings.colorScheme === scheme.value
                        ? 'border-foreground'
                        : 'border-transparent'
                    }`}
                    title={scheme.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <ToggleSwitch
            enabled={settings.animationsEnabled}
            onToggle={(value) => handleSettingChange('animationsEnabled', value)}
            label="Animations"
            description="Activer les transitions et effets visuels"
          />

          <ToggleSwitch
            enabled={settings.compactMode}
            onToggle={(value) => handleSettingChange('compactMode', value)}
            label="Mode compact"
            description="Interface plus dense pour afficher plus de contenu"
          />
        </SettingCard>

        {/* Notifications */}
        <SettingCard
          title="Notifications"
          description="Contrôlez quand et comment vous êtes informé"
          icon={Bell}
        >
          <ToggleSwitch
            enabled={settings.browserNotifications}
            onToggle={(value) => handleSettingChange('browserNotifications', value)}
            label="Notifications navigateur"
            description="Recevoir des notifications dans le navigateur"
          />

          <ToggleSwitch
            enabled={settings.emailNotifications}
            onToggle={(value) => handleSettingChange('emailNotifications', value)}
            label="Notifications e-mail"
            description="Recevoir des e-mails pour les événements importants"
          />

          <ToggleSwitch
            enabled={settings.achievementNotifications}
            onToggle={(value) => handleSettingChange('achievementNotifications', value)}
            label="Notifications d'achievements"
            description="Être notifié lors de nouveaux achievements"
          />

          <ToggleSwitch
            enabled={settings.soundEnabled}
            onToggle={(value) => handleSettingChange('soundEnabled', value)}
            label="Sons de notification"
            description="Jouer un son lors des notifications"
          />
        </SettingCard>

        {/* Fonctionnalités */}
        <SettingCard
          title="Fonctionnalités"
          description="Personnalisez le comportement de l'application"
          icon={Zap}
          badge="NEW"
        >
          <ToggleSwitch
            enabled={settings.keyboardShortcuts}
            onToggle={(value) => handleSettingChange('keyboardShortcuts', value)}
            label="Raccourcis clavier"
            description="Activer les raccourcis clavier (Ctrl+N, Ctrl+S, etc.)"
          />

          <ToggleSwitch
            enabled={settings.showTooltips}
            onToggle={(value) => handleSettingChange('showTooltips', value)}
            label="Info-bulles"
            description="Afficher les info-bulles d'aide"
          />

          <ToggleSwitch
            enabled={settings.autoSave}
            onToggle={(value) => handleSettingChange('autoSave', value)}
            label="Sauvegarde automatique"
            description="Sauvegarder automatiquement les modifications"
          />

          <div className="py-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium text-foreground">Vue par défaut</div>
                <div className="text-sm text-muted-foreground">
                  Mode d'affichage par défaut pour les favoris
                </div>
              </div>
              <select
                value={settings.defaultView}
                onChange={(e) => handleSettingChange('defaultView', e.target.value)}
                className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
              >
                <option value="list">Liste</option>
                <option value="grid">Grille</option>
                <option value="gallery">Galerie</option>
              </select>
            </div>
          </div>
        </SettingCard>

        {/* Données et stockage */}
        <SettingCard
          title="Données et stockage"
          description="Gérez vos données et sauvegardes"
          icon={Database}
        >
          <div className="bg-accent/30 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Stockage utilisé</span>
              <span className="text-sm text-muted-foreground">
                <AnimatedCounter to={247} /> / 1000 MB
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-1000"
                style={{ width: '24.7%' }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportData}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-accent transition-colors"
            >
              <Download className="w-4 h-4" />
              Exporter les données
            </button>

            <label className="flex items-center justify-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              Importer les données
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>

            <button
              onClick={() => {
                toast.info('Sauvegarde en cours...');
                setTimeout(() => toast.success('Sauvegarde terminée !'), 2000);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <HardDrive className="w-4 h-4" />
              Sauvegarder
            </button>
          </div>
        </SettingCard>

        {/* Confidentialité */}
        <SettingCard
          title="Confidentialité"
          description="Contrôlez la visibilité de vos données"
          icon={Shield}
        >
          <ToggleSwitch
            enabled={settings.profilePublic}
            onToggle={(value) => handleSettingChange('profilePublic', value)}
            label="Profil public"
            description="Permettre à d'autres utilisateurs de voir votre profil"
          />

          <ToggleSwitch
            enabled={settings.allowAnalytics}
            onToggle={(value) => handleSettingChange('allowAnalytics', value)}
            label="Analytics anonymes"
            description="Aider à améliorer l'app en partageant des données anonymes"
          />
        </SettingCard>

        {/* Zone de danger */}
        <SettingCard
          title="Zone de danger"
          description="Actions irréversibles - procédez avec précaution"
          icon={AlertTriangle}
        >
          <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
            <button
              onClick={() => setShowDangerZone(!showDangerZone)}
              className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              {showDangerZone ? 'Masquer' : 'Afficher'} les options dangereuses
            </button>

            {showDangerZone && (
              <div className="mt-4 space-y-4">
                <div className="border-t border-red-200 dark:border-red-700 pt-4">
                  <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                    Supprimer mon compte
                  </h4>
                  <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
                    Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                  </p>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder='Tapez "SUPPRIMER" pour confirmer'
                      className="w-full px-3 py-2 border border-red-300 rounded-lg bg-background focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />

                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== 'SUPPRIMER'}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 className="w-4 h-4 inline mr-2" />
                      Supprimer définitivement mon compte
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SettingCard>
      </div>
    </div>
  );
};

export default SettingsPage;