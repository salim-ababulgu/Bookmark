// ProfilePage - Version simplifiée post-migration Supabase
import React, { useState } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { updateUserProfile } from '../services/supabaseAuthService';
import { toast } from 'sonner';
import { User, Mail, Edit2 } from 'lucide-react';

const ProfilePage = () => {
  const { user, userEmail, userName, userPhotoURL } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userName || '');

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      toast.error('Veuillez saisir un nom d\'affichage');
      return;
    }

    setLoading(true);

    try {
      const result = await updateUserProfile({
        display_name: displayName.trim(),
        full_name: displayName.trim()
      });

      if (result.success) {
        toast.success('Profil mis à jour !');
        setEditing(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Chargement...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos informations personnelles
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-lg border overflow-hidden">
          {/* Header with avatar */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {userPhotoURL ? (
                  <img src={userPhotoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">
                  {userName || 'Utilisateur'}
                </h2>
                <p className="text-white/80">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nom d'affichage
                </label>
                {editing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Votre nom d'affichage"
                    />
                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                    >
                      {loading ? '...' : 'Sauvegarder'}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setDisplayName(userName || '');
                      }}
                      className="px-4 py-2 border rounded-md hover:bg-muted"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                    <span className="text-foreground">
                      {userName || 'Non défini'}
                    </span>
                    <button
                      onClick={() => setEditing(true)}
                      className="p-1 hover:bg-background rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/50">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{userEmail}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    (Non modifiable)
                  </span>
                </div>
              </div>

              {/* Account Info */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Informations du compte
                </label>
                <div className="p-4 border rounded-md bg-muted/50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">ID Utilisateur:</span>
                      <p className="text-muted-foreground font-mono text-xs mt-1">
                        {user.id}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Fournisseur:</span>
                      <p className="text-muted-foreground mt-1">
                        Supabase Auth
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Email vérifié:</span>
                      <p className={`mt-1 ${user.email_confirmed_at ? 'text-green-600' : 'text-orange-600'}`}>
                        {user.email_confirmed_at ? '✅ Oui' : '⚠️ Non'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Créé le:</span>
                      <p className="text-muted-foreground mt-1">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;