import React, { useState, useRef } from 'react';
import { User, Camera, Upload } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { toast } from 'sonner';

const UserAvatar = ({ size = 'md', editable = false, className = '' }) => {
  const { user, userEmail, userName, updateUserProfile } = useSupabaseAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl'
  };

  // Générer l'URL Gravatar basée sur l'email
  const getGravatarUrl = (email, size = 80) => {
    const hash = btoa(email.toLowerCase().trim()).replace(/=/g, '');
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=404`;
  };

  // Obtenir les initiales de l'utilisateur
  const getInitials = () => {
    if (userName) {
      return userName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (userEmail) {
      return userEmail.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Obtenir l'URL de l'avatar personnalisé
  const getCustomAvatarUrl = () => {
    // Supposons que l'avatar personnalisé soit stocké dans le profil utilisateur
    return user?.user_metadata?.avatar_url || null;
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image doit faire moins de 2MB');
      return;
    }

    setIsUploading(true);

    try {
      // Convertir en base64 pour le stockage (solution simple)
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Image = e.target.result;

          // Mettre à jour le profil utilisateur avec l'avatar
          await updateUserProfile({
            avatar_url: base64Image
          });

          toast.success('Avatar mis à jour avec succès !');
        } catch (error) {
          console.error('Erreur upload avatar:', error);
          toast.error('Erreur lors de la mise à jour de l\'avatar');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors de l\'upload');
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const customAvatar = getCustomAvatarUrl();
  const gravatarUrl = getGravatarUrl(userEmail || '');

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizes[size]} rounded-full border-2 border-border/50 bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-medium overflow-hidden relative group`}>

        {/* Avatar personnalisé */}
        {customAvatar ? (
          <img
            src={customAvatar}
            alt="Avatar"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Avatar Gravatar */}
        {!customAvatar && (
          <img
            src={gravatarUrl}
            alt="Gravatar"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        )}

        {/* Initiales par défaut */}
        <div
          className="w-full h-full flex items-center justify-center text-white font-medium"
          style={{ display: customAvatar ? 'none' : 'flex' }}
        >
          {getInitials()}
        </div>

        {/* Overlay d'édition */}
        {editable && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
               onClick={() => fileInputRef.current?.click()}>
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-4 h-4 text-white" />
            )}
          </div>
        )}
      </div>

      {/* Input file caché */}
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
      )}

      {/* Badge d'upload si éditable */}
      {editable && (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-background hover:bg-primary/90 transition-colors disabled:opacity-50"
          title="Changer l'avatar"
        >
          {isUploading ? (
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-3 h-3" />
          )}
        </button>
      )}
    </div>
  );
};

export default UserAvatar;