# Phase 1 — Durcissement web (staging et production)

Suite de l'audit de sécurité (`docs/security/audit-securite-et-architecture.md`, constats M2, M3, M8, M10, F2 et exposition de scripts tiers). Ce lot touche le front (`data-mastery-hub`) et le backend (`modeltech-backend`, branche `sec/phase-1-durcissement`).

## 1. Ce qui change

### Front
| Constat | Correction |
|---|---|
| **M2** Aucun en-tête de sécurité sur le site, et absents des fichiers statiques | `nginx/default.conf.template` + `nginx/snippets/security-headers.conf.template` : `Content-Security-Policy`, `Strict-Transport-Security` (180 jours, sans sous-domaines), `Permissions-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `server_tokens off`. Les en-têtes sont répétés dans **chaque** `location` (nginx n'hérite plus des en-têtes dès qu'un `location` en déclare un, ce qui annulait les en-têtes sur les fichiers statiques). |
| **M10** Jeton dans l'adresse (paiement, lien de connexion, réinitialisation, newsletter, certificat) | `Referrer-Policy: no-referrer` sur ces seules pages ; `strict-origin-when-cross-origin` ailleurs. |
| **M3** Images non épinglées, `npm install` | `nginx:1.30-alpine`, `node:22-alpine` (Node 20 est en fin de vie depuis avril 2026 ; le site est déjà développé et construit avec Node 22), `npm ci` (échoue si `package-lock.json` n'est plus à jour), `tsx@4.19.2` installé hors `package.json` à une version fixe. |
| **F2** Injection de formule dans les exports CSV | `src/lib/csv.ts` : toute cellule texte commençant par `=`, `+`, `-`, `@`, tabulation ou retour chariot est préfixée d'une apostrophe. Utilisé par l'export de la newsletter (qui n'échappait même pas les séparateurs) et par l'export de suivi de session. Tests unitaires ajoutés. |
| Scripts tiers | Les deux scripts « en ligne » de `index.html` (Google Analytics, Tawk.to) sont déplacés dans `public/gtag-init.js` et `public/tawk-init.js` : la politique de sécurité de contenu n'a ainsi pas besoin d'autoriser `unsafe-inline` pour les scripts. **Le widget de discussion Tawk.to n'est plus chargé sur la connexion, les mots de passe, les liens de paiement, les certificats, l'espace apprenant ni le back-office** : c'est un script tiers qui voit toute la page, y compris le jeton de session. Les liens « Connexion / Mon espace » du site public et la redirection après connexion sont des chargements de page complets, pour que le widget ne reste pas en mémoire. |

### Backend
| Constat | Correction |
|---|---|
| **M8** reCAPTCHA « en cas d'erreur, on laisse passer » | Échec de la vérification (réseau, délai, réponse vide) = **refus**. L'**action** du jeton est contrôlée (`bootcamp_register` pour la candidature, `masterclass_register` pour la masterclass) : un jeton obtenu sur un autre formulaire est refusé. Contrôle optionnel du **nom d'hôte** (`RECAPTCHA_ALLOWED_HOSTNAMES`). |
| Appels sortants sans délai | Le `RestTemplate` partagé (reCAPTCHA, Slack) a un délai de connexion de 3 s et de lecture de 5 s. |
| **M10** `GET /payments/{token}` sans limite | Limitation par IP (120 par heure, `app.rate-limit.token-view.per-hour`). Les routes `/invoice` et `/receipt` étaient déjà limitées. |

## 2. Variables d'environnement

| Variable | Où | Rôle |
|---|---|---|
| `CSP_HEADER_NAME` | conteneur du site (lue **au démarrage**, pas au build) | `Content-Security-Policy-Report-Only` par défaut (signale sans bloquer) ; `Content-Security-Policy` pour bloquer |
| `API_ORIGIN` | conteneur du site | Origine de l'API autorisée dans la politique (le compose staging la reprend de `VITE_API_BASE_URL`) |
| `MEDIA_ORIGIN` | conteneur du site | Origine du stockage de fichiers (vidéos hébergées, hors ligne) : même valeur que `MINIO_PUBLIC_URL` du backend |
| `RECAPTCHA_ALLOWED_HOSTNAMES` | backend | Domaines du site, séparés par des virgules (ex. `staging.model-technologie.com`). Vide = pas de contrôle |

Le compose staging du front transmet déjà ces variables ; **renseignez `MEDIA_ORIGIN` dans Dokploy** (sinon les téléchargements de vidéos hors ligne seront signalés par la politique).

## 3. Passer la politique de sécurité de contenu en mode bloquant

1. Déployer avec la valeur par défaut (`Report-Only`). Rien n'est bloqué.
2. Naviguer pendant une semaine sur tous les parcours (le guide de recette suffit) en gardant la console du navigateur ouverte : toute ligne « *Content Security Policy … Report Only* » indique une source oubliée. Les sources actuellement autorisées : le site, Google (reCAPTCHA, Analytics, connexion Google, Maps), Tawk.to, YouTube (`youtube-nocookie.com`), Vimeo, l'API et le stockage.
3. Sans signalement : définir `CSP_HEADER_NAME=Content-Security-Policy` dans Dokploy et redémarrer le conteneur du site. Retour arrière : remettre la valeur par défaut.

`frame-ancestors` n'est appliqué qu'en mode bloquant ; `X-Frame-Options: SAMEORIGIN` protège dans les deux cas.

## 4. À savoir au déploiement

- **reCAPTCHA** : un problème de communication avec Google refuse désormais la candidature ou l'inscription (le visiteur réessaie) au lieu de la laisser passer. Si vous voyez des refus inattendus, regarder les journaux du backend (`reCAPTCHA : action … attendue`, `nom d'hôte … non autorisé`).
- **Build du site** : `npm ci` exige que `package-lock.json` corresponde à `package.json`. Après tout ajout de dépendance, relancer `npm install` en local et commiter le fichier de verrouillage.
- **nginx** : la configuration est maintenant un *modèle* (`nginx/`) rendu au démarrage ; l'ancien `nginx.conf` n'existe plus. Le conteneur écoute toujours sur le port 80 (rien à changer dans Dokploy).
- **Reporté volontairement** :
  - *Retirer `.env` du suivi Git* : au prochain `git pull`, Git supprimerait votre `.env` local. À faire quand vous le souhaitez : copier `.env` vers `.env.local` (ignoré par Git), puis `git rm --cached .env`.
  - *Épingler PostgreSQL et MinIO* : à faire sur le serveur à la version **déjà en service** (`docker exec <conteneur> postgres --version`), pour ne risquer ni mise à niveau ni rétrogradation involontaire d'un service qui porte des données.
  - *nginx sans droits root* (image `nginx-unprivileged`) : elle écoute sur le port 8080 ; à planifier avec le changement de port dans Dokploy.

## 5. Vérifications effectuées

- **En-têtes** (nginx 1.30 réel, modèles montés, variables injectées) : `/`, `/formations`, un fichier versionné, `sw.js` et `gtag-init.js` portent tous la politique, HSTS, `Permissions-Policy`, `nosniff`, `X-Frame-Options` ; `/paiement/…` et `/connexion/lien?token=…` envoient `Referrer-Policy: no-referrer`, les autres pages `strict-origin-when-cross-origin` ; les fichiers statiques gardent leur cache d'un an, `sw.js` et les scripts d'initialisation sont en `no-cache`. `nginx -t` réussi.
- **Front** : `tsc` sans erreur, build de production, tests unitaires (dont l'échappement CSV).
- **Backend** : `RecaptchaServiceTest` (6 : action refusée, nom d'hôte, panne de Google = refus, jeton vide, désactivation), `IpRateLimiterTest` (portée `token-view`), `HardeningIT`, `PaymentFlowIT`, puis la suite complète.

**Non vérifié** : le chargement de l'image Docker complète du site (`docker build`) n'a pas été exécuté localement (téléchargement de Node et des dépendances) ; il le sera au premier déploiement staging. La politique de sécurité de contenu n'a pas été observée dans un vrai navigateur sur staging : c'est le rôle de la semaine en mode « rapport ».
