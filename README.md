# WILDS — Carnet de chasse · Phases 0 et 1

Kit reconstruit le 10 novembre 2026 à partir du cahier des charges. **Ce n'est pas un export du projet Sites original.**

## Livré

- Aperçu autonome `preview/index.html` : interface sombre bronze / vert, atelier de builds interactif, joyaux, rapport de validation, statistiques et calculateur indicatif, stockage local de la démo.
- Moteur indépendant `src/domain/validate-build.mjs`, catalogue `src/data/catalog/`, adaptateur et tests Node.
- Dossiers Phase 0 `audit/` : audit à effectuer, inventaire, sauvegarde et restauration.
- Contrats de données, modèle de versionnement, non-régression et critères de livraison.

## Démarrage

```bash
npm test
npm run serve
# Puis ouvrir http://localhost:8080/preview/
```

Sans Node ni serveur, `preview/index.html` fonctionne localement dans de nombreux navigateurs, mais le serveur est conseillé pour charger les modules et JSON.

## Sécurité de migration

Ce projet est **un kit de préparation séparé**, pas un remplacement du projet Sites `sites-project://appgprj_6aece7850b748191ad4a566d4f171c59`. Aucune fonctionnalité du site en ligne n'a été modifiée. L'intégration doit être faite **après sauvegarde et inventaire du code original** en important les nouveaux modules, sans écraser les fichiers existants. La démo n'affirme pas représenter la base exhaustive de Monster Hunter Wilds ; ses entrées sont fictives et portent `verificationStatus: example-only`. Aucune certification de légalité n'est possible sur ce jeu de démonstration.

## Architecture

- `src/domain/validate-build.mjs` : contrôle de structures, slots, tailles, compatibilité et cumul de compétences.
- `src/domain/catalog.mjs` : contrôles du schéma et des références croisées.
- `src/data/catalog/manifest.json` : traçabilité des données, version du catalogue et statut non vérifié.
- `preview/` : prototype UX **isolé**, sans dépendance.
- `tests/` : scénarios de validation et de non-régression du module.

## Vers l'intégration réelle

1. Exporter les fichiers du site existant et produire une sauvegarde restaurable.
2. Établir l'inventaire de toutes les routes, interfaces, images, talents, joyaux, données persistées et calculateurs.
3. Déterminer la structure réelle et ajouter un adaptateur du modèle actuel vers le contrat `build`.
4. Remplir le catalogue avec des données **vérifiées** et des noms français officiels. En particulier, ne pas inventer les tailles des joyaux ni les propriétés Artian/Gogmazios.
5. Activer le vérificateur en mode observation, faire passer les tests de non-régression, puis activer les messages d'erreur.
6. Préserver une possibilité de retour arrière et tester la restauration.
