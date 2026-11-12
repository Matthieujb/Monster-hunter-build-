# Revue du site existant, sans déployer le prototype

La racine historique de ce dépôt diffère de la version Sites 15. Ne pas la publier à sa place.

Le correctif est fourni sous forme de **diff de code lisible** dans `exports/stabilisation-v15.patch`, contre la source exacte du site v15. L’archive v15 inchangée reste le point de retour arrière.

Avec Python 3, Git et Node.js (version supportant node:test et structuredClone) :

```sh
python3 sites-review/prepare.py
```

Le script contrôle le SHA-256 de l’archive, restaure le site dans `sites-review/worktree/dist`, applique le patch et exécute 64 tests. Il refuse d’écraser un dossier existant. Un autre dossier cible peut être passé en argument. Il n’envoie aucun code, ne fusionne aucune branche et ne publie rien.

Rapport avant/après et limites : `audit/mission-20261112.md`. Résultats : `audit/tests-20261112.txt`. Les données synthétiques ajoutées sont exclusivement des fixtures de tests ; le catalogue du site reste inchangé.

La livraison des sept phases reste en cours. Cette PR ne vaut pas validation pour publication.
