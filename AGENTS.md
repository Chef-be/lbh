# AGENTS — Plateforme BEE
## Documentation des agents et sous-agents Claude Code

---

## 1. AGENT PRINCIPAL

**Rôle :** Architecte logiciel, développeur principal, intégrateur DevOps, analyste métier, concepteur de base de données, testeur et rédacteur technique.

**Modèle recommandé :** claude-sonnet-4-6 (défaut), claude-opus-4-6 pour les tâches complexes de conception.

**Répertoire de travail :** `/var/www/vhosts/lbh-economiste.com/httpdocs`

---

## 2. SOUS-AGENTS DISPONIBLES

### 2.1 Agent d'exploration (`Explore`)
**Usage :** Recherche de fichiers, exploration de la base de code, vérification de l'état du projet.
**Quand l'utiliser :**
- Recherche d'un fichier ou d'une classe spécifique.
- Vérification de l'état de l'arborescence.
- Analyse de dépendances.
- Recherche de motifs dans le code.

### 2.2 Agent de planification (`Plan`)
**Usage :** Conception architecturale, planification d'implémentation.
**Quand l'utiliser :**
- Avant de commencer un nouveau module.
- Pour planifier une refactorisation importante.
- Pour concevoir le schéma de base de données d'un nouveau domaine métier.
- Pour choisir entre plusieurs approches techniques.

### 2.3 Agent à usage général (`general-purpose`)
**Usage :** Tâches multi-étapes complexes, recherche sur Internet, vérification de technologies.
**Quand l'utiliser :**
- Vérification des versions de bibliothèques.
- Recherche de documentation officielle.
- Validation de bonnes pratiques.
- Vérification de compatibilités.

---

## 3. TÂCHES TYPES PAR AGENT

### Tâches pour l'agent principal (séquentiel)
- Écriture de code Python/Django.
- Écriture de code TypeScript/Next.js.
- Création de migrations de base de données.
- Configuration Docker Compose.
- Rédaction de documentation.
- Exécution de commandes shell sur le serveur.

### Tâches pour les sous-agents en parallèle
- Exploration de la base de code ET recherche de documentation Internet simultanées.
- Analyse de plusieurs modules indépendants simultanément.
- Vérification de plusieurs technologies en parallèle.

---

## 4. STRATÉGIE D'UTILISATION DES AGENTS

### Principe de base
1. Utiliser les outils directs (Glob, Grep, Read) pour les recherches simples.
2. Utiliser l'agent Explore pour les recherches complexes nécessitant plusieurs itérations.
3. Utiliser l'agent Plan avant toute implémentation non triviale.
4. Utiliser l'agent général pour les vérifications Internet importantes.

### Parallélisation
Les agents peuvent être lancés en parallèle lorsque les tâches sont indépendantes :
- Recherche de documentation sur une technologie + exploration du code existant.
- Analyse de deux modules différents.
- Vérification des tests + analyse de la structure de la base de données.

### Isolation des contextes
Les sous-agents travaillent dans leur propre contexte. Toujours leur fournir :
- Le contexte métier pertinent.
- Les contraintes techniques de l'environnement.
- Les résultats attendus sous forme structurée.

---

## 5. INSTRUCTIONS SPÉCIFIQUES AUX AGENTS

### Pour tout agent travaillant sur ce projet

**Toujours respecter :**
- Langue française pour tout texte visible par l'utilisateur.
- Les contraintes de sécurité listées dans CLAUDE.md.
- Les conventions de nommage en français.
- La structure de répertoire définie dans CLAUDE.md.

**Jamais faire :**
- Modifier la base de données sans migration Django.
- Coder des secrets en dur.
- Exposer des ports sans justification.
- Supprimer des fichiers sans confirmation.
- Modifier les conteneurs d'autres projets (CSA, Nextcloud, etc.).

### Pour les agents de calcul
- Chaque formule doit être documentée avec sa source.
- Chaque résultat doit indiquer son domaine de validité.
- Les hypothèses doivent être explicites et tracées.
- Les résultats hors domaine de validité doivent déclencher une alerte.

### Pour les agents de génération documentaire
- Les documents générés doivent respecter les modèles Word définis.
- Les variables de fusion doivent être vérifiées avant génération.
- Les documents générés doivent être horodatés et versionnés.

---

## 6. PHASES DE RÉALISATION ET AGENTS ASSOCIÉS

### Phase 1 — Infrastructure et base (en cours)
- Agent principal : environnement, Docker Compose, Django de base, Next.js de base.
- Agent Plan : schéma de base de données, architecture des profils et droits.

### Phase 2 — Gestion documentaire et analyse
- Agent principal : module documents, OCR, PDF.
- Agent général : vérification des bibliothèques OCR (Tesseract, EasyOCR, etc.).

### Phase 3 — Économie et rentabilité
- Agent principal : modules économie, rentabilité, graphiques.
- Agent Plan : conception du noyau de calcul de rentabilité.

### Phase 4 — Modules techniques voirie et bâtiment
- Agent principal : modules voirie, bâtiment.
- Agent général : vérification des normes et méthodes de dimensionnement.

### Phase 5 — Modules complets et intégrations
- Agent principal : webmail, supervision, centre de mise à jour.
- Agent général : vérification des protocoles mail (IMAP, SMTP).

### Phase 6 — Production
- Agent principal : tests complets, durcissement sécurité, documentation finale.
- Agent Plan : stratégie de déploiement production.

---

## 7. MÉMOIRE DU PROJET

Les informations importantes sur le projet sont stockées dans :
`/root/.claude/projects/-var-www-vhosts-lbh-economiste-com/memory/`

Consulter la mémoire avant de commencer une nouvelle session de travail importante.

---

*Documentation des agents — à mettre à jour lors de l'ajout de nouveaux agents ou de nouvelles stratégies.*
