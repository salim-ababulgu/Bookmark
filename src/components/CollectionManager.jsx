import React, { useState } from 'react';
import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { toast } from 'sonner';
import {
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  Hash,
  Palette
} from 'lucide-react';

const CollectionManager = ({ collections, selectedCollection, onSelectCollection, userId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionColor, setNewCollectionColor] = useState('#3b82f6');
  const [loading, setLoading] = useState(false);

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'collections'), {
        name: newCollectionName.trim(),
        color: newCollectionColor,
        userId,
        createdAt: new Date()
      });

      toast.success('Collection créée !');
      setNewCollectionName('');
      setNewCollectionColor('#3b82f6');
      setShowAddForm(false);
    } catch (error) {
      console.error('Erreur création collection:', error);
      toast.error('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    if (!confirm('Supprimer cette collection ? Les favoris ne seront pas supprimés.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'collections', collectionId));
      toast.success('Collection supprimée');
      if (selectedCollection === collectionId) {
        onSelectCollection('all');
      }
    } catch (error) {
      console.error('Erreur suppression collection:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground">Collections</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="p-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {/* All Bookmarks */}
        <button
          onClick={() => onSelectCollection('all')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
            selectedCollection === 'all'
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <Hash className="h-4 w-4" />
          <span>Tous les favoris</span>
        </button>

        {/* Collections */}
        {collections.map((collection) => (
          <div key={collection.id} className="group relative">
            <button
              onClick={() => onSelectCollection(collection.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                selectedCollection === collection.id
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {selectedCollection === collection.id ? (
                <FolderOpen className="h-4 w-4" style={{ color: collection.color }} />
              ) : (
                <Folder className="h-4 w-4" style={{ color: collection.color }} />
              )}
              <span className="flex-1 truncate">{collection.name}</span>
            </button>
            <button
              onClick={() => handleDeleteCollection(collection.id)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Collection Form */}
      {showAddForm && (
        <div className="mt-4 pt-4 border-t border-border">
          <form onSubmit={handleCreateCollection} className="space-y-3">
            <div>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Nom de la collection"
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                maxLength={30}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Palette className="h-3 w-3" />
                Couleur
              </label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCollectionColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      newCollectionColor === color
                        ? 'border-foreground scale-110'
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewCollectionName('');
                  setNewCollectionColor('#3b82f6');
                }}
                className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !newCollectionName.trim()}
                className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CollectionManager;