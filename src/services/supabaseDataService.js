import { supabase } from './supabase';

// Service de données pour remplacer Firebase Firestore par Supabase

// Collections/Tables
export const TABLES = {
  BOOKMARKS: 'bookmarks',
  COLLECTIONS: 'collections',
  USER_SETTINGS: 'user_settings'
};

// Utilitaires pour la gestion d'erreur
const handleError = (error, operation) => {
  console.error(`🚀 SupabaseData: Erreur ${operation}:`, error);
  return {
    success: false,
    error: error.message || `Erreur lors de ${operation}`,
    data: null
  };
};

const handleSuccess = (data, operation) => {
  console.log(`🚀 SupabaseData: Succès ${operation}`);
  return {
    success: true,
    error: null,
    data
  };
};

// === BOOKMARKS ===

// Ajouter un bookmark
export const addBookmark = async (bookmark, userId) => {
  try {
    const bookmarkWithUser = {
      ...bookmark,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLES.BOOKMARKS)
      .insert([bookmarkWithUser])
      .select()
      .single();

    if (error) throw error;
    return handleSuccess(data, 'ajout bookmark');
  } catch (error) {
    return handleError(error, 'ajout bookmark');
  }
};

// Récupérer les bookmarks d'un utilisateur
export const getUserBookmarks = async (userId) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.BOOKMARKS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return handleSuccess(data || [], 'récupération bookmarks');
  } catch (error) {
    return handleError(error, 'récupération bookmarks');
  }
};

// Supprimer un bookmark
export const deleteBookmark = async (bookmarkId, userId) => {
  try {
    const { error } = await supabase
      .from(TABLES.BOOKMARKS)
      .delete()
      .eq('id', bookmarkId)
      .eq('user_id', userId);

    if (error) throw error;
    return handleSuccess(null, 'suppression bookmark');
  } catch (error) {
    return handleError(error, 'suppression bookmark');
  }
};

// Mettre à jour un bookmark
export const updateBookmark = async (bookmarkId, updates, userId) => {
  try {
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLES.BOOKMARKS)
      .update(updatesWithTimestamp)
      .eq('id', bookmarkId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return handleSuccess(data, 'mise à jour bookmark');
  } catch (error) {
    return handleError(error, 'mise à jour bookmark');
  }
};

// === COLLECTIONS ===

// Ajouter une collection
export const addCollection = async (collection, userId) => {
  try {
    const collectionWithUser = {
      ...collection,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLES.COLLECTIONS)
      .insert([collectionWithUser])
      .select()
      .single();

    if (error) throw error;
    return handleSuccess(data, 'ajout collection');
  } catch (error) {
    return handleError(error, 'ajout collection');
  }
};

// Récupérer les collections d'un utilisateur
export const getUserCollections = async (userId) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.COLLECTIONS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return handleSuccess(data || [], 'récupération collections');
  } catch (error) {
    return handleError(error, 'récupération collections');
  }
};

// Mettre à jour une collection
export const updateCollection = async (collectionId, updates, userId) => {
  try {
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLES.COLLECTIONS)
      .update(updatesWithTimestamp)
      .eq('id', collectionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return handleSuccess(data, 'mise à jour collection');
  } catch (error) {
    return handleError(error, 'mise à jour collection');
  }
};

// Supprimer une collection
export const deleteCollection = async (collectionId, userId) => {
  try {
    // D'abord, retirer l'assignation de la collection des favoris
    const { error: updateError } = await supabase
      .from(TABLES.BOOKMARKS)
      .update({ collection_id: null })
      .eq('collection_id', collectionId)
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Ensuite, supprimer la collection
    const { error } = await supabase
      .from(TABLES.COLLECTIONS)
      .delete()
      .eq('id', collectionId)
      .eq('user_id', userId);

    if (error) throw error;
    return handleSuccess(null, 'suppression collection');
  } catch (error) {
    return handleError(error, 'suppression collection');
  }
};

// === USER SETTINGS ===

// Récupérer les paramètres utilisateur
export const getUserSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.USER_SETTINGS)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }

    return handleSuccess(data || {}, 'récupération settings');
  } catch (error) {
    return handleError(error, 'récupération settings');
  }
};

// Mettre à jour les paramètres utilisateur
export const updateUserSettings = async (userId, settings) => {
  try {
    const settingsWithTimestamp = {
      user_id: userId,
      ...settings,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLES.USER_SETTINGS)
      .upsert([settingsWithTimestamp])
      .select()
      .single();

    if (error) throw error;
    return handleSuccess(data, 'mise à jour settings');
  } catch (error) {
    return handleError(error, 'mise à jour settings');
  }
};

// === REAL-TIME SUBSCRIPTIONS ===

// Écouter les changements de bookmarks en temps réel
export const subscribeToUserBookmarks = (userId, callback) => {
  const channel = supabase
    .channel(`bookmarks_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.BOOKMARKS,
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('🚀 SupabaseData: Changement bookmarks:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Écouter les changements de collections en temps réel
export const subscribeToUserCollections = (userId, callback) => {
  const channel = supabase
    .channel(`collections_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.COLLECTIONS,
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('🚀 SupabaseData: Changement collections:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// === UTILITIES ===

// Vérifier si les tables existent
export const checkDatabaseSetup = async () => {
  try {
    console.log('🔍 Vérification de la base de données...');

    // Test de chaque table
    const tables = [
      { name: TABLES.BOOKMARKS, displayName: 'Bookmarks' },
      { name: TABLES.COLLECTIONS, displayName: 'Collections' },
      { name: TABLES.USER_SETTINGS, displayName: 'User Settings' }
    ];

    const results = {};

    for (const table of tables) {
      try {
        const { data, error, status } = await supabase
          .from(table.name)
          .select('*')
          .limit(1);

        if (error) {
          console.error(`❌ Table ${table.displayName} (${table.name}):`, error.message);
          results[table.name] = {
            exists: false,
            error: error.message,
            status: status || 'unknown'
          };
        } else {
          console.log(`✅ Table ${table.displayName} (${table.name}): OK`);
          results[table.name] = {
            exists: true,
            error: null,
            status
          };
        }
      } catch (err) {
        console.error(`❌ Erreur test ${table.displayName}:`, err);
        results[table.name] = {
          exists: false,
          error: err.message,
          status: 'error'
        };
      }
    }

    return handleSuccess(results, 'vérification database');
  } catch (error) {
    return handleError(error, 'vérification database');
  }
};

// Afficher les instructions de setup
export const showSetupInstructions = () => {
  console.log(`
🚀 === INSTRUCTIONS SETUP SUPABASE ===

❌ ERREUR 404: Les tables n'existent pas dans votre base de données Supabase

📋 ÉTAPES À SUIVRE:

1️⃣ Ouvrez votre dashboard Supabase: https://supabase.com/dashboard
2️⃣ Allez dans "SQL Editor"
3️⃣ Exécutez le script dans: database_setup.sql
4️⃣ Rechargez l'application

📊 TABLES À CRÉER:
• ${TABLES.BOOKMARKS} - Stockage des favoris
• ${TABLES.COLLECTIONS} - Groupes de favoris
• ${TABLES.USER_SETTINGS} - Préférences utilisateur

⚡ FONCTIONNALITÉS INCLUSES:
• Row Level Security (RLS) activé
• Politiques de sécurité par utilisateur
• Index pour les performances
• Triggers pour updated_at automatique

🔧 En cas de problème:
• Vérifiez que RLS est activé
• Vérifiez que les politiques sont créées
• Vérifiez vos variables d'environnement Supabase
`);
};

// Fonction utilitaire pour créer les tables (à exécuter une fois)
export const setupDatabase = async () => {
  try {
    // Vérifier d'abord l'état des tables
    const checkResult = await checkDatabaseSetup();

    if (!checkResult.success) {
      showSetupInstructions();
      return checkResult;
    }

    // Analyser les résultats
    const missingTables = Object.entries(checkResult.data)
      .filter(([_, info]) => !info.exists)
      .map(([tableName, _]) => tableName);

    if (missingTables.length > 0) {
      console.log(`❌ Tables manquantes: ${missingTables.join(', ')}`);
      showSetupInstructions();
      return handleError(
        new Error(`Tables manquantes: ${missingTables.join(', ')}`),
        'setup database - tables manquantes'
      );
    }

    console.log('✅ Toutes les tables existent !');
    return handleSuccess(checkResult.data, 'setup database - complet');

  } catch (error) {
    showSetupInstructions();
    return handleError(error, 'setup database');
  }
};