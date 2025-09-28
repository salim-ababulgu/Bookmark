# BookmarkApp

BookmarkApp est une application web moderne pensée pour gérer et organiser vos favoris en ligne. Elle combine simplicité et puissance, avec une interface élégante et une synchronisation fluide grâce à Supabase.

## ✨ Nouvelles fonctionnalités

### 🎯 Système CRUD Avancé
- **Interface unifiée** : Gestion complète des favoris depuis la page d'accueil
- **Actions rapides** : Menu contextuel pour chaque favori (modifier, supprimer, archiver, copier URL)
- **Sélection multiple** : Actions en lot sur plusieurs favoris
- **Vues flexibles** : Basculer entre vue liste et grille
- **Statistiques en temps réel** : Total, favoris, récents, archivés, non lus

### 🔍 Recherche et Filtres Avancés
- **Recherche intelligente** : Suggestions automatiques par titre, tag et domaine
- **Filtres multiples** : Par statut (favoris, archivés, lus), tags, domaines, dates
- **Filtres temporels** : Aujourd'hui, cette semaine, ce mois, période personnalisée
- **Tri personnalisable** : Par date, titre, domaine avec ordre croissant/décroissant

### 📥 Import/Export Amélioré
- **Prévisualisation détaillée** : Aperçu des favoris avant import avec statistiques
- **Support multi-formats** : HTML (Chrome, Firefox, Safari), JSON, Netscape Bookmark
- **Validation de sécurité** : Détection de contenu malveillant
- **Feedback visuel** : Progression en temps réel, résultats détaillés
- **Instructions claires** : Guide étape par étape pour chaque navigateur

### 🎨 Interface Utilisateur Moderne
- **Design System complet** : Composants réutilisables avec animations Framer Motion
- **Thème sombre/clair** : Basculement instantané avec persistance
- **Couleurs d'accent** : 8 couleurs personnalisables pour l'interface
- **Notifications avancées** : Centre de notifications avec gestion en temps réel
- **Modales responsive** : Interface adaptative sur tous les écrans

### 🔐 Sécurité Renforcée
- **Authentification Supabase** : Google OAuth, email/mot de passe
- **Validation stricte** : Sanitisation XSS, validation CSRF, audit des actions
- **Chiffrement** : Données sensibles chiffrées
- **Rate limiting** : Protection contre les abus
- **Logs d'audit** : Traçabilité des actions utilisateur

### 📱 Extension Navigateur
- **Extension Chrome** : Ajout rapide de favoris depuis n'importe quelle page
- **Interface native** : Popup intégrée au navigateur
- **Synchronisation automatique** : Avec l'application web
- **Raccourcis clavier** : Ctrl+Shift+B pour ajout rapide

## 🎯 Objectif

Proposer un gestionnaire de favoris capable de :

- ✅ Sauvegarder un lien en un clic avec métadonnées automatiques
- ✅ Classer les favoris par collections, tags et statuts
- ✅ Retrouver n'importe quel lien via une recherche intelligente
- ✅ Synchroniser les données sur tous les appareils en temps réel
- ✅ Offrir une interface responsive et agréable à utiliser
- ✅ Importer/exporter depuis tous les navigateurs populaires
- ✅ Gérer les favoris avec des actions rapides et en lot
- ✅ Personnaliser l'expérience utilisateur

## 🛠 Stack technique

### Frontend
- **React 18** + **Vite** (build ultra-rapide)
- **Tailwind CSS** (design system custom avec variables CSS)
- **Framer Motion** (animations fluides)
- **Lucide React** (icônes modulaires)
- **Sonner** (notifications toast)
- **Radix UI** (composants accessibles)

### Backend (Supabase)
- **Supabase Auth** (Google OAuth, Email/Password)
- **PostgreSQL** (base de données relationnelle)
- **Row Level Security** (sécurité au niveau des lignes)
- **Realtime** (synchronisation en temps réel)
- **Edge Functions** (fonctions serverless)

### Sécurité
- **Rate Limiting** (protection contre les abus)
- **XSS Protection** (sanitisation des données)
- **CSRF Protection** (tokens de sécurité)
- **Audit Logging** (journalisation des actions)
- **Data Encryption** (chiffrement des données sensibles)

## 🚀 Fonctionnalités principales

### Gestion des Favoris
- **CRUD complet** : Créer, lire, modifier, supprimer
- **Actions en lot** : Sélection multiple et actions groupées
- **Statuts avancés** : Favori, lu/non lu, archivé
- **Métadonnées automatiques** : Titre, description, favicon
- **Organisation** : Collections, tags, dossiers

### Interface et UX
- **Trois modes d'affichage** : Liste détaillée, grille compacte
- **Recherche instantanée** : Avec suggestions et filtres
- **Raccourcis clavier** : Navigation rapide (Ctrl+K, Ctrl+S, etc.)
- **Drag & Drop** : Réorganisation intuitive
- **Responsive design** : Optimisé mobile/desktop

### Import/Export
- **Multi-formats** : JSON, HTML, Netscape Bookmark
- **Tous navigateurs** : Chrome, Firefox, Safari, Edge
- **Prévisualisation** : Aperçu avant import
- **Validation** : Sécurité et format
- **Statistiques** : Résultats détaillés

### Notifications
- **Centre de notifications** : Gestion centralisée
- **Notifications push** : Alerts navigateur
- **Animations** : Feedback visuel fluide
- **Historique** : Conservation des notifications

## 📱 Structure de l'app

### Pages principales
- **🏠 Accueil** : Dashboard avec CRUD avancé, statistiques et actions rapides
- **📊 Analyses** : Statistiques d'utilisation, graphiques et insights
- **🔒 Sécurité** : Audit, logs et paramètres de sécurité
- **👤 Profil** : Informations personnelles et avatar
- **⚙️ Paramètres** : Thème, couleurs, préférences

### Composants avancés
- **Modales intelligentes** : Import, ajout, édition avec validation
- **Filtres dynamiques** : Recherche en temps réel avec suggestions
- **Actions contextuelles** : Menus rapides par favori
- **Feedback système** : Notifications et états de chargement

## 🔐 Sécurité

### Authentification
- **Row Level Security** : Isolation des données par utilisateur
- **JWT Tokens** : Sessions sécurisées avec refresh automatique
- **OAuth Google** : Authentification externe sécurisée

### Protection des données
- **Validation stricte** : Sanitisation XSS et CSRF
- **Audit complet** : Logs de toutes les actions
- **Chiffrement** : Données sensibles protégées
- **Rate limiting** : Protection contre les abus

## 🛣 Roadmap

### Phase 1 (Terminé) ✅
- ✅ Architecture Supabase complète
- ✅ Système CRUD avancé
- ✅ Import/export multi-formats
- ✅ Interface moderne avec animations
- ✅ Sécurité renforcée
- ✅ Extension navigateur

### Phase 2 (En cours) 🚧
- 🔄 Mode collaboratif (partage de collections)
- 🔄 API publique avec documentation
- 🔄 Thèmes personnalisés avancés
- 🔄 Export vers services tiers (Notion, Airtable)

### Phase 3 (Planifié) 📋
- 📋 Application mobile (React Native)
- 📋 Synchronisation automatique navigateurs
- 📋 Intelligence artificielle (suggestions, catégorisation)
- 📋 Plans Pro avec paiements Stripe

## 🎨 Personnalisation

### Thèmes
- **Mode sombre/clair** : Basculement instantané
- **8 couleurs d'accent** : Rouge, Orange, Jaune, Vert, Bleu, Indigo, Violet, Rose
- **Variables CSS** : Personnalisation complète des couleurs
- **Animations** : Transitions fluides partout

### Interface
- **Avatars personnalisés** : Upload d'image ou Gravatar
- **Raccourcis clavier** : Configurables et intuitifs
- **Préférences** : Sauvegarde des paramètres utilisateur
- **Responsive** : Adaptatif mobile/tablette/desktop

## 📈 Métriques et Analytics

### Statistiques intégrées
- **Favoris par période** : Graphiques d'évolution
- **Tags populaires** : Analyse d'utilisation
- **Sites favoris** : Domaines les plus sauvegardés
- **Activité** : Historique des actions

### Tableaux de bord
- **Vue d'ensemble** : Métriques clés
- **Analyses détaillées** : Graphiques interactifs
- **Export de données** : Rapports personnalisés

## 🚀 Installation et développement

### Prérequis
```bash
Node.js >= 18
npm ou yarn
Compte Supabase
```

### Installation
```bash
git clone https://github.com/votre-username/project_bookmark.git
cd project_bookmark
npm install
cp .env.example .env.local
# Configurer les variables Supabase
npm run dev
```

### Variables d'environnement
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de :

1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

## 📄 Licence

MIT — libre d'utilisation et de modification.

## 👥 Équipe

Développé avec ❤️ par l'équipe BookmarkApp

---

⭐ **Star ce repo** si vous trouvez ce projet utile !