# Audit de sécurité, profils d'accès, architecture cible et montée en charge

Model Technologie — plateforme (front `data-mastery-hub` + backend `modeltech-backend`)
Date : 11 octobre 2026 · Nature : analyse statique du code et des fichiers de déploiement. **Le rapport lui-même ne modifie aucun code.**

> **Mise à jour du 12 octobre 2026** — Décisions du Product Owner enregistrées (§5.6) · **Phase 0 réalisée** sur la branche `sec/phase-0-infra` du backend (détails et gestes à faire sur le serveur : `docs/ops/phase-0-securite.md` dans le dépôt backend). Les domaines `dozzle.`, `adminer.` et `minio-staging.model-technologie.com` sont confirmés publics : les constats C1 et C2 sont donc **avérés, pas hypothétiques**.

---

## 0. Lecture rapide (à lire si vous n'avez que 5 minutes)

**Niveau de sécurité actuel : correct pour une V1, insuffisant pour manipuler des paiements et des données personnelles à grande échelle.** Les fondamentaux applicatifs sont sains (pas d'injection SQL, pas de XSS évident, JWT signé, verrouillage après échecs, limitation de débit sur les formulaires, jetons à 256 bits). Les vrais risques sont ailleurs : **l'exposition de l'infrastructure** (stockage de fichiers, outils d'administration) et **l'absence de défense en profondeur sur les comptes du back-office** (pas de MFA, jeton de 24 h gardé dans le navigateur, non révoqué au changement de mot de passe).

### Les 6 points à traiter en premier (avant toute mise en production réelle)

| # | Constat | Gravité | Effort |
|---|---------|---------|--------|
| 1 | **Le bucket de fichiers est public en lecture ET écriture** (`mc anonymous set public`), et il contient **les captures de paiement et les projets des apprenants** | Critique | 0,5 j |
| 2 | **Adminer** (interface base de données) et **Dozzle** (journaux + socket Docker) déployés avec les services : à ne jamais exposer | Critique si exposés | 0,5 j |
| 3 | **Pas de MFA** sur le back-office ; la connexion « lien/code par e-mail » ouvre aussi les comptes ADMIN/SUPER_ADMIN (un seul facteur : la boîte mail) | Élevée | 3-4 j |
| 4 | **Jeton JWT de 24 h dans `localStorage`**, non révoqué lors d'un changement ou d'une réinitialisation de mot de passe | Élevée | 2-3 j |
| 5 | **Aucun en-tête de sécurité côté site** (pas de CSP, pas de HSTS) ; en-têtes absents sur les fichiers statiques | Moyenne | 1 j |
| 6 | **Swagger ouvert en staging** et journalisation DEBUG (SQL, e-mails) en staging | Moyenne | 0,5 j |

### Décisions d'architecture (détaillées plus bas)

- **Profils Financier / Manager** : faisable sans Keycloak, avec un modèle « rôles → permissions » en base piloté par le Super Admin. Coût estimé **8 à 12 jours** (backend + front). Recommandé, mais **après** les 6 correctifs ci-dessus.
- **Keycloak** : **non recommandé maintenant** (surcoût d'exploitation sur un VPS de 8 Go, bénéfice faible à ce stade). À reconsidérer si vous passez à plusieurs applications (Academy + mobile + partenaires) avec connexion unique.
- **Séparer l'espace apprenant (academy.model-technologie.com)** : bonne idée à moyen terme, **mais séparer d'abord le contrat d'API** (préfixes `/api/v1/learner`, `/api/v1/admin`, `/api/v1/public`), puis le domaine, puis seulement le dépôt. Le mobile est alors un simple troisième client.
- **Montée en charge 10 → 50 → 100 utilisateurs simultanés** : le VPS Contabo 8 Go **suffit très largement jusqu'à 100 simultanés** si on traite trois points précis (pool de connexions, cache, état en mémoire du limiteur). Ce n'est pas un problème de machine mais de configuration. DigitalOcean n'est utile que pour la haute disponibilité, pas pour la performance brute.

---

## 1. Périmètre et méthode

**Examiné** : `SecurityConfig`, `JwtTokenProvider`, `JwtAuthenticationFilter`, `AuthServiceImpl`, `AuthController`, `PasswordlessLoginServiceImpl`, `IpRateLimiter`, `RecaptchaServiceImpl`, `StorageServiceImpl`, `PublicPaymentController`, `EmailNotifier`, `VideoSource`, profils `application*.yml`, `docker-compose*.yml`, `Dockerfile` (backend et front), `nginx.conf`, `.gitignore`, requêtes SQL natives et `JdbcTemplate`, usages de `localStorage`, `dangerouslySetInnerHTML`, `iframe`, liens `target="_blank"` côté front.

**Non réalisé (limites de cette analyse)** :
- aucun test d'intrusion en conditions réelles, aucun scan réseau du VPS ;
- aucun audit des dépendances (`npm audit`, OWASP Dependency-Check) : à lancer, c'est une étape du plan ;
- je n'ai pas vu la configuration réelle de Traefik/Dokploy (domaines exposés, en-têtes ajoutés, ports publiés) : plusieurs constats « à vérifier » en dépendent ;
- je n'ai pas relu chaque contrôleur ligne par ligne : les contrôles d'accès par ressource (IDOR) sont à vérifier par des tests, voir §3.

---

## 2. Ce qui est déjà bien fait

À conserver, et à ne pas casser pendant les correctifs :

- **Injection SQL** : requêtes JPA paramétrées ; les requêtes SQL natives du tableau de bord (`StatsServiceImpl`) n'assemblent que des fragments constants et passent les valeurs en paramètres nommés. Aucun `Runtime.exec`, `ProcessBuilder`, désérialisation d'objets ni parseur XML dangereux trouvé.
- **XSS côté front** : aucun `dangerouslySetInnerHTML`, `innerHTML`, `eval` ni `document.write` dans `src/`. Les liens externes portent `rel="noreferrer"`.
- **XSS dans les e-mails** : le gabarit HTML du message de contact échappe les valeurs (`e(...)`).
- **Vidéos intégrées** : `VideoSource` n'accepte que Vimeo et YouTube (liste blanche d'hôtes) et fabrique l'URL d'intégration côté serveur (`youtube-nocookie.com`).
- **Mots de passe** : BCrypt ; verrouillage temporaire après 5 échecs ; messages neutres sur « mot de passe oublié » et la connexion par lien (pas d'énumération de comptes).
- **Droits relus en base à chaque requête** : un compte désactivé ou dont le rôle change est pris en compte immédiatement, pas à l'expiration du jeton. C'est un très bon point.
- **Jetons de lien** (paiement, réinitialisation, newsletter) : `SecureRandom`, 256 bits, expirants ; code de connexion à 6 chiffres limité à 5 essais par défi.
- **Cloisonnement des routes** : `/admin/**` par rôle, `/learner/**` réservé à `LEARNER`, tout le reste authentifié par défaut (`anyRequest().authenticated()`).
- **reCAPTCHA v3** + limitation de débit par IP sur les formulaires publics, la connexion, la vérification de certificats.
- **Docker** : le backend tourne en utilisateur non-root ; profil prod ferme Swagger ; `/actuator/health` seul exposé, sans détails.
- **Uploads de documents** : liste blanche d'extensions, taille bornée, stockage en `application/octet-stream`, nom généré (UUID), lecture par lien signé temporaire.
- **Secrets** : aucun secret serveur trouvé dans le dépôt front (le `.env` suivi ne contient que la clé de site reCAPTCHA, publique, et une URL de dev) ; un secret JWT de moins de 64 octets rend toute connexion impossible et journalise une erreur au démarrage (pas de repli faible silencieux).

---

## 3. Constats détaillés

Légende : **C** critique · **E** élevée · **M** moyenne · **F** faible. « À vérifier » = dépend de la configuration réelle du serveur.

### 3.1 Infrastructure et déploiement

#### C1 — Bucket MinIO public en lecture/écriture, contenant des pièces sensibles
- **Où** : `docker-compose.staging.yml` (service `minio-init-staging`, `mc anonymous set public`), `set-public.sh`, `StorageServiceImpl`.
- **Problème** : la politique `public` de MinIO autorise l'anonyme à **lire, lister, écrire et supprimer** (et pas seulement lire). Le commentaire du compose indique que le bucket contient « captures de paiement, logos, photos ». Tout est dans un seul bucket `media`.
- **Scénario** : si l'adresse publique de MinIO est joignable depuis Internet (c'est le but de `MINIO_PUBLIC_DOMAIN`), n'importe qui peut lister le bucket, télécharger les justificatifs de paiement et les livrables d'apprenants, **déposer** des fichiers (page de phishing hébergée sur votre domaine) ou **supprimer** des médias.
- **Correctif** :
  1. Passer la politique en `download` (lecture seule, sans liste) **uniquement** sur un bucket ou un préfixe de contenus publics (`logos/`, `alumni/`, `projects/`).
  2. Créer un **second bucket privé** pour tout ce qui est sensible (preuves de paiement, projets finaux, pièces apprenant) — accès uniquement par liens signés courts (le code sait déjà les générer : `presignedGetUrl`).
  3. Vérifier où chaque type de fichier est écrit aujourd'hui, et migrer les objets existants.
  4. Désactiver la liste anonyme des objets.

#### C2 — Adminer et Dozzle déployés avec la stack
- **Où** : `docker-compose.yml`, `docker-compose.staging.yml` (services `adminer*`, `dozzle-staging` avec `/var/run/docker.sock`).
- **Problème** : Adminer donne un accès direct à la base à quiconque atteint l'URL et connaît (ou devine) les identifiants ; Dozzle n'a pas d'authentification par défaut, expose tous les journaux (e-mails, erreurs) et monte la socket Docker (équivalent à un accès root à l'hôte s'il est compromis).
- **À vérifier** : y a-t-il un domaine Dokploy pointant vers eux ? Si oui : critique.
- **Correctif** : retirer ces services du compose de production ; les lancer à la demande, derrière un tunnel SSH ou VPN (WireGuard/Tailscale), jamais sur un domaine public. Si Dozzle est conservé : authentification activée, socket en lecture seule via un proxy (`docker-socket-proxy`).

#### M1 — Staging : documentation d'API ouverte et journaux DEBUG
- **Où** : `application-staging.yml` (pas de `springdoc … enabled: false`, `com.modeltech.datamasteryhub: DEBUG`, `org.hibernate.SQL: DEBUG`) ; `SecurityConfig` laisse `/swagger-ui/**` et `/v3/api-docs/**` en `permitAll`.
- **Risque** : cartographie complète de l'API pour un attaquant ; journaux riches en données personnelles (e-mails, noms). Le staging contient des données de test mais est souvent proche de la production.
- **Correctif** : mêmes réglages que la prod pour Swagger ; niveau INFO ; ou protéger Swagger par authentification SUPER_ADMIN.

#### M2 — Aucun en-tête de sécurité sur le site
- **Où** : `nginx.conf` (front), configuration Spring.
- **Constat** : seuls `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` sont posés — **et pas sur les fichiers statiques** (le bloc `location ~* \.(js|css…)` redéfinit les `add_header`, ce qui annule les en-têtes hérités). Pas de `Content-Security-Policy`, pas de `Strict-Transport-Security`, pas de `Permissions-Policy`.
- **Pourquoi c'est important** : la CSP est la principale ligne de défense qui limite l'effet d'une faille XSS (voir E2 : le jeton est dans `localStorage`).
- **Correctif** : CSP stricte (`default-src 'self'`; `script-src` limité à votre domaine, Google reCAPTCHA et Analytics ; `frame-src` limité à `youtube-nocookie.com`, `player.vimeo.com`, `www.google.com/recaptcha`, `www.google.com/maps` ; `connect-src` limité à l'API) ; HSTS (1 an) ; `Permissions-Policy` ; répéter les en-têtes dans chaque `location`. Valider en mode « report-only » une semaine.

#### M3 — Conteneur nginx en root, image non épinglée
- `nginx:alpine`, `node:20-alpine`, `postgres:15-alpine`, `minio:latest`, `dozzle:latest` : versions flottantes. Le Dockerfile front installe `tsx` en dev pendant le build (`npm install -D tsx`) sans verrouillage.
- **Correctif** : épingler les versions (digest ou tag précis), `npm ci` plutôt que `npm install`, image nginx « unprivileged ».

#### M4 — Confiance dans `X-Forwarded-For` pour limiter le débit
- **Où** : `IpRateLimiter.clientIp` prend la **dernière** valeur de `X-Forwarded-For`. C'est correct derrière Traefik (qui ajoute l'IP réelle en dernier), mais **faux si le backend est joignable sans passer par le proxy** ou si deux proxys sont chaînés (CDN + Traefik) : on limiterait alors l'IP du CDN, donc tous les visiteurs ensemble.
- **Correctif** : s'assurer que le port 8080 du backend n'est publié nulle part ; si un CDN est ajouté plus tard, utiliser `server.forward-headers-strategy` et `RemoteIpValve` avec la liste des proxys de confiance.

### 3.2 Authentification et sessions

#### E1 — Pas d'authentification multifacteur sur le back-office
- **Problème** : un mot de passe (8 caractères minimum) suffit pour un SUPER_ADMIN. Pire, `/auth/passwordless/*` et `/auth/google` fonctionnent aussi pour les comptes `admin_users` (`PasswordlessLoginServiceImpl` ligne ~154) : **la boîte mail seule ouvre le back-office**. Une boîte mail compromise = plateforme compromise (paiements, certificats, données de tous les apprenants).
- **Correctif (voir §5)** : MFA TOTP obligatoire pour tous les rôles du personnel ; codes de secours ; pour les comptes du personnel, désactiver la connexion « lien par e-mail » **ou** la faire suivre d'un second facteur ; politique de mot de passe renforcée.

#### E2 — Jeton JWT de 24 h dans `localStorage`, sans refresh, révocation limitée
- **Où** : `httpClient.ts` (`localStorage.getItem/setItem`), `JwtTokenProvider` (`jwtExpiration` 86 400 000 ms), `AuthServiceImpl` (changement/réinitialisation de mot de passe sans révocation).
- **Problèmes** :
  1. Tout script exécuté sur le site (faille XSS future, extension de navigateur malveillante, script tiers) peut lire le jeton et l'utiliser pendant 24 h.
  2. Après un changement ou une réinitialisation de mot de passe (par exemple parce que le compte est suspecté piraté), **les jetons déjà émis restent valables** jusqu'à 24 h.
  3. La « blacklist » ne s'applique qu'à la déconnexion explicite.
  4. Algorithme HS256 avec secret partagé : correct tant que le secret est long et secret ; pas de rotation de clé prévue.
- **Correctif recommandé** :
  - Jeton d'accès court (**15 min**) + **jeton de rafraîchissement** (7-30 jours) en **cookie `HttpOnly; Secure; SameSite=Strict`**, rotatif et révocable (table des sessions). Le jeton d'accès reste en mémoire du navigateur uniquement.
  - Ajouter un champ « version de sécurité » (ou date de dernier changement de mot de passe) sur le compte, vérifié par le filtre : tout changement de mot de passe, de rôle ou désactivation invalide les anciens jetons.
  - Rotation planifiée du secret de signature (clé identifiée par `kid`).
  - Si le cookie est utilisé, **réactiver la protection CSRF** (ou `SameSite=Strict` + vérification de l'en-tête `Origin`) : aujourd'hui `csrf` est désactivé, ce qui est correct *uniquement* parce que le jeton est dans un en-tête.

#### M5 — Verrouillage de compte exploitable comme déni de service ciblé
- `requireNotLocked` bloque la connexion par mot de passe d'un e-mail donné pendant 15 minutes après 5 échecs ; un tiers peut donc verrouiller en boucle le compte d'un administrateur connu.
- **Atténuation existante** : la connexion par lien permet de contourner. À améliorer : verrouillage progressif **par couple (e-mail, IP)** plutôt que par e-mail seul, alerte e-mail au titulaire, CAPTCHA après 3 échecs.

#### M6 — Politique de mots de passe faible
- Minimum 8 caractères, aucune autre règle (`@Size(min = 8)`), aucun contrôle contre les mots de passe courants ou compromis.
- **Correctif** : 12 caractères minimum pour le personnel, 10 pour les apprenants ; refuser les mots de passe de la liste des plus courants ; option de vérification « Have I Been Pwned » (k-anonymat, sans envoyer le mot de passe).

#### M7 — Code de connexion à 6 chiffres haché sans sel, e-mail dans les journaux
- `codeHash = sha256(email + ":" + code)` : 10⁶ possibilités, donc réversible en une seconde **si la table fuit** (la durée de vie est courte, d'où la gravité moyenne). Utiliser HMAC avec un secret serveur.
- Les journaux de connexion contiennent l'e-mail en clair (`Tentative de connexion: …`, « Forgot password … email inconnu ») : données personnelles dans les journaux ; à réduire ou masquer (`j***@gmail.com`).

#### M8 — reCAPTCHA : « en cas d'erreur, on laisse passer »
- `RecaptchaServiceImpl.verify` renvoie `true` si l'appel à Google échoue. De plus, ni l'action (`action`) ni le nom d'hôte ne sont contrôlés, et `RestTemplate` n'a pas de délai d'attente.
- **Correctif** : échec = refus (avec message clair), vérifier `action` et `hostname`, délais d'attente de 3 s, repli sur la limitation de débit stricte.

### 3.3 Autorisations et données

#### E3 — Les droits sont codés « en dur » dans les URL, sans granularité
- 6 rôles (`SUPER_ADMIN`, `ADMIN`, `EDITOR`, `TRAINER`, `PARTNER`, `LEARNER`) et des règles `hasAnyRole` dans `SecurityConfig` ; seulement 8 `@PreAuthorize` dans tout le code. Impossible aujourd'hui de séparer « voir les paiements » de « gérer les apprenants » ni de déléguer. Il n'existe aucun journal d'audit des actions sensibles (qui a confirmé tel paiement, qui a révoqué tel certificat).
- C'est ce que traite la section 4 (profils Financier / Manager).

#### M9 — Contrôle d'accès par ressource (IDOR) : à prouver par des tests
- Le routage par rôle est bon, mais la question « cet apprenant a-t-il le droit de voir *cette* inscription / *cette* note / *ce* post ? » dépend du code de chaque service. Une `SessionAccessPolicy` existe pour le suivi de session (bonne pratique) ; il faut vérifier systématiquement : `/learner/**` (notes, paiements, documents, communauté), espace PARTNER (uniquement ses formations), TRAINER (uniquement ses sessions).
- **Action** : écrire une suite de tests d'intégration « apprenant A tente d'accéder aux ressources de B » et « partenaire X tente d'accéder aux formations de Y » sur chaque endpoint paramétré par identifiant. Faible coût, forte valeur.

#### M10 — Liens publics fondés sur un jeton (paiement, facture, reçu, certificat)
- Acceptable (256 bits, expirants), mais : `GET /payments/{token}` n'est pas limité en débit (les routes `/invoice` et `/receipt` le sont) ; le jeton circule dans l'URL (historique, journaux du proxy, en-tête `Referer`).
- **Correctif** : limiter le débit des 3 routes, `Referrer-Policy: no-referrer` sur ces pages, ne pas journaliser le chemin complet côté proxy, durée de vie courte après règlement.

#### M11 — Téléversement d'images : contrôle du type par l'en-tête fourni par le client
- `StorageServiceImpl.validateFile` ne vérifie que `Content-Type` (contrôlé par l'émetteur) ; l'extension vient du nom de fichier ; le type est enregistré tel quel. Un SVG (`image/svg+xml`) peut contenir du script.
- **Atténuation** : routes réservées au personnel et fichiers servis depuis un autre domaine que le site (MinIO).
- **Correctif** : détecter le type réel (en-têtes magiques), refuser SVG ou l'assainir, ré-encoder les images, servir avec `Content-Disposition` et `X-Content-Type-Options: nosniff`, domaine de médias dédié sans cookie.

#### F1 — Exposition de données dans les API publiques
- `GET /alumni` renvoie un « résumé » (bien) alors que l'entité complète contient e-mail et téléphone : à garder en tête (jamais de DTO complet côté public).
- Les erreurs de l'API affichent parfois le message d'exception d'origine (`StorageException("… " + e.getMessage())`) : peut révéler des détails d'infrastructure.

#### F2 — Exports CSV (newsletter, suivi de session)
- Risque d'« injection de formule » (cellule commençant par `=`, `+`, `-`, `@` ouverte dans Excel). Préfixer ces valeurs d'une apostrophe à l'export.

#### F3 — Divers
- `.env` du dépôt front est suivi par Git (il contient la clé de site reCAPTCHA, publique, et l'adresse IP interne de dev) : pas un secret, mais retirer du suivi pour éviter qu'un secret y soit ajouté un jour.
- Aucune analyse automatique des dépendances ni des secrets dans l'historique Git : à ajouter (voir plan).

---

## 4. Menaces demandées, une par une

| Menace | Situation actuelle | Ce qu'il faut |
|--------|--------------------|---------------|
| **Injection SQL** | Non exploitable (JPA paramétré, SQL natif constant) | Garder la règle : interdire la concaténation dans la revue de code ; test statique (Semgrep) dans la CI |
| **XSS** | Aucun point d'entrée trouvé ; la CSP manque | CSP stricte, ne jamais introduire `dangerouslySetInnerHTML` sans assainissement (DOMPurify) |
| **CSRF** | Non applicable aujourd'hui (jeton en en-tête) | À réactiver dès qu'on passe aux cookies |
| **Force brute / bourrage d'identifiants** | Verrouillage 5 essais + 30 connexions/h/IP | MFA, verrouillage par (e-mail, IP), CAPTCHA progressif, alertes |
| **Énumération de comptes** | Bien traitée sur « mot de passe oublié » et lien ; **non** sur la connexion (message 429 « trop de tentatives » révèle qu'un compte existe) | Message identique et verrouillage « silencieux » côté réponse |
| **DDoS / abus** | Limiteur en mémoire par IP sur les formulaires et la connexion | Voir §7 : limitation à la périphérie (Traefik/Cloudflare), pas seulement dans l'application |
| **Vol de session** | Jeton 24 h dans `localStorage` | Voir E2 |
| **Élévation de privilèges** | Rôles cloisonnés par URL ; création de comptes réservée au SUPER_ADMIN | Tests IDOR/rôles, audit des actions sensibles |
| **SSRF** | Un seul appel sortant à une URL fixe (reCAPTCHA) ; webhook Slack configuré par variable d'environnement | RAS ; ne jamais accepter d'URL fournie par un utilisateur pour un appel sortant |
| **Fichiers malveillants** | Documents : extensions en liste blanche, stockés opaques ; images : contrôle faible | M11 + analyse antivirus (ClamAV) pour les dépôts d'apprenants |
| **Fuite de données** | Bucket public (C1), journaux avec PII | C1, minimisation des journaux, chiffrement des sauvegardes |
| **Chaîne d'approvisionnement** | Pas d'audit des dépendances, images non épinglées | `npm audit`, OWASP Dependency-Check, Dependabot/Renovate, SBOM |
| **Sauvegardes / reprise** | Non documentées dans le dépôt | Sauvegarde PostgreSQL quotidienne chiffrée hors serveur + test de restauration trimestriel |

---

## 5. Profils « Financier » et « Manager » : analyse et recommandation

### 5.1 Besoin exprimé

- **Financier** : paiements, accès au tableau de bord, partenaires, apprenants, candidatures, factures, certificats, codes de parrainage.
- **Manager** : domaines, formations, sessions, candidatures, apprenants, inscriptions, masterclass, bloc Relations (newsletter, messages, communauté, e-mails), contenu du site.
- Chaque profil ne voit que ses actions ; le **Super Admin attribue et retire des fonctionnalités à un profil**.

### 5.2 Modèle recommandé : RBAC à permissions (rôle → ensemble de permissions)

Au lieu de tester des rôles dans les URL, on teste des **permissions** (`PAYMENTS_VIEW`, `PAYMENTS_CONFIRM`, `LEARNERS_MANAGE`, `CONTENT_EDIT`…). Un **profil** est un ensemble de permissions modifiable par le Super Admin ; un utilisateur reçoit un ou plusieurs profils.

```
permissions        (code, libellé, groupe)                 ← fixées par le code (catalogue)
profiles           (id, nom, description, système O/N)     ← SUPER_ADMIN, FINANCIER, MANAGER, ...
profile_permissions(profile_id, permission_code)           ← modifiable par le Super Admin
admin_user_profiles(user_id, profile_id)
audit_log          (qui, quand, action, cible, avant/après, IP)
```

**Catalogue de permissions proposé (une par « domaine fonctionnel » et par niveau lire/écrire)**

| Groupe | Permissions | Financier | Manager |
|--------|-------------|:--:|:--:|
| Tableau de bord | `DASHBOARD_VIEW` | ✔ | (à décider) |
| Paiements | `PAYMENTS_VIEW`, `PAYMENTS_CONFIRM`, `PAYMENTS_REFUND` | ✔ | – |
| Factures | `INVOICES_VIEW`, `INVOICES_MANAGE` | ✔ | – |
| Certificats | `CERTIFICATES_VIEW`, `CERTIFICATES_MANAGE` | ✔ | – |
| Codes de parrainage / promo | `PROMO_MANAGE` | ✔ | – |
| Partenaires | `PARTNERS_MANAGE` | ✔ | – |
| Candidatures | `APPLICATIONS_VIEW`, `APPLICATIONS_DECIDE` | ✔ | ✔ |
| Apprenants | `LEARNERS_VIEW`, `LEARNERS_MANAGE` | ✔ | ✔ |
| Inscriptions | `ENROLLMENTS_MANAGE` | – | ✔ |
| Domaines, formations, sessions | `CATALOG_MANAGE`, `SESSIONS_MANAGE` | – | ✔ |
| Masterclass | `MASTERCLASS_MANAGE` | – | ✔ |
| Relations | `NEWSLETTER_MANAGE`, `MESSAGES_MANAGE`, `COMMUNITY_MODERATE`, `EMAIL_LOGS_VIEW` | – | ✔ |
| Contenu du site | `SITE_CONTENT_EDIT` | – | ✔ |
| Administration | `ACCOUNTS_MANAGE`, `PROFILES_MANAGE`, `AUDIT_VIEW` | – | – (Super Admin seul) |

Points d'attention métier à trancher avec vous :
1. **Candidatures, apprenants** sont communs aux deux profils : le Financier voit et décide sur le volet paiement, le Manager sur le volet pédagogique ? Ou accès identique ? Cela détermine si on a besoin de permissions séparées (lecture / décision).
2. Les rôles existants `ADMIN`, `EDITOR`, `TRAINER`, `PARTNER`, `LEARNER` sont **conservés** (ils deviennent des profils prédéfinis) pour ne pas casser l'existant ; `PARTNER` et `TRAINER` restent liés à *leurs* ressources (contrôle par ressource en plus de la permission).
3. Le **Super Admin ne peut pas se retirer ses propres droits** et il doit toujours rester au moins un Super Admin.

### 5.3 Mise en œuvre (sans casser l'existant)

**Backend (≈ 5-7 j)**
1. Migrations Flyway : tables ci-dessus + peuplement initial qui reproduit exactement les droits actuels (aucun changement de comportement au départ).
2. Remplacement progressif de `hasAnyRole(...)` par `@PreAuthorize("hasAuthority('PAYMENTS_CONFIRM')")` ; les autorités sont chargées dans `UserDetailsServiceImpl` à chaque requête (comme les rôles aujourd'hui, donc effet immédiat).
3. API d'administration `GET/POST/PUT /admin/profiles`, `PUT /admin/profiles/{id}/permissions`, affectation aux comptes (`SUPER_ADMIN` uniquement).
4. Journal d'audit (aspect AOP sur les actions sensibles) + consultation.
5. Tests : matrice « profil × endpoint » (un test paramétré qui vérifie 200/403 pour chaque couple).

**Front (≈ 3-4 j)**
1. Le profil renvoyé par `/auth/me` contient la liste de permissions ; `usePermission('PAYMENTS_VIEW')`.
2. Menu et boutons masqués selon permissions (rappel : le masquage est de l'ergonomie, **la vraie protection est côté serveur**).
3. Page Super Admin « Profils & droits » : liste des profils, cases à cocher par groupe, affectation aux comptes.

**Total : 8 à 12 jours.** Coût élevé mais structurant ; la valeur sécurité est réelle (principe du moindre privilège, délégation, traçabilité). **Recommandation : à planifier après les correctifs critiques (§6, phases 0 à 2)**, car un profil « Financier » n'a de sens que si le compte de ce profil est protégé par MFA.

### 5.4 Faut-il Keycloak (ou un autre SSO) ?

| Critère | Garder l'authentification actuelle (étendue) | Keycloak |
|---------|---------------------------------------------|----------|
| MFA (TOTP, codes de secours) | À développer (~3-4 j, bibliothèque éprouvée) | Natif |
| Rôles/permissions administrables | À développer (§5.3) | Rôles natifs, mais **permissions fines et règles « par ressource » restent à coder** dans l'application |
| SSO entre site, academy, mobile, partenaires | Non | **Oui, c'est sa vraie valeur** |
| Connexion Google, lien magique, code WhatsApp | Déjà développés et en production locale | À reconfigurer ; le lien magique / code requiert des extensions ou du développement |
| Coût d'exploitation | Nul | Service Java supplémentaire (≈ 1 Go de RAM), base dédiée, mises à jour de sécurité, sauvegardes, haute disponibilité à votre charge |
| Risque de migration | Faible | Réécriture de l'authentification, migration des mots de passe (BCrypt compatible), jetons différents (OIDC), refonte du front |
| Surface d'attaque | Votre code | Un produit très ciblé à maintenir à jour |

**Recommandation : ne pas adopter Keycloak maintenant.** Les deux besoins immédiats (MFA, permissions) se règlent plus vite et à moindre coût dans l'application. Le SSO devient pertinent quand il y aura **plusieurs applications** (academy séparée, mobile, portail partenaire) : prévoyez alors soit Keycloak, soit une solution gérée (Auth0, Clerk, AWS Cognito, ou Keycloak hébergé). Pour garder cette porte ouverte, concevez dès maintenant : jetons au format standard (`iss`, `aud`, `scope`/`permissions`), un identifiant utilisateur stable (UUID, déjà le cas), et **aucun couplage entre l'authentification et les tables métier** hors `user_id`.

### 5.5 MFA : proposition concrète

- **Obligatoire** pour tous les profils du personnel (Super Admin, Financier, Manager, Admin, Editor) ; **optionnel puis recommandé** pour les apprenants ; non requis pour le lien de paiement public.
- **TOTP** (application d'authentification) + **10 codes de secours** à usage unique, stockés hachés. Pas de SMS comme seul facteur (détournement de carte SIM).
- Activation forcée à la première connexion après déploiement (délai de grâce de 7 jours maximum), réinitialisation du MFA possible **uniquement par un autre Super Admin** avec trace d'audit.
- Les routes « lien par e-mail » et « Google » ne doivent plus suffire pour le personnel : second facteur exigé après.
- Alertes e-mail à chaque nouvelle connexion depuis un appareil inconnu et à chaque changement de mot de passe ou de MFA.

### 5.6 Décisions arrêtées (12 octobre 2026)

**Répartition Financier / Manager** — arbitrée par la logique « qui porte la responsabilité de l'acte » ; le Super Admin pourra tout rééquilibrer ensuite depuis la page Profils & droits.

| Domaine | Permission | Financier | Manager | Raison |
|---|---|:--:|:--:|---|
| Tableau de bord | `DASHBOARD_VIEW` | ✔ | ✘ | **Décision PO : le Manager ne voit pas le tableau de bord** (il contient les encaissements) |
| Paiements (confirmer, refuser, relancer, rembourser, enregistrer un paiement hors site) | `PAYMENTS_VIEW`, `PAYMENTS_CONFIRM`, `PAYMENTS_REFUND` | ✔ | ✘ | Acte financier |
| Factures | `INVOICES_VIEW`, `INVOICES_MANAGE` | ✔ | ✘ | |
| Certificats | `CERTIFICATES_VIEW`, `CERTIFICATES_MANAGE` | ✔ | ✘ | Dans la liste du Financier (décision PO) |
| Codes de parrainage / promo | `PROMO_MANAGE` | ✔ | ✘ | Impact sur le prix |
| Partenaires (dont part de revenu) | `PARTNERS_MANAGE` | ✔ | ✘ | Part de revenu = financier |
| Candidatures | `APPLICATIONS_VIEW`, `APPLICATIONS_DECIDE` (accepter, refuser, fixer montant et échéances) | ✔ | ✔ | Les deux « gèrent les candidatures » ; le Manager voit le statut de paiement en **lecture seule** |
| Apprenants (invitation, désactivation, accès aux sessions) | `LEARNERS_VIEW`, `LEARNERS_MANAGE` | ✔ | ✔ | L'historique de paiement d'un apprenant n'est visible qu'avec `PAYMENTS_VIEW` |
| Inscriptions (dont inscription manuelle) | `ENROLLMENTS_MANAGE` | ✘ | ✔ | Acte pédagogique ; l'enregistrement du paiement associé reste au Financier |
| Domaines, formations, sessions | `CATALOG_MANAGE`, `SESSIONS_MANAGE` | ✘ | ✔ | |
| Masterclass | `MASTERCLASS_MANAGE` | ✘ | ✔ | |
| Relations : newsletter, messages, communauté, e-mails | `NEWSLETTER_MANAGE`, `MESSAGES_MANAGE`, `COMMUNITY_MODERATE`, `EMAIL_LOGS_VIEW` | ✘ | ✔ | |
| Contenu du site | `SITE_CONTENT_EDIT` | ✘ | ✔ | |
| Comptes, profils, journal d'audit | `ACCOUNTS_MANAGE`, `PROFILES_MANAGE`, `AUDIT_VIEW` | ✘ | ✘ | Super Admin uniquement |

Règles qui accompagnent ce découpage :
- les rôles existants `ADMIN` (tout sauf les comptes), `EDITOR`, `TRAINER` et `PARTNER` sont conservés comme profils prédéfinis ; `TRAINER` et `PARTNER` restent bornés à leurs sessions / leurs formations en plus de la permission ;
- un profil peut cumuler les deux (un même collaborateur Financier + Manager) ;
- le dernier Super Admin ne peut ni se rétrograder ni se supprimer ; il faut toujours au moins **deux** Super Admins actifs ;
- toute action sensible (confirmation, remboursement, modification de profil, désactivation de compte, export) est écrite dans le journal d'audit.

**MFA obligatoire pour tout accès au back-office dès la mise en production** (décision PO) :
- périmètre : **tous** les comptes qui atteignent `/admin` — Super Admin, Admin, Financier, Manager, Editor, Trainer, Partner ; les apprenants en sont exclus ;
- aucun délai de grâce : l'enrôlement (application TOTP + 10 codes de secours) est exigé **à la première connexion** et bloque l'accès au back-office tant qu'il n'est pas fait ; les comptes existants sont enrôlés avant l'ouverture au public ;
- la connexion par lien/code e-mail et par Google reste possible pour le personnel **uniquement comme premier facteur** : le code TOTP est demandé ensuite ;
- réinitialisation du MFA d'un compte : par un autre Super Admin, avec trace d'audit et notification au titulaire ; procédure de dernier recours documentée (accès base de données) en cas de perte des deux Super Admins ;
- le jeton émis après connexion porte l'information « MFA validé » ; le serveur refuse les routes `/admin/**` sinon.

---

## 6. Plan de remédiation séquencé

Chaque phase est livrable seule (une PR par lot, comme convenu).

| Phase | Contenu | Effort | Dépend de |
|-------|---------|--------|-----------|
| **0 — Urgence infra** ✅ *réalisée côté code le 12 oct.* | C1 bucket : lecture seule limitée aux images publiques, justificatifs en lien signé · C2 Adminer et Dozzle retirés (outils à la demande sur 127.0.0.1) · M1 Swagger et DEBUG fermés en staging · aucun port interne publié (vérifié dans les compose) · sauvegardes PostgreSQL chiffrées + test de restauration (scripts testés). **Reste à faire par vous sur le serveur : supprimer les domaines, déployer, appliquer la politique, faire tourner les secrets** | 2 j | accès au serveur |
| **1 — Durcissement web** | M2 CSP + HSTS + Permissions-Policy (report-only puis bloquant) · M3 images épinglées, `npm ci`, nginx non-root · M8 reCAPTCHA (échec = refus) · M10 limitation des routes de jeton · F2 exports CSV · retirer `.env` du suivi Git | 3 j | – |
| **2 — Sessions et authentification** | E2 jeton court + refresh en cookie HttpOnly + révocation par version de sécurité · CSRF · E1 MFA TOTP obligatoire du personnel + codes de secours · M5/M6/M7 verrouillage, mots de passe, hachage du code | 8-10 j | phase 1 (CSP) |
| **3 — Profils et audit** | §5.3 permissions, profils Financier/Manager, page Super Admin, journal d'audit, tests matriciels · M9 tests IDOR | 8-12 j | phase 2 (MFA) |
| **4 — Automatisation** | CI : `npm audit`, OWASP Dependency-Check, Semgrep/CodeQL, analyse des secrets (gitleaks), analyse d'images (Trivy) · Dependabot/Renovate · SBOM · M11 contrôle réel des images + antivirus des dépôts · pentest externe léger avant ouverture au grand public | 3-4 j + test externe | – |
| **5 — Exploitation** | Journalisation centralisée sans données personnelles, alertes (échecs de connexion en rafale, 5xx), supervision (Uptime, métriques), plan de réponse à incident d'une page, rotation planifiée des secrets | 3 j | phase 0 |

**Total sécurité : ≈ 27 à 35 jours-personne**, dont ≈ 5 jours « urgents » (phases 0-1). Le périmètre fonctionnel étant figé, cet ordre protège d'abord ce qui peut faire le plus de dégâts (données et paiements), puis les comptes, puis les droits fins.

---

## 7. Montée en charge : 10 → 50 → 100 utilisateurs simultanés

### 7.1 Ce que « 100 simultanés » représente vraiment
Pour un site de formation, 100 utilisateurs *connectés* en même temps génèrent typiquement **20 à 60 requêtes par seconde au pic** (la plupart sont des fichiers statiques servis par nginx/CDN, pas du travail backend). Les vidéos (Vimeo/YouTube) ne passent pas par votre serveur. **Un VPS Contabo de 8 Go gère ce niveau sans difficulté** si la configuration est correcte. Le risque n'est pas la puissance brute mais cinq points précis :

| Point | Situation actuelle | Risque à 50-100 | Action |
|-------|-------------------|----------------|--------|
| **Pool de connexions BDD** | Hikari `maximum-pool-size: 10` | File d'attente et latence dès ~40-50 requêtes simultanées | Passer à 20-30 et vérifier `max_connections` de PostgreSQL ; mesurer |
| **Mémoire JVM** | `MaxRAMPercentage=75` sans limite de conteneur | Concurrence avec PostgreSQL et MinIO sur 8 Go | Définir des limites par conteneur : backend 1,5-2 Go, PostgreSQL 2 Go, MinIO 512 Mo |
| **Génération de PDF** (certificats, factures, reçus) | Synchrone dans la requête | Pic CPU quand plusieurs apprenants téléchargent | Mettre en cache le PDF généré (stockage privé), file d'attente asynchrone pour les envois en masse |
| **Limiteur de débit en mémoire** | État dans la JVM | Se réinitialise au redémarrage ; **ne fonctionne plus à plusieurs instances** | Déporter à la périphérie (Traefik / Cloudflare) ou dans Redis |
| **Envois d'e-mails** | Via SMTP Gmail | Plafonds d'envoi Gmail (≈ 500/jour), blocages | Passer à un service transactionnel (Brevo, Postmark, Amazon SES) avant les envois en masse |

### 7.2 Paliers

**Palier 1 — jusqu'à ~50 simultanés (aujourd'hui + corrections de configuration)**
- Un seul serveur ; pool BDD à 20-30 ; limites mémoire par conteneur ; index SQL vérifiés sur les requêtes fréquentes (`EXPLAIN` sur les 10 requêtes les plus lentes) ; mise en cache HTTP des données publiques (formations, contenu du site, `Cache-Control` court) ; compression activée ; supervision basique.
- **Coût supplémentaire : quasi nul.**

**Palier 2 — 50 à 100 simultanés**
- Ajouter **Cloudflare** (offre gratuite) devant le site : CDN pour les fichiers statiques et les médias, protection DDoS de couche 7, règles de limitation de débit, cache de l'API publique. C'est le gain le plus fort pour le coût le plus faible.
- Service d'e-mails transactionnels ; médias servis depuis un CDN ; **pgBouncer** devant PostgreSQL si le nombre de connexions devient un frein.
- Séparer physiquement la base de données (second petit serveur ou base gérée) *si* la mémoire est saturée.
- **Coût : 0 à 40 €/mois.**

**Palier 3 — au-delà de 100, ou exigence de disponibilité**
- Deux instances du backend derrière le proxy (c'est possible car le backend est **sans état** côté session : bon point de conception) ; état partagé (limiteur de débit, verrous planifiés) dans Redis ; **PostgreSQL géré** avec sauvegardes et réplique de lecture ; stockage objet géré (S3 compatible) à la place de MinIO ; tâches planifiées avec verrou (ShedLock) pour éviter qu'elles s'exécutent deux fois.

### 7.3 Contabo ou DigitalOcean (ou autre) ?

| | Contabo VPS (actuel) | DigitalOcean / Scaleway / OVH / Hetzner Cloud |
|--|--------------------|----------------------------------------------|
| Rapport puissance/prix | Excellent (8 Go pour très peu cher) | Plus cher à ressources égales |
| Performances E/S, régularité | Variable (mutualisation importante) | Plus stables |
| Services gérés (base, stockage objet, équilibreur, sauvegardes) | Non | Oui, c'est la vraie raison de migrer |
| Haute disponibilité | À construire vous-même | Équilibreur + plusieurs instances + base gérée |
| Région / latence vers l'Afrique de l'Ouest | Europe | Europe (Paris/Amsterdam/Francfort) ; peu de différence |

**Recommandation** : **rester sur Contabo à court terme** (palier 1 puis 2, avec Cloudflare). Migrer vers une plateforme avec services gérés **quand l'un de ces déclencheurs apparaît** : (a) vous avez besoin d'une disponibilité garantie (engagement sur le service à vos clients entreprises), (b) l'exploitation de la base et des sauvegardes vous prend trop de temps, (c) plus de ~150-200 utilisateurs simultanés réguliers. Dans ce cas, ordre de migration à moindre risque : stockage objet → base de données → application. Choisissez un fournisseur avec région UE et conformité RGPD/loi sénégalaise 2008-12 sur les données personnelles.

### 7.4 Ce que la conception doit garantir dès maintenant (pour ne pas bloquer le futur)
- Backend **sans état** (déjà vrai) : aucune session serveur, pas de fichiers locaux.
- Configuration par variables d'environnement (déjà vrai) et **aucune adresse codée en dur**.
- Tâches planifiées idempotentes ; migrations de base compatibles avec deux versions qui tournent côte à côte (pas de suppression de colonne en une seule étape).
- Fichiers dans un stockage objet (déjà vrai), liens signés pour le privé.
- Mesure : exposer des métriques (Micrometer/Prometheus) et fixer des seuils (latence p95 < 500 ms, erreurs 5xx < 1 %) ; **faire un test de charge** (k6) avec 50 puis 100 utilisateurs virtuels avant chaque grosse session de formation.

---

## 8. Séparer l'espace apprenant (academy.model-technologie.com) et prévoir le mobile

### 8.1 Trois niveaux de séparation (du moins coûteux au plus coûteux)

| Niveau | Description | Coût | Quand |
|--------|-------------|------|-------|
| **A. Contrat d'API séparé** | Même dépôt, mais préfixes et DTO distincts : `/api/v1/public/**`, `/api/v1/admin/**`, `/api/v1/learner/**`, `/api/v1/mobile/**` (si besoin de payloads allégés) ; versionnement (`/v1`, `/v2`) ; documentation OpenAPI par groupe | Faible (déjà largement le cas) | **Maintenant** |
| **B. Application web séparée, même backend** | Un projet front `academy` (Vite) sur `academy.model-technologie.com`, déployé indépendamment ; le site public et le back-office restent sur le domaine principal ; le backend accepte plusieurs origines CORS | Moyen (≈ 5-8 j : extraction, build, routage, jeton partagé ou connexion propre) | Quand les cycles de livraison diffèrent |
| **C. Backend séparé (service apprenant)** | Un second service avec sa propre base ou schéma | Élevé | À éviter tant que l'équipe est petite |

**Recommandation : A tout de suite, B dans un second temps, jamais C avant d'en avoir besoin.**

### 8.2 Ce que cela change côté sécurité (bénéfices)
- **Isolation des origines** : un défaut dans le site marketing (contenu éditable) ne peut plus lire le stockage navigateur de l'espace apprenant, ni inversement. Le back-office peut vivre sur un troisième domaine (`admin.model-technologie.com`) avec une CSP très stricte et un accès restreint par IP/VPN.
- **Cookies** : cookie de session limité à `academy.model-technologie.com` (`HttpOnly`, `Secure`, `SameSite=Strict`) ; cookies distincts pour l'admin.
- **CORS** : liste blanche explicite par domaine ; plus aucun joker.
- **Jetons** : claim `aud` (audience) = `academy`, `admin` ou `mobile` ; le backend refuse un jeton « admin » sur une route académie et inversement.

### 8.3 Version mobile
- Le mobile est un **client de plus** de la même API (React Native, Flutter ou PWA — la PWA existe déjà, avec la vidéo hors ligne). Il ne doit pas avoir de routes à lui tant que les besoins sont identiques.
- Particularités à prévoir : authentification par **OAuth2 + PKCE** (jamais d'identifiants dans l'application), jetons stockés dans le coffre sécurisé du système (Keychain / Keystore), **épinglage de certificat** optionnel, notifications push (FCM/APNs) avec table d'appareils, versionnement d'API avec politique de dépréciation (une application mobile ne se met pas à jour comme un site : on garde `v1` actif 12 mois), `X-App-Version` pour imposer une mise à jour minimale.
- C'est le moment où un fournisseur d'identité standard (OIDC) prend de la valeur : un seul service de connexion pour le site, l'academy, l'admin et le mobile (voir 5.4).

### 8.4 Ordre conseillé
1. Fermer les failles (phases 0-2). 2. Profils et audit (phase 3). 3. Nettoyer le contrat d'API par audience (niveau A) en même temps que les profils. 4. Extraire l'academy (niveau B) avec jeton `aud` et cookie dédié. 5. Mobile.

---

## 9. Décisions

| # | Sujet | État |
|---|---|---|
| 1 | Phase 0 (infrastructure) | **Autorisée et réalisée côté code** (12 oct.). À vous : supprimer les domaines, déployer, faire tourner les secrets (voir `docs/ops/phase-0-securite.md`) |
| 2 | Répartition Financier / Manager | **Arrêtée** (§5.6) ; Manager sans tableau de bord |
| 3 | MFA | **Obligatoire pour tout le back-office dès la mise en production** (§5.6) |
| 4 | Keycloak | Reporté (§5.4) |
| 5 | Prochaine étape | Phase 1 (en-têtes de sécurité, images épinglées, reCAPTCHA, jetons de liens, `.env`), puis phase 2 (sessions + MFA) : à lancer sur votre feu vert |
| 6 | Test d'intrusion externe | À décider après la phase 2 |
| 7 | Copie des sauvegardes hors serveur | À choisir (bucket S3 d'un autre fournisseur recommandé) |

---

## 10. Annexe — vérifications que je recommande de faire sur le serveur (10 minutes)

```
# Depuis l'extérieur du VPS (pas depuis le serveur)
nmap -Pn -p- <ip-du-vps>                       # seuls 22 (restreint), 80, 443 doivent répondre
curl -I https://<domaine-minio>/media/         # doit refuser le listing
curl -X PUT -T test.txt https://<domaine-minio>/media/test.txt   # doit être refusé (403)
curl -I https://<domaine-adminer>              # ne doit pas répondre
curl -I https://<domaine-api>/swagger-ui.html  # doit être 404/401 en staging et prod
curl -I https://<domaine-site>/                # chercher Content-Security-Policy, Strict-Transport-Security
```

Si `curl -X PUT` sur le bucket réussit, c'est un incident : retirer immédiatement l'accès anonyme et contrôler le contenu du bucket.
