import React, { useState } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useSecureValidation, useSecureRateLimit } from '../contexts/SecurityContext';
import { addBookmark, getUserBookmarks } from '../services/supabaseDataService';
import useToast from '../hooks/useToast.jsx';
import { useFeedback, showAdvancedToast } from './feedback/AdvancedFeedbackSystem';
import { Plus, Globe, Loader } from 'lucide-react';
import BaseModal from './BaseModal';
import AnimatedButton from './ui/AnimatedButton';

const AddBookmarkModal = ({ isOpen, onClose, onBookmarkAdded }) => {
  const { user } = useSupabaseAuth();
  const { validateURL, validateText, sanitize } = useSecureValidation();
  const { checkLimit } = useSecureRateLimit('bookmark_creation');
  const toast = useToast();
  const { showLoading, hideLoading, showFloatingFeedback } = useFeedback();
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    tags: '',
    favicon: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'url':
        if (!value.trim()) {
          newErrors.url = 'L\'URL est obligatoire';
        } else {
          const urlValidation = validateURL(value);
          if (!urlValidation.valid) {
            newErrors.url = urlValidation.errors[0] || 'L\'URL n\'est pas valide';
          } else {
            delete newErrors.url;
          }
        }
        break;
      case 'title':
        if (!value.trim()) {
          newErrors.title = 'Le titre est obligatoire';
        } else {
          const titleValidation = validateText(value, { minLength: 3, maxLength: 200 });
          if (!titleValidation.valid) {
            newErrors.title = titleValidation.errors[0] || 'Le titre n\'est pas valide';
          } else {
            delete newErrors.title;
          }
        }
        break;
      case 'description':
        if (value.trim()) {
          const descValidation = validateText(value, { maxLength: 1000 });
          if (!descValidation.valid) {
            newErrors.description = descValidation.errors[0] || 'La description n\'est pas valide';
          } else {
            delete newErrors.description;
          }
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    // Sanitize input based on field type
    let sanitizedValue = value;
    if (name === 'url') {
      sanitizedValue = sanitize.url(value);
    } else if (name === 'title' || name === 'description') {
      sanitizedValue = sanitize.text(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Valider le champ en temps réel si déjà touché
    if (touched[name]) {
      validateField(name, sanitizedValue);
    }

    // Auto-fetch title et favicon quand l'URL change
    if (name === 'url' && sanitizedValue) {
      const urlValidation = validateURL(sanitizedValue);
      if (urlValidation.valid) {
        await fetchTitleAndFavicon(urlValidation.sanitized);
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const fetchTitleAndFavicon = async (url) => {
    if (formData.title.trim()) return; // Ne pas écraser un titre déjà saisi

    setIsFetchingTitle(true);
    try {
      // Utiliser un proxy CORS ou un service pour récupérer le titre
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (data.contents) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        const title = doc.querySelector('title')?.textContent || '';

        if (title) {
          setFormData(prev => ({
            ...prev,
            title: title.trim(),
            favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`
          }));
        }
      }
    } catch (error) {
      console.log('Impossible de récupérer le titre automatiquement');
      // Fallback: utiliser juste le favicon de Google
      try {
        setFormData(prev => ({
          ...prev,
          favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`
        }));
      } catch (e) {
        // Ignore si l'URL n'est pas valide
      }
    } finally {
      setIsFetchingTitle(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifier le rate limiting
    const rateLimitCheck = checkLimit();
    if (!rateLimitCheck.allowed) {
      showAdvancedToast('warning', 'Trop de créations de favoris', {
        description: 'Veuillez patienter quelques instants avant de créer un nouveau favori.',
        duration: 5000
      });
      return;
    }

    // Marquer tous les champs comme touchés
    setTouched({ url: true, title: true, description: true });

    // Valider tous les champs
    const isUrlValid = validateField('url', formData.url);
    const isTitleValid = validateField('title', formData.title);
    const isDescValid = validateField('description', formData.description);

    if (!isUrlValid || !isTitleValid || !isDescValid) {
      showAdvancedToast('error', 'Erreurs dans le formulaire', {
        description: 'Veuillez corriger les erreurs avant de continuer.',
        duration: 3000
      });
      return;
    }

    setIsLoading(true);
    showLoading('Ajout du favori en cours...');

    try {
      // Vérifier si le favori existe déjà
      const existingBookmarksResult = await getUserBookmarks(user.id);
      if (existingBookmarksResult.success && existingBookmarksResult.data) {
        const existingBookmark = existingBookmarksResult.data.find(
          (b) => b.url === formData.url.trim()
        );
        if (existingBookmark) {
          showAdvancedToast('warning', 'Favori déjà existant', {
            description: 'Cette URL est déjà dans vos favoris.',
            duration: 4000,
            action: {
              label: 'Voir le favori',
              onClick: () => {
                onClose();
                // Ici on pourrait naviguer vers le favori existant
              }
            }
          });
          setIsLoading(false);
          hideLoading();
          return;
        }
      }

      // Sanitiser et valider toutes les données avant de les envoyer
      const urlValidation = validateURL(formData.url);
      const titleValidation = validateText(formData.title);
      const descValidation = validateText(formData.description);

      const bookmarkData = {
        title: titleValidation.sanitized || sanitize.text(formData.title.trim()),
        url: urlValidation.sanitized || sanitize.url(formData.url.trim()),
        description: descValidation.sanitized || sanitize.text(formData.description.trim()),
        tags: formData.tags ? formData.tags.split(',').map(tag => sanitize.text(tag.trim())).filter(tag => tag) : [],
        favicon: formData.favicon || `https://www.google.com/s2/favicons?domain=${new URL(urlValidation.sanitized || formData.url).hostname}&sz=64`,
        is_favorite: false,
        is_read: false
      };

      const result = await addBookmark(bookmarkData, user.id);

      if (result.success) {
        hideLoading();
        showFloatingFeedback('bookmark', 'Favori ajouté avec succès !', 2500);

        showAdvancedToast('bookmark', 'Favori ajouté !', {
          description: `${result.data.title} a été ajouté à vos favoris.`,
          duration: 4000,
          action: {
            label: 'Voir',
            onClick: () => {
              // Naviguer vers le favori dans la liste
              onBookmarkAdded?.(result.data);
            }
          }
        });

        setFormData({ title: '', url: '', description: '', tags: '', favicon: '' });
        onBookmarkAdded?.(result.data);
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du favori:', error);
      hideLoading();
      showAdvancedToast('error', 'Erreur lors de l\'ajout', {
        description: 'Impossible d\'ajouter le favori. Veuillez réessayer.',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ title: '', url: '', description: '', tags: '', favicon: '' });
      setErrors({});
      setTouched({});
      onClose();
    }
  };

  const footerContent = (
    <div className="flex gap-3">
      <AnimatedButton
        variant="outline"
        onClick={handleClose}
        disabled={isLoading}
        className="flex-1"
      >
        Annuler
      </AnimatedButton>
      <AnimatedButton
        variant="primary"
        type="submit"
        form="add-bookmark-form"
        disabled={isLoading}
        loading={isLoading}
        icon={<Plus className="w-4 h-4" />}
        className="flex-1"
      >
        {isLoading ? 'Ajout...' : 'Ajouter'}
      </AnimatedButton>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Ajouter un favori"
      subtitle="Ajoutez une nouvelle page à vos favoris"
      icon={<Plus />}
      footerContent={footerContent}
      size="md"
    >
      <form id="add-bookmark-form" onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              URL *
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="https://exemple.com"
                className={`w-full pl-10 pr-3 py-3 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:outline-none transition-all duration-200 ${
                  errors.url
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-input focus:border-primary focus:ring-primary/20'
                }`}
                required
                disabled={isLoading || isFetchingTitle}
              />
              {errors.url && (
                <div className="absolute top-full left-0 mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.url}
                </div>
              )}
              {isFetchingTitle && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader className="w-4 h-4 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Titre *
            </label>
            <div className="flex items-center gap-3">
              {formData.favicon && (
                <img
                  src={formData.favicon}
                  alt="Favicon"
                  className="w-6 h-6 rounded"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Titre du favori"
                className={`flex-1 px-3 py-3 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:outline-none transition-all duration-200 ${
                  errors.title
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-input focus:border-primary focus:ring-primary/20'
                }`}
                required
                disabled={isLoading || isFetchingTitle}
              />
            </div>
            {errors.title && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                {errors.title}
              </div>
            )}
            {isFetchingTitle && (
              <p className="text-xs text-primary mt-1 flex items-center gap-1">
                <Loader className="w-3 h-3 animate-spin" />
                Récupération du titre...
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description du favori (optionnel)"
              rows="3"
              className="w-full px-3 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all duration-200 resize-none"
              disabled={isLoading || isFetchingTitle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="tag1, tag2, tag3"
              className="w-full px-3 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all duration-200"
              disabled={isLoading || isFetchingTitle}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Séparez les tags par des virgules
            </p>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddBookmarkModal;