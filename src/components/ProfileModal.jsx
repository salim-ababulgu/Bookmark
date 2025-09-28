import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Shield, Edit3, Save, X } from 'lucide-react';
import BaseModal from './BaseModal';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../services/supabase';
import { toast } from 'sonner';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user } = useSupabaseAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    email: '',
    full_name: '',
    avatar_url: '',
    created_at: ''
  });
  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (user && isOpen) {
      setProfileData({
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        created_at: user.created_at || ''
      });
      setFormData({
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || ''
      });
    }
  }, [user, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          avatar_url: formData.avatar_url
        }
      });

      if (error) throw error;

      setProfileData(prev => ({
        ...prev,
        full_name: formData.full_name,
        avatar_url: formData.avatar_url
      }));

      setIsEditing(false);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profileData.full_name,
      avatar_url: profileData.avatar_url
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(dateString));
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
      {isEditing ? (
        <>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2.5 text-muted-foreground border border-border/50 rounded-lg hover:bg-accent/50 transition-all duration-200 disabled:opacity-50 focus:ring-2 focus:ring-primary/20 focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 focus:ring-2 focus:ring-primary/20 focus:outline-none"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-primary/20 focus:outline-none"
        >
          <Edit3 className="w-4 h-4" />
          Modifier
        </button>
      )}
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Mon Profil"
      subtitle="Gérez vos informations personnelles"
      icon={<User />}
      footerContent={footerContent}
      size="md"
    >
      <div className="p-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
            {profileData.avatar_url ? (
              <img
                src={profileData.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              {profileData.full_name || 'Nom non défini'}
            </h3>
            <p className="text-sm text-muted-foreground">{profileData.email}</p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nom complet
            </label>
            {isEditing ? (
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Votre nom complet"
                className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all duration-200"
                disabled={isLoading}
              />
            ) : (
              <div className="px-3 py-2.5 bg-muted/30 rounded-lg text-foreground">
                {profileData.full_name || 'Non défini'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <div className="px-3 py-2.5 bg-muted/30 rounded-lg text-muted-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {profileData.email}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              L'email ne peut pas être modifié
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              URL de l'avatar
            </label>
            {isEditing ? (
              <input
                type="url"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleInputChange}
                placeholder="https://exemple.com/avatar.jpg"
                className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all duration-200"
                disabled={isLoading}
              />
            ) : (
              <div className="px-3 py-2.5 bg-muted/30 rounded-lg text-foreground">
                {profileData.avatar_url || 'Aucun avatar défini'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Membre depuis
            </label>
            <div className="px-3 py-2.5 bg-muted/30 rounded-lg text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(profileData.created_at)}
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Informations du compte
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-semibold text-primary">
                {user?.app_metadata?.provider || 'Email'}
              </div>
              <div className="text-xs text-muted-foreground">Méthode de connexion</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-semibold text-green-600">
                {user?.email_confirmed_at ? 'Vérifié' : 'Non vérifié'}
              </div>
              <div className="text-xs text-muted-foreground">État du compte</div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default ProfileModal;