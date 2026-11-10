# Phase 0 — Audit et sauvegarde

**État : à réaliser sur le code source original, non accessible à ce kit.**

## P0.1 — Inventaire technique

- [ ] Copier tous les fichiers du projet Sites, assets, configurations et manifestes.
- [ ] Lister les routes, tous les pages/composants, leurs dépendances et liens.
- [ ] Répertorier les fonctionnalités : créateur, équipements, catalogue joyaux, armures, calculateur de dégâts, news/mises à jour, réglages, sauvegardes, responsive, filtres et autres fonctionnalités effectivement présentes.
- [ ] Localiser le stockage et sa structure (localStorage/IndexedDB/backend) ; conserver les clés existantes.
- [ ] Photographier les états clés et tester les flux principaux desktop/mobile.
- [ ] Identifier version réelle du jeu utilisée et provenance des données.

## P0.2 — Sauvegarde

- [ ] Créer `backup/YYYY-MM-DD-HHMM-original.zip` (hors dépôt public si données sensibles).
- [ ] Calculer son SHA-256 et consigner le résultat.
- [ ] Tester extraction, démarrage de l'ancien site et restauration de la sauvegarde dans un espace isolé.
- [ ] Créer une branche `feature/phase-0-1-catalog-validator` dans le dépôt source, quand accessible.

## P0.3 — Baseline tests

- [ ] Toutes les pages se chargent sans erreur console.
- [ ] Toutes les fonctions existantes fonctionnent comme auparavant.
- [ ] Les builds enregistrés sont récupérables sans conversion destructive.
- [ ] Le calculateur conserve la même sortie avec les mêmes entrées (tests de référence).
- [ ] Les interactions équipements / joyaux et les bonus de set restent disponibles.
- [ ] Les pages d'actualités/mises à jour et illustrations restent intactes.

## P0.4 — Conditions bloquantes

Phase 1 sur le site réel interdite tant que la restauration et la baseline ne sont pas validées.
