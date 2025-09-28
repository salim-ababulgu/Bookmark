-- Table pour les notifications (à exécuter dans Supabase SQL Editor)

-- Créer la table notifications
CREATE TABLE public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    icon TEXT DEFAULT '📢',
    action_url TEXT,
    read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne voient que leurs notifications
CREATE POLICY "Utilisateurs peuvent voir leurs notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent mettre à jour leurs notifications
CREATE POLICY "Utilisateurs peuvent mettre à jour leurs notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent supprimer leurs notifications
CREATE POLICY "Utilisateurs peuvent supprimer leurs notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Politique pour permettre l'insertion (pour les notifications système)
CREATE POLICY "Permettre l'insertion de notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insérer quelques notifications de démonstration (optionnel)
-- Remplacez 'your-user-id' par un ID utilisateur réel
/*
INSERT INTO public.notifications (user_id, title, message, type, icon) VALUES
    ('your-user-id', 'Bienvenue !', 'Bienvenue dans BookmarkApp ! Découvrez toutes les fonctionnalités.', 'info', '🎉'),
    ('your-user-id', 'Interface améliorée', 'L''interface a été modernisée avec de nouvelles animations.', 'feature', '🎨'),
    ('your-user-id', 'Couleurs d''accent', 'Vous pouvez maintenant personnaliser la couleur d''accent.', 'feature', '🌈');
*/

-- Fonction pour envoyer une notification à un utilisateur
CREATE OR REPLACE FUNCTION send_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info',
    p_icon TEXT DEFAULT '📢',
    p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, title, message, type, icon, action_url)
    VALUES (p_user_id, p_title, p_message, p_type, p_icon, p_action_url)
    RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour marquer toutes les notifications comme lues
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE public.notifications
    SET read = true, read_at = NOW(), updated_at = NOW()
    WHERE user_id = p_user_id AND read = false;

    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le nombre de notifications non lues
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unread_count
    FROM public.notifications
    WHERE user_id = p_user_id AND read = false;

    RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;