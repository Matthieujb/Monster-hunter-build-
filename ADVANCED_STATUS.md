# Intégration avancée — état et traçabilité

Branche de développement : `feat/wilds-builder-advanced-20261110`.

## Fonctionnalités ajoutées

- Page atelier avec représentation stylisée du chasseur, choix des équipements et contrôle de sertissage existant.
- Talisman manuel jusqu'à trois talents, contrôle du niveau par rapport au catalogue chargé. Les contraintes spécifiques de génération des talismans historiques ne sont **pas** encore vérifiées.
- Saisie de configurations Artian/Gogmazios **sous forme de notes uniquement**. Aucun bonus non vérifié n'est appliqué aux dégâts.
- Recherche de joyaux compatibles pour atteindre des objectifs de talents, limitée à 30 000 combinaisons. **Ce n'est pas un optimiseur DPS complet**, ni un moteur d'optimisation des armures.
- Comparaison de talents entre deux montages et lien de partage autonome.

## Données françaises : non terminé

Le dépôt contient des équipements et joyaux fictifs (`verificationStatus: example-only`). Il n'est **pas** possible de qualifier ce catalogue de complet ni d'officiel. Aucun nom, slot, niveau, bonus de set ou propriété Artian/Gogmazios ne doit être inventé. L'intégration exhaustive exige un inventaire sourcé, avec patch du jeu, date de consultation, langue FR, source et validation de chaque entrée.

## Vérification

Exécuter `npm test` à la racine (tests existants + tests avancés). Exécuter `npm run serve` puis ouvrir `http://localhost:8080/builder.html` pour les tests navigateur. Les tests ne peuvent pas être déclarés réussis sans exécution effective.

## Publication

Cette branche ne modifie pas `main` tant qu'elle n'est pas fusionnée. Le site ChatGPT Sites original est distinct de ce dépôt GitHub et n'est pas publié automatiquement.

## Visualiseur 3D (10 novembre 2026)

- `hunter-viewer.mjs` : véritable scène Three.js/WebGL en géométrie low-poly originale, sans modèles ou textures du jeu.
- Rotation tactile/souris, zoom à deux doigts et molette, boutons zoom et recentrage.
- Couleurs des sections 3D synchronisées avec les pièces sélectionnées ; chaque catégorie (arme, tête, torse, bras, taille, jambes) peut être masquée lorsqu'elle est absente.
- Rendu à la demande, ratio de pixels plafonné à 1,5 pour réduire la consommation sur iPhone ; nettoyage des ressources.
- Repli en silhouette 2D si Three.js ne peut pas être chargé ou si WebGL est indisponible.
- Dépendance CDN `https://esm.sh/three@0.170.0` : nécessite une connexion réseau et l'autorisation de charger le module distant. Aucun modèle 3D officiel n'est inclus.

**Limites :** l'apparence des équipements reste stylisée (formes génériques et palette de couleurs), pas une reproduction fidèle des armures du jeu. Aucun test navigateur iPhone ou rendu WebGL n'a été exécuté depuis cette session. Tester manuellement Safari iOS, rotation, pincement, changement d'équipement, repli 2D, et les fonctions du créateur avant fusion.
