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
