import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { addCollection, updateBookmark, getUserBookmarks } from '../services/supabaseDataService';
import { toast } from 'sonner';
import { X, Save, Folder, Palette, FileText, Plus } from 'lucide-react';

const COLLECTION_COLORS = [
  { name: 'Bleu', value: 'blue', class: 'bg-blue-500' },
  { name: 'Rouge', value: 'red', class: 'bg-red-500' },
  { name: 'Vert', value: 'green', class: 'bg-green-500' },
  { name: 'Violet', value: 'purple', class: 'bg-purple-500' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { name: 'Jaune', value: 'yellow', class: 'bg-yellow-500' },
  { name: 'Rose', value: 'pink', class: 'bg-pink-500' },
  { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
  { name: 'Teal', value: 'teal', class: 'bg-teal-500' },
  { name: 'Gris', value: 'gray', class: 'bg-gray-500' }
];

const CollectionModal = ({
  isOpen,
  onClose,
  collection = null, // Si null = mode création, sinon mode édition
  onCollectionSaved,
  selectedBookmarks = [] // Favoris à ajouter automatiquement à la nouvelle collection
}) => {
  const { user } = useSupabaseAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditMode = collection !== null;

  useEffect(() => {
    if (collection && isOpen) {
      setFormData({
        name: collection.name || '',
        description: collection.description || '',
        color: collection.color || 'blue'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: 'blue'
      });
    }
    setErrors({});
  }, [collection, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de la collection est obligatoire';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleColorSelect = (color) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const assignBookmarksToCollection = async (collectionId, bookmarkIds) => {
    if (!bookmarkIds.length) return;

    const promises = bookmarkIds.map(bookmarkId =>
      updateBookmark(bookmarkId, { collection_id: collectionId }, user.id)
    );

    try {
      await Promise.all(promises);
      toast.success(`${bookmarkIds.length} favori(s) ajouté(s) à la collection !`);
    } catch (error) {
      console.error('Erreur lors de l\'assignation des favoris:', error);
      toast.error('Erreur lors de l\'assignation des favoris à la collection');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsLoading(true);

    try {
      const collectionData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color
      };

      let result;

      if (isEditMode) {
        // Mode édition - À implémenter dans le service
        toast.info('Modification de collections à implémenter');
        onClose();
        return;
      } else {
        // Mode création
        result = await addCollection(collectionData, user.id);
      }

      if (result.success) {
        const successMessage = isEditMode
          ? 'Collection mise à jour avec succès !'
          : 'Collection créée avec succès !';

        toast.success(successMessage);

        // Si on a des favoris sélectionnés et qu'on crée une nouvelle collection,
        // les assigner à cette collection
        if (!isEditMode && selectedBookmarks.length > 0) {
          await assignBookmarksToCollection(result.data.id, selectedBookmarks);
        }

        onCollectionSaved?.(result.data);
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la collection:', error);
      const errorMessage = isEditMode
        ? 'Erreur lors de la mise à jour de la collection'
        : 'Erreur lors de la création de la collection';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setErrors({});
      setFormData({ name: '', description: '', color: 'blue' });
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectedColor = COLLECTION_COLORS.find(color => color.value === formData.color);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 pb-20">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-lg border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${selectedColor?.class || 'bg-blue-500'} rounded-lg`}>
              <Folder className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {isEditMode ? 'Modifier la collection' : 'Créer une collection'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? 'Modifiez les informations de votre collection'
                  : 'Organisez vos favoris dans une nouvelle collection'
                }
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom de la collection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Folder className="h-4 w-4" />
              Nom de la collection *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ex: Développement, Recettes, Inspiration..."
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus-ring transition-colors ${
                errors.name ? 'border-destructive' : 'border-input'
              }`}
              required
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name}</p>
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
              placeholder="Description optionnelle de la collection..."
              rows="3"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus-ring resize-none transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Couleur */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
              <Palette className="h-4 w-4" />
              Couleur de la collection
            </label>
            <div className="grid grid-cols-5 gap-3">
              {COLLECTION_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleColorSelect(color.value)}
                  disabled={isLoading}
                  className={`relative p-3 rounded-lg ${color.class} hover:scale-105 transition-all duration-200 focus-ring ${
                    formData.color === color.value ? 'ring-2 ring-offset-2 ring-foreground scale-105' : ''
                  }`}
                  title={color.name}
                >
                  {formData.color === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Couleur sélectionnée: {selectedColor?.name}
            </p>
          </div>

          {/* Info sur les favoris sélectionnés */}
          {!isEditMode && selectedBookmarks.length > 0 && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary font-medium">
                {selectedBookmarks.length} favori(s) seront ajoutés à cette collection
              </p>
            </div>
          )}
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
                {isEditMode ? 'Mise à jour...' : 'Création...'}
              </>
            ) : (
              <>
                {isEditMode ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {isEditMode ? 'Enregistrer' : 'Créer la collection'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionModal;