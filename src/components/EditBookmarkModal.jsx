import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { updateBookmark, getUserCollections } from '../services/supabaseDataService';
import { toast } from 'sonner';
import { X, Save, Link, FileText, Tag, Folder, Heart, BookOpen } from 'lucide-react';

const EditBookmarkModal = ({ isOpen, onClose, bookmark, onBookmarkUpdated }) => {
  const { user } = useSupabaseAuth();
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    tags: '',
    collection_id: '',
    is_favorite: false,
    is_read: false
  });
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (bookmark && isOpen) {
      setFormData({
        title: bookmark.title || '',
        url: bookmark.url || '',
        description: bookmark.description || '',
        tags: bookmark.tags ? bookmark.tags.join(', ') : '',
        collection_id: bookmark.collection_id || '',
        is_favorite: bookmark.is_favorite || false,
        is_read: bookmark.is_read || false
      });
    }
  }, [bookmark, isOpen]);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!user || !isOpen) return;

      try {
        const result = await getUserCollections(user.id);
        if (result.success) {
          setCollections(result.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des collections:', error);
      }
    };

    fetchCollections();
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'L\'URL est obligatoire';
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'URL non valide';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    if (!bookmark?.id) {
      toast.error('Impossible de mettre à jour ce favori');
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        title: formData.title.trim(),
        url: formData.url.trim(),
        description: formData.description.trim(),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        collection_id: formData.collection_id || null,
        is_favorite: formData.is_favorite,
        is_read: formData.is_read
      };

      const result = await updateBookmark(bookmark.id, updateData, user.id);

      if (result.success) {
        toast.success('Favori mis à jour avec succès !');
        onBookmarkUpdated?.(result.data);
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du favori:', error);
      toast.error('Erreur lors de la mise à jour du favori');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 pb-20">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl border border-border max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Modifier le favori
              </h2>
              <p className="text-sm text-muted-foreground">
                Modifiez les informations de votre favori
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors focus-ring"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* URL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Link className="h-4 w-4" />
              URL *
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://exemple.com"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus-ring transition-colors ${
                errors.url ? 'border-destructive' : 'border-input'
              }`}
              required
              disabled={isLoading}
            />
            {errors.url && (
              <p className="text-sm text-destructive mt-1">{errors.url}</p>
            )}
          </div>

          {/* Titre */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <FileText className="h-4 w-4" />
              Titre *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Titre du favori"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus-ring transition-colors ${
                errors.title ? 'border-destructive' : 'border-input'
              }`}
              required
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <FileText className="h-4 w-4" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description du favori (optionnel)"
              rows="4"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus-ring resize-none transition-colors"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Collection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Folder className="h-4 w-4" />
                Collection
              </label>
              <select
                name="collection_id"
                value={formData.collection_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus-ring transition-colors"
                disabled={isLoading}
              >
                <option value="">Aucune collection</option>
                {collections.map(collection => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Tag className="h-4 w-4" />
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="tag1, tag2, tag3"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus-ring transition-colors"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Séparez les tags par des virgules
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 p-4 bg-accent/30 rounded-lg">
            <h3 className="text-sm font-medium text-foreground">Options</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_favorite"
                  checked={formData.is_favorite}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="rounded border-input focus:ring-primary focus:border-primary"
                />
                <div className="flex items-center gap-2">
                  <Heart className={`h-4 w-4 ${formData.is_favorite ? 'text-red-500 fill-current' : 'text-muted-foreground'}`} />
                  <span className="text-sm text-foreground">Marquer comme favori</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_read"
                  checked={formData.is_read}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="rounded border-input focus:ring-primary focus:border-primary"
                />
                <div className="flex items-center gap-2">
                  <BookOpen className={`h-4 w-4 ${formData.is_read ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <span className="text-sm text-foreground">Marquer comme lu</span>
                </div>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border bg-accent/10">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-foreground border border-input rounded-lg hover:bg-accent transition-colors disabled:opacity-50 focus-ring"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 focus-ring"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current/20 border-t-current rounded-full animate-spin"></div>
                Mise à jour...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBookmarkModal;