# BookmarkApp

BookmarkApp est une application web moderne pensée pour gérer et organiser tes favoris en ligne.
Elle combine simplicité et puissance, avec une interface élégante et une synchronisation fluide grâce à Firebase.

## Objectif

Proposer un gestionnaire de favoris capable de :

- Sauvegarder un lien en un clic
- Classer les favoris par collections et tags
- Retrouver n'importe quel lien via une recherche intelligente
- Synchroniser les données sur tous les appareils
- Offrir une interface responsive et agréable à utiliser

## Stack technique

### Frontend
- React + TypeScript
- Tailwind CSS (design system custom)
- Shadcn/ui pour les composants
- Lucide Icons pour les icônes
- Sonner pour les notifications

### Backend (BaaS)
- Firebase Authentication (Google, GitHub, Email/Password)
- Firestore Database
- Firebase Storage (screenshots, favicons)
- Cloud Functions (optionnel)
- Firebase Hosting

## Fonctionnalités principales

- Organisation en collections personnalisées (couleur + icône) et tags libres
- Trois modes d'affichage : liste, grille, galerie type Pinterest
- Recherche instantanée avec filtres et suggestions intelligentes
- Import/export en JSON et HTML compatible navigateurs
- Synchronisation en temps réel
- Expérience utilisateur enrichie : onboarding guidé, commande rapide (Ctrl+K), drag & drop, notifications toast

## Structure de l'app

- **Dashboard** : aperçu global (stats, favoris récents, collections actives)
- **Favorites** : gestion, recherche, filtres
- **Collections** : dossiers thématiques, statistiques associées
- **Profile** : paramètres utilisateur (thème, vue par défaut, mode compact)
- **Onboarding** : tutoriel interactif

## Sécurité

- Chaque document Firestore est relié à un utilisateur unique
- Un utilisateur ne peut gérer que ses propres favoris et collections privés
- Les contenus publics restent accessibles à tous en lecture seule

## Roadmap

- Extension Chrome pour ajout rapide
- Synchronisation automatique avec les navigateurs
- Mode collaboratif (partage de collections en équipe)
- Plans Pro et Team avec paiements via Stripe

## Licence

MIT — libre d'utilisation et de modification.