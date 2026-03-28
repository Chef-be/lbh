# GOUVERNANCE CLAUDE CODE — Plateforme BEE
## Bureau d'Études Économiste — Économie de la Construction

---

## 1. CONTEXTE DU PROJET

**Nom du projet :** Plateforme BEE (Bureau d'Études Économiste)
**Répertoire principal :** `/var/www/vhosts/lbh-economiste.com/httpdocs`
**Répertoire ressources :** `/var/www/vhosts/lbh-economiste.com/ressources`
**Serveur :** Debian 12 / Plesk Obsidian / Docker Compose
**Environnement d'exécution :** root sur serveur dédié distant
**Fuseau horaire cible :** Europe/Paris

---

## 2. RÈGLES ABSOLUES

### 2.1 Langue
- **Tout** doit être en français : interface, routes, commentaires, commits, documentation, messages d'erreur, journaux métier.
- Interdictions strictes dans l'interface : workflow, dashboard, feature flag, monitoring, update center, settings, layout, dry run, backend, frontend.
- Remplacements obligatoires :
  - workflow → circuit de traitement
  - dashboard → tableau de bord
  - feature flag → fonctionnalité activable
  - monitoring → supervision
  - update center → centre de mise à jour
  - settings → paramètres
  - layout → mise en page
  - dry run → simulation sans exécution
  - backend → application serveur ou cœur applicatif
  - frontend → interface ou interface utilisateur

### 2.2 Sécurité
- **Jamais** de secrets en dur dans le code ou les fichiers de configuration versionnés.
- Tous les secrets passent par les variables d'environnement (fichier `.env` non versionné).
- Le fichier `.env.example` documente les variables sans valeur réelle.
- Appliquer systématiquement : validation des entrées, protection CSRF, rate limiting, journalisation des accès.
- Contrôle d'accès basé sur les rôles (RBAC) pour chaque route et chaque action.

### 2.3 Architecture
- Ne jamais modifier directement la base de données sans migration Django versionnée.
- Ne jamais coder en dur une valeur métier susceptible d'évoluer.
- Tout paramètre métier doit être externalisé dans le modèle `Parametre` ou les fichiers de configuration.
- Ne jamais laisser un module désactivé provoquer une erreur ou une cassure visuelle.

### 2.4 Docker et Plesk
- Port d'entrée Plesk : `127.0.0.1:3082` pour le service `bee-nginx`.
- Réseau Docker dédié : `bee-reseau` (isolation complète des autres projets).
- Ne jamais exposer les services internes directement sur une interface publique.
- PostgreSQL dédié : `bee-postgresql` (ne pas partager avec d'autres projets sans décision explicite).
- Redis dédié : `bee-redis` (isolé du Redis Nextcloud).

---

## 3. STRUCTURE DU DÉPÔT

```
plateforme-bee/
├── CLAUDE.md                   # Ce fichier — gouvernance Claude Code
├── AGENTS.md                   # Documentation des agents et sous-agents
├── README.md                   # Documentation principale du projet
├── .env.example                # Variables d'environnement (sans valeurs réelles)
├── .env                        # Variables réelles (NON VERSIONNÉ)
├── .gitignore                  # Fichiers à exclure du dépôt
├── compose.yaml                # Docker Compose principal
├── compose.dev.yaml            # Surcharge pour le développement
├── compose.prod.yaml           # Surcharge pour la production
│
├── frontend/                   # Interface utilisateur Next.js + TypeScript
├── backend/                    # Cœur applicatif Django + Django REST Framework
├── services/                   # Services spécialisés FastAPI
├── calculs/                    # Noyau de calcul paramétrable et versionné
├── installateur/               # Assistant d'installation par navigateur
├── nginx/                      # Configuration Nginx
├── scripts/                    # Scripts d'exploitation et de déploiement
├── tests/                      # Tests automatisés
├── docs/                       # Documentation technique et métier
└── matrices/                   # Matrices de conception (droits, modules, calculs...)
```

---

## 4. CONVENTIONS DE CODE

### Python / Django
- Version cible : Python 3.11+
- Style : PEP 8, noms de variables et fonctions en français_snake_case quand c'est pertinent
- Tests : pytest + Django test client
- ORM : Django uniquement (pas de requêtes SQL brutes sauf justification documentée)
- Migrations : une migration par modification logique, jamais fusionner des migrations en développement actif
- API : Django REST Framework avec sérialiseurs explicites

### TypeScript / Next.js
- Version cible : Next.js 15+ (App Router)
- Style : ESLint + Prettier configurés en français quand possible
- Composants : nomenclature PascalCase, noms en français
- Routes : en français et avec tirets (`/tableau-de-bord`, `/gestion-documentaire`)
- State : Zustand ou React Query selon le type de données
- Tests : Vitest + Testing Library

### SQL / PostgreSQL
- Schéma : PostGIS 16
- Noms des tables et colonnes : français_snake_case
- Toujours ajouter des index sur les colonnes de recherche fréquente
- Pas de colonne sans commentaire SQL pour les tables métier complexes

---

## 5. PROCÉDURE DE TRAVAIL DE CLAUDE CODE

### Avant toute modification de code
1. Lire le fichier existant avant de le modifier.
2. Vérifier qu'aucune migration Django n'est en attente (`manage.py showmigrations`).
3. Ne pas modifier plusieurs modules indépendants dans un seul commit.

### Avant tout déploiement
1. Vérifier la santé des conteneurs : `docker compose ps`.
2. Vérifier les journaux récents : `docker compose logs --tail=50`.
3. Toujours sauvegarder la base avant une migration de production.
4. Ne jamais redémarrer en production sans validation du contexte.

### Gestion des erreurs
- Toujours diagnostiquer la cause racine avant de corriger.
- Ne jamais supprimer un fichier de verrouillage sans identifier le processus.
- Ne jamais forcer (`--force`, `--no-verify`) sans accord explicite de l'utilisateur.

### Commits
- Format : `type: description courte en français`
- Types : `ajout`, `correction`, `refactorisation`, `documentation`, `test`, `configuration`, `migration`
- Exemples :
  - `ajout: module de dimensionnement voirie`
  - `correction: calcul du trafic cumulé avec croissance géométrique`
  - `migration: ajout du champ taux_marge_cible sur Parametre`

---

## 6. PORTS ET RÉSEAU

| Service | Port externe (Plesk) | Port interne | Réseau |
|---|---|---|---|
| bee-nginx | 127.0.0.1:3082 | 80 | bee-reseau |
| bee-frontend | interne | 3000 | bee-reseau |
| bee-backend | interne | 8000 | bee-reseau |
| bee-services | interne | 8001 | bee-reseau |
| bee-postgresql | interne | 5432 | bee-reseau |
| bee-redis | interne | 6379 | bee-reseau |
| bee-minio | 127.0.0.1:9100 | 9000 | bee-reseau |
| bee-minio console | 127.0.0.1:9101 | 9001 | bee-reseau |
| bee-ocr | interne | 8010 | bee-reseau |
| bee-analyse-pdf | interne | 8011 | bee-reseau |
| bee-analyse-cao | interne | 8012 | bee-reseau |
| bee-celery | aucun | — | bee-reseau |
| bee-celery-beat | aucun | — | bee-reseau |

---

## 7. VARIABLES D'ENVIRONNEMENT CRITIQUES

Voir `.env.example` pour la liste complète.
Le fichier `.env` ne doit **jamais** être versionné.
Le fichier `.env.example` doit être maintenu à jour à chaque nouvelle variable.

---

## 8. BASE DE DONNÉES

- Moteur : PostgreSQL 16 + PostGIS 3.4
- Schéma principal : `bee`
- Schéma audit : `bee_audit`
- Schéma documentaire : `bee_docs`
- Sauvegardes : quotidiennes via script `scripts/sauvegarde/sauvegarde-postgresql.sh`
- Migrations : **toujours via Django** (`manage.py migrate`)

---

## 9. MODULES ET FONCTIONNALITÉS ACTIVABLES

Les modules peuvent être activés/désactivés via le modèle `FonctionnaliteActivable`.
Un module désactivé doit :
- ne pas apparaître dans les menus,
- ne pas lever d'erreur si une route est accédée directement (retour 404 propre),
- ne pas casser les autres modules.

---

## 10. DOCUMENTATION

- Chaque nouvelle fonction métier complexe doit avoir une documentation dans `docs/metier/`.
- Chaque formule de calcul doit être documentée dans `matrices/calculs.md`.
- Chaque migration doit avoir un commentaire dans le fichier de migration Python.
- Les décisions d'architecture importantes sont consignées dans `docs/architecture/decisions/`.

---

## 11. CONTACTS ET RÉFÉRENCES

- Serveur : lbh-economiste.com
- Plesk : https://lbh-economiste.com:8443
- Dépôt Git : à configurer (voir `docs/deploiement/git-et-github.md`)
- Documentation Plesk Docker : https://docs.plesk.com/en-US/obsidian/administrator-guide/docker-support/

---

*Fichier de gouvernance — à maintenir à jour lors de chaque évolution structurante du projet.*
