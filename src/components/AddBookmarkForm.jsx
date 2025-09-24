import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../services/firebase';
import { toast } from 'sonner';
import { X, Link as LinkIcon, Type, Folder, Tag } from 'lucide-react';

const AddBookmarkForm = ({ collections, userId, onClose }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPageTitle = async (url) => {
    try {
      // Simple URL title extraction (in a real app, you'd use a backend service)
      const domain = new URL(url).hostname;
      return domain.replace('www.', '').split('.')[0];
    } catch {
      return 'Nouveau favori';
    }
  };

  const handleUrlChange = async (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    // Auto-generate title if empty and URL is valid
    if (newUrl && !title) {
      try {
        const generatedTitle = await fetchPageTitle(newUrl);
        setTitle(generatedTitle);
      } catch (error) {
        console.log('Could not fetch title');
      }
    }
  };

  // Gestion des tags
  const addTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag) && tags.length < 10) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) return;

    setLoading(true);

    try {
      // Ensure URL has protocol
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;

      await addDoc(collection(db, 'bookmarks'), {
        url: formattedUrl,
        title: title.trim(),
        collectionId: collectionId || null,
        tags: tags, // Ajouter les tags
        userId,
        createdAt: new Date()
      });

      toast.success('Favori ajouté !');
      onClose();
    } catch (error) {
      console.error('Erreur ajout favori:', error);
      toast.error('Erreur lors de l\'ajout du favori');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Ajouter un favori</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              URL *
            </label>
            <input
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Type className="h-4 w-4" />
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nom du favori"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Collection (optionnel)
            </label>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="">Aucune collection</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags (optionnel)
            </label>

            {/* Tags existants */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-primary/70 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Input pour ajouter des tags */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Ajouter un tag (Entrée ou virgule pour valider)"
                className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                disabled={tags.length >= 10}
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim() || tags.length >= 10}
                className="px-3 py-2 bg-primary/10 text-primary border border-primary/20 rounded-md hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                +
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Appuyez sur Entrée ou virgule pour ajouter un tag • Max 10 tags
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-input rounded-md bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !url.trim() || !title.trim()}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookmarkForm;