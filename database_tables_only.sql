-- ================================
-- SCRIPT SIMPLIFIÉ - TABLES SEULEMENT
-- ================================
-- Exécutez ces commandes si vous voulez SEULEMENT créer les tables

-- ORDRE IMPORTANT: Collections AVANT Bookmarks (foreign key)

-- 1. Table COLLECTIONS (EN PREMIER)
-- ================================
CREATE TABLE public.collections (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text DEFAULT '',
    color text DEFAULT 'blue',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Table BOOKMARKS (référence collections)
-- ================================
CREATE TABLE public.bookmarks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    url text NOT NULL,
    description text DEFAULT '',
    collection_id uuid REFERENCES public.collections(id) ON DELETE SET NULL,
    tags text[] DEFAULT '{}',
    favicon text,
    is_favorite boolean DEFAULT false,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Table USER_SETTINGS
-- ================================
CREATE TABLE public.user_settings (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    theme text DEFAULT 'system',
    language text DEFAULT 'fr',
    default_view text DEFAULT 'grid',
    notifications jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ================================
-- POLITIQUES RLS (Row Level Security)
-- ================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Politiques pour BOOKMARKS
CREATE POLICY "Users can view their own bookmarks" ON public.bookmarks
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bookmarks" ON public.bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookmarks" ON public.bookmarks
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks" ON public.bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour COLLECTIONS
CREATE POLICY "Users can view their own collections" ON public.collections
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own collections" ON public.collections
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own collections" ON public.collections
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own collections" ON public.collections
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour USER_SETTINGS
CREATE POLICY "Users can view their own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- ================================
-- FONCTION TRIGGER POUR UPDATED_AT
-- ================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at automatique
CREATE TRIGGER update_bookmarks_updated_at
    BEFORE UPDATE ON public.bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON public.collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- INDEX POUR LES PERFORMANCES
-- ================================

-- Index pour bookmarks
CREATE INDEX idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX idx_bookmarks_created_at ON public.bookmarks(created_at DESC);
CREATE INDEX idx_bookmarks_collection_id ON public.bookmarks(collection_id);
CREATE INDEX idx_bookmarks_is_favorite ON public.bookmarks(is_favorite);
CREATE INDEX idx_bookmarks_tags ON public.bookmarks USING GIN(tags);

-- Index pour collections
CREATE INDEX idx_collections_user_id ON public.collections(user_id);
CREATE INDEX idx_collections_created_at ON public.collections(created_at DESC);