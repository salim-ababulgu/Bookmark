import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updateProfile, updatePassword, updateEmail } from 'firebase/auth';
import { db } from '../services/firebase';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Key,
  Bookmark,
  BarChart3,
  Award,
  Target,
  TrendingUp,
  Clock,
  Globe,
  Tag as TagIcon,
  Folder,
  Eye,
  Heart
} from 'lucide-react';
import { AnimatedCounter, NewFeatureBadge } from '../components/AnimatedComponents';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: '',
    website: '',
    location: '',
    joinedDate: user?.metadata?.creationTime || new Date(),
    preferences: {
      theme: 'light',
      language: 'fr',
      notifications: true
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [stats, setStats] = useState({
    totalBookmarks: 0,
    totalCollections: 0,
    totalTags: 0,
    joinedDays: 0,
    weeklyActivity: 0,
    favoriteCategories: []
  });

  // Charger le profil utilisateur depuis Firestore
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(prev => ({
            ...prev,
            ...userData,
            email: user.email,
            displayName: user.displayName || userData.displayName || ''
          }));
        }
      } catch (error) {
        console.error('Erreur chargement profil:', error);
      }
    };

    loadUserProfile();
  }, [user]);

  // Calculer les statistiques
  useEffect(() => {
    const calculateStats = () => {
      if (!user) return;

      const joinedDate = new Date(user.metadata?.creationTime || Date.now());
      const daysDiff = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));

      setStats({
        totalBookmarks: 47, // En production, récupérer depuis Firestore
        totalCollections: 8,
        totalTags: 23,
        joinedDays: daysDiff,
        weeklyActivity: 12,
        favoriteCategories: ['Tech', 'Design', 'Articles']
      });
    };

    calculateStats();
  }, [user]);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm({});
    } else {
      setEditForm({ ...userProfile });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      // Mise à jour du profil Firebase Auth
      await updateProfile(user, {
        displayName: editForm.displayName
      });

      // Mise à jour dans Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: editForm.displayName,
        bio: editForm.bio || '',
        website: editForm.website || '',
        location: editForm.location || '',
        updatedAt: new Date()
      });

      setUserProfile({ ...userProfile, ...editForm });
      setIsEditing(false);
      toast.success('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await updatePassword(user, passwordForm.newPassword);
      toast.success('Mot de passe mis à jour avec succès !');
      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      toast.error('Erreur lors du changement de mot de passe');
    }
  };

  const generateAvatar = (name) => {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return initials;
  };

  const getAchievements = () => {
    const achievements = [];

    if (stats.totalBookmarks >= 10) {
      achievements.push({
        icon: '🎯',
        title: 'Collectionneur',
        description: '10+ favoris sauvegardés'
      });
    }

    if (stats.totalBookmarks >= 50) {
      achievements.push({
        icon: '🚀',
        title: 'Power User',
        description: '50+ favoris organisés'
      });
    }

    if (stats.totalCollections >= 5) {
      achievements.push({
        icon: '📚',
        title: 'Organisateur',
        description: '5+ collections créées'
      });
    }

    if (stats.joinedDays >= 30) {
      achievements.push({
        icon: '🏆',
        title: 'Membre fidèle',
        description: '30+ jours d\'activité'
      });
    }

    return achievements;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header avec avatar et informations principales */}
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-primary">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  generateAvatar(userProfile.displayName || user?.email || 'User')
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Informations utilisateur */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {userProfile.displayName || 'Utilisateur'}
                  </h1>
                  <NewFeatureBadge show={stats.totalBookmarks >= 50}>
                    <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                      Power User
                    </div>
                  </NewFeatureBadge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{userProfile.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Membre depuis {formatDate(userProfile.joinedDate)}</span>
                  </div>
                </div>

                {userProfile.bio && (
                  <p className="text-muted-foreground mt-3 text-sm sm:text-base">
                    {userProfile.bio}
                  </p>
                )}

                {userProfile.location && (
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">{userProfile.location}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Sauvegarder
                    </button>
                    <button
                      onClick={handleEditToggle}
                      className="flex items-center gap-2 border border-input px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditToggle}
                    className="flex items-center gap-2 border border-input px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Modifier le profil
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Formulaire d'édition */}
          {isEditing && (
            <div className="mt-8 pt-6 border-t border-border space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nom d'affichage
                  </label>
                  <input
                    type="text"
                    value={editForm.displayName || ''}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={editForm.location || ''}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                    placeholder="Votre ville, pays"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bio
                </label>
                <textarea
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                  placeholder="Parlez-nous de vous..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Site web
                </label>
                <input
                  type="url"
                  value={editForm.website || ''}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                  placeholder="https://votre-site.com"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Statistiques */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Statistiques</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="text-2xl font-bold text-primary mb-1">
                  <AnimatedCounter to={stats.totalBookmarks} />
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Bookmark className="w-3 h-3" />
                  Favoris
                </div>
              </div>

              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  <AnimatedCounter to={stats.totalCollections} />
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Folder className="w-3 h-3" />
                  Collections
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  <AnimatedCounter to={stats.totalTags} />
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <TagIcon className="w-3 h-3" />
                  Tags
                </div>
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  <AnimatedCounter to={stats.joinedDays} />
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  Jours
                </div>
              </div>
            </div>

            {/* Activité récente */}
            <div className="space-y-3">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Activité récente
              </h3>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 21 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-3 rounded-sm ${
                      Math.random() > 0.7
                        ? 'bg-primary'
                        : Math.random() > 0.4
                        ? 'bg-primary/40'
                        : 'bg-accent/30'
                    }`}
                    title={`${Math.floor(Math.random() * 5)} favoris ajoutés`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Activité des 3 dernières semaines
              </p>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Achievements</h2>
            </div>

            <div className="space-y-3">
              {getAchievements().map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <div className="font-medium text-foreground text-sm">
                      {achievement.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {achievement.description}
                    </div>
                  </div>
                </div>
              ))}

              {getAchievements().length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Continuez à utiliser l'app pour débloquer des achievements !</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sécurité */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Sécurité</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium text-foreground">Mot de passe</div>
                  <div className="text-sm text-muted-foreground">
                    Dernière modification: Il y a plus de 30 jours
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                Modifier
              </button>
            </div>

            {/* Formulaire changement mot de passe */}
            {showPasswordForm && (
              <div className="p-4 border border-border rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                    placeholder="Entrez le nouveau mot de passe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                    placeholder="Confirmez le nouveau mot de passe"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handlePasswordChange}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    Changer le mot de passe
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="border border-input px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium text-foreground">Adresse e-mail</div>
                  <div className="text-sm text-muted-foreground">{user?.email}</div>
                </div>
              </div>
              <span className="text-green-600 text-sm font-medium">Vérifiée</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;