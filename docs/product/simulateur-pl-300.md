# Simulateur PL-300 — proposition business, architecture et plan d'implémentation (validée le 2026-11-01)

## 0. Résumé et recommandation

**Demande de la direction** : une offre « simulateur de certification PL-300 » pour les profils déjà expérimentés qui veulent passer l'examen sans suivre le cours vidéo complet, alignée sur les évaluations de préparation de Microsoft Learn, avec tentatives, examens blancs et labs.

**Recommandation : GO sous conditions.**
- **Business** : c'est une offre d'entrée **à forte marge et à faible coût de service**, qui élargit la cible (experts qui n'achèteraient jamais un bootcamp complet) et nourrit l'entonnoir (simulateur → coaching → bootcamp, licences entreprises/écoles). Le vrai investissement n'est pas le code, c'est le **contenu de qualité** (≈ 600 questions originales + labs) : c'est lui qui conditionne le calendrier.
- **Technique** : on **réutilise** l'essentiel de la plateforme (comptes apprenants, quiz, pièces jointes MinIO, audit, permissions, notifications, paiements), mais le moteur d'examen demande un **nouveau module** (`simulator`) : le quiz actuel (QCM à choix unique rattaché à une leçon) est trop limité pour un examen (types de questions, chronomètre serveur, blueprint, études de cas, notation par compétence).
- **Sécurité** : le principal actif à protéger est la **banque de questions** (fuite = perte de valeur). Elle se protège dès la conception : barème jamais envoyé au navigateur avant correction, notation côté serveur, minuteur serveur, filigrane, limitation de débit, accès par droits d'usage nominatifs.
- **Décisions déjà prises avec vous** : questions **en anglais + explications en français** · **forfaits à durée limitée** · **paiement en ligne automatisé** · **MVP resserré** (examens blancs + banque par domaine ; labs en version 2).
- **Calendrier réaliste** : MVP vendable en **≈ 10 à 12 semaines** à partir du lancement du contenu ; version complète (labs, plan de révision, entreprises) en **≈ 5 mois**.

Prérequis de gestion : on travaille depuis `staging` (la copie de travail principale y est déjà) ; chaque lot sur sa **branche** issue de `staging`, **dans un worktree** pour ne pas toucher aux fichiers non commités de la direction.

---

## 1. Analyse business

### 1.1 Ce que dit le marché (faits vérifiés et hypothèses)

| Point | Constat | Source / statut |
|---|---|---|
| Examen PL-300 | Compétences mesurées **au 20 avril 2026** : Préparer les données 25–30 % · Modéliser les données 25–30 % · Visualiser et analyser 25–30 % · Gérer et sécuriser Power BI 15–20 %. Score de réussite : **700**. Renouvellement annuel **gratuit** en ligne | [Guide d'étude Microsoft Learn](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-300) |
| Contenu récent | Nouveautés : Copilot, DirectLake, calculs visuels, calcul groups, modèles sémantiques partagés | Même guide |
| Pratique officielle gratuite | Nouvelle « Practice Assessment » sur AI Skills Navigator ; l'ancienne version sur Learn **n'est plus mise à jour** | Même guide |
| Langues | Mise à jour **en anglais d'abord**, localisations ~8 semaines après ; **disponibilité du français non confirmée** ; +30 min accordées si l'examen n'est pas dans la langue du candidat | Même guide, [recherche](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-300) |
| Prix de l'examen | ≈ 165 USD aux États-Unis, **variable selon le pays** ; prix Sénégal **à vérifier** sur Pearson VUE | Sources tierces ([Readynez](https://www.readynez.com/uk/blog/microsoft-pl-300-cost-how-much-is-it/)) |
| Concurrence payante | MeasureUp (partenaire officiel Microsoft) ≈ 99 USD, jusqu'à ≈ 130–144 USD chez des revendeurs ; Udemy ≈ 16–55 USD ; Whizlabs ≈ 20–30 USD (estimation tierce) | [Comparatif](https://mscertquiz.com/blog/mscertquiz-vs-measureup-vs-whizlabs), [Udemy](https://www.udemy.com/course/pl-300-microsoft-power-bi-data-analyst-full-practice-exams/) — **prix à revérifier** |
| Cadre d'intégrité | Microsoft interdit la reproduction des questions d'examen (accord de confidentialité) et poursuit les sites de « dumps » | [Politique Microsoft](https://learn.microsoft.com/en-gb/archive/blogs/betaexams/certification-exams-ndas-and-responsible-behavior) |

### 1.2 Positionnement de Model Technologie

**Promesse** : « Passez le PL-300 en préparant *exactement* ce qui est mesuré, avec un entraînement chronométré, des explications en français et un plan de révision personnalisé. »

**Différenciation défendable** (on ne se bat pas sur le prix contre Udemy) :
1. **Alignement documenté** sur le guide de compétences en vigueur (version datée, tableau de couverture visible par le client), mise à jour sous ~4 semaines après chaque évolution de Microsoft.
2. **Explications en français** de chaque question (pourquoi la bonne réponse, pourquoi les pièges) sur des questions en anglais fidèles à l'examen.
3. **Indice de préparation** par compétence (pas seulement un pourcentage global) et **plan de révision** adapté.
4. **Labs sur des cas locaux** (télécoms, distribution, finance, jeux de données en FCFA) et accompagnement humain en option.
5. **Preuve sociale** : taux de réussite des alumni, témoignages (déjà gérés sur le site).
6. **Complémentarité assumée** avec les ressources gratuites de Microsoft (on les cite et on s'en sert comme porte d'entrée).

### 1.3 Cibles et parcours de valeur

| Segment | Besoin | Offre |
|---|---|---|
| Analystes / contrôleurs de gestion / experts Excel expérimentés | Valider un acquis, gagner du temps | Forfait Pro |
| Salariés financés par leur employeur | Justificatif, rapport de progression | Forfait Pro + licence entreprise |
| Étudiants (universités, écoles) | Prix doux, volume | Licences établissements (phase ultérieure) |
| Anciens du bootcamp ou candidats ayant échoué | Repasser avec un entraînement ciblé | Forfait Essentiel / Pro, coupon alumni |
| Prospects hésitants face au bootcamp | Tester Model Technologie à petit prix | Examen blanc d'essai gratuit → forfaits |

**Échelle de valeur** : *examen blanc d'essai gratuit* (capture de contact) → **Essentiel** → **Pro** → **Pro + coaching** → *bootcamp / coaching entreprise*.

### 1.4 Offre et prix (hypothèses à tester par précommande)

| Forfait | Contenu | Durée | Prix **hypothèse** |
|---|---|---|---|
| Essentiel | Banque par domaine + 2 examens blancs, 3 tentatives chacun | 30 jours | 25 000 FCFA |
| Pro | Banque complète + 5 examens blancs (50 questions chacun, 100 min) + indice de préparation + plan de révision + labs guidés (v2) | 90 jours | 45 000 FCFA |
| Pro + coaching | Pro + 2 séances d'1 h avec un formateur (réservation en ligne) | 90 jours | 75 000 FCFA |
| Entreprise / école | Licences nominatives par lots, tableau de bord de cohorte (avec consentement) | Annuel | Sur devis |

Repères : 1 USD ≈ 600 FCFA, soit MeasureUp ≈ 60–85 000 FCFA, Udemy ≈ 10–33 000 FCFA. Les trois paliers se situent **entre** la pratique low-cost et l'offre officielle. **Valider** par une page de précommande avant d'investir dans le contenu (porte de décision S0).

### 1.5 Équilibre économique (illustratif — remplacer par le vrai budget)

- Production de contenu estimée à **≈ 1 100 h** (600 questions × 1,5 h entre rédaction, vérification technique dans Power BI Desktop et relecture ; 15 labs × 8 h ; jeux de données et assurance qualité).
- Hypothèse de coût de revient 5 000 FCFA/h → **≈ 5,5 M FCFA** de contenu ; ajouter le développement (≈ 5 mois-équipe).
- Point mort = investissement total ÷ marge nette par vente. Exemple : 12 M FCFA ÷ 38 000 FCFA nets ≈ **315 ventes** (marge nette = prix − frais du prestataire de paiement ≈ 2–3 % − support).
- **Leviers** : ventes croisées coaching/bootcamp, licences entreprises, réutilisation du moteur pour d'autres certifications (DP-600, AZ-900, PL-900, DP-700) — **le moteur est générique, seul le contenu change**.

### 1.6 Risques business et parades

| Risque | Parade |
|---|---|
| Perception « dump » ou litige Microsoft | Questions **100 % originales**, jamais de vraies questions d'examen, mention « indépendant, non affilié à Microsoft », processus de conformité (§3) |
| Contenu qui vieillit (Microsoft met à jour l'examen ~2 fois/an) | Chaque question rattachée à une version du guide ; revue semestrielle planifiée ; tableau de bord de couverture |
| Partage de comptes / fuite de la banque | Droits nominatifs, limite de sessions, filigrane, détection d'anomalies, pas d'export |
| Prix trop bas pour le support | Aide en libre-service, questions signalées par les apprenants, coaching vendu à part |
| Capacité de l'équipe (backlog existant) | Lots courts, content lead dédié, porte de décision S0 |

### 1.7 Indicateurs de succès (à suivre dès le lancement)

Précommandes (S0) · conversion visite → essai gratuit → achat · tentatives par acheteur · **taux de réussite déclaré à l'examen** (enquête à J+60) · note moyenne des explications · taux de remboursement · part des acheteurs qui prennent le coaching ou le bootcamp.

---

## 2. Cadre légal et intégrité

1. **Aucune reproduction** de questions réelles ni de contenus payants tiers (MeasureUp, Whizlabs, ExamTopics…) ; contenu écrit par nos experts à partir du guide **public** de compétences et de la documentation Microsoft. Les questions générées avec assistance par IA sont **réécrites, vérifiées techniquement et relues** par un expert.
2. Mentions obligatoires : « indépendant, non affilié ni approuvé par Microsoft », « PL-300 / Power BI sont des marques de Microsoft ». Pas de promesse « réussite garantie ».
3. **Données personnelles** : les résultats sont des données personnelles ; le **partage avec un employeur ou une école exige le consentement** de l'apprenant ; base légale, durée de conservation et droits d'accès à documenter (loi sénégalaise sur les données personnelles, et RGPD pour les clients européens).
4. À valider avec un conseil juridique : conditions d'utilisation (interdiction de copier/diffuser), clauses de licence nominative, politique de remboursement.

---

## 3. Analyse fonctionnelle

### 3.1 Personas
Apprenant (acheteur du forfait) · Responsable pédagogique / auteur de contenu · Relecteur (≠ auteur) · Administrateur (forfaits, droits d'usage, remboursements) · Responsable d'entreprise (phase ultérieure) · Finance (paiements, réconciliation).

### 3.2 Parcours clés
1. **Découvrir** : page d'offre `/formations/simulateur-pl-300` (couverture du guide, aperçu, avis, tarifs, FAQ) → examen d'essai gratuit (10 questions).
2. **Acheter** : choix du forfait → paiement en ligne (Wave / Orange Money / carte) → **ouverture automatique** de l'accès → e-mail de bienvenue (réutilise le circuit apprenant actuel : compte créé et invitation).
3. **S'entraîner** : mode *Étude* (par domaine ou sous-compétence, correction immédiate) ou mode *Examen* (conditions réelles).
4. **Mesurer** : rapport par domaine, indice de préparation, questions à revoir, plan de révision (semaine par semaine).
5. **Pratiquer** (v2) : labs guidés avec jeux de données et points de contrôle.
6. **Passer l'examen** : checklist d'inscription Pearson VUE, conseils, renouvellement.
7. **Boucler** : enquête de résultat, demande de témoignage, offre alumni.

### 3.3 Épopées et récits principaux

| Épopée | Exemples de récits |
|---|---|
| **E1 Banque de questions** | En tant qu'auteur je crée une question (type, énoncé, choix, explication FR, domaine, sous-compétence, difficulté, version du guide) ; je la soumets à relecture ; un relecteur différent la publie ; je la retire quand elle devient obsolète |
| **E2 Blueprint et assemblage** | Je définis la répartition par domaine d'un examen (selon le guide en vigueur) ; le système compose un examen équilibré sans répéter les questions des tentatives précédentes |
| **E3 Moteur de tentative** | En tant qu'apprenant je démarre un examen de 100 min, je navigue, je marque des questions, je reprends après coupure, je termine ; le temps est contrôlé par le serveur |
| **E4 Types de questions** | Choix unique · choix multiples · séries Oui/Non · ordonnancement (glisser-déposer) · complétion de code DAX/M (zones à choisir) · **étude de cas** (énoncé partagé, plusieurs questions) |
| **E5 Résultats et analyse** | Score estimé, résultats par domaine et sous-compétence, temps par question, revue des erreurs avec explications |
| **E6 Plan de révision et répétition espacée** | Les questions ratées reviennent selon un calendrier ; plan sur N semaines selon la date d'examen visée |
| **E7 Droits d'usage et forfaits** | Forfaits, durée, quotas de tentatives, extension manuelle (geste commercial tracé), remboursement |
| **E8 Achat** | Page d'offre, coupons (le plafond de 30 % s'applique), paiement automatisé, facture/reçu |
| **E9 Labs (v2)** | Étapes pas à pas, jeux de données téléchargeables, points de contrôle (réponses vérifiées), corrigé |
| **E10 Pilotage** | Qualité des questions (taux de réussite, discrimination), erreurs signalées, couverture par compétence, chiffre d'affaires, conversion |
| **E11 Entreprises (v3)** | Lots de licences, cohortes, rapports avec consentement |

### 3.4 Règles métier (extrait)
- Un **examen blanc complet** = 40 à 60 questions, **100 minutes**, répartition **conforme au blueprint** ; la correction n'est visible qu'**à la fin**.
- **Score** : on affiche un **score estimé sur 1 000** et un **pourcentage par domaine**. Microsoft ne publie pas son barème (pondération, questions de test non notées) : l'estimation est **indicative** et clairement présentée comme telle ; seuil d'affichage « prêt » fixé à ≥ 75 % sur 3 examens complets récents (à calibrer avec les données).
- **Tentatives** : quota par examen et par forfait ; une tentative abandonnée après démarrage **compte** (anti-contournement) sauf incident technique reconnu.
- Une question publiée est **immuable** : toute correction crée une **nouvelle version** ; les tentatives passées restent liées à la version qu'elles ont vue.
- **Anti-répétition** : un nouvel examen privilégie les questions jamais vues.
- **Droit à l'erreur de contenu** : l'apprenant peut **signaler** une question ; le signalement alimente la file de relecture.

### 3.5 Labs (version 2) : ce qui est faisable
- L'examen réel **n'a pas de labs pratiques** ; les labs servent à **apprendre**. Power BI Desktop est un logiciel **Windows** : on ne peut pas l'héberger dans le navigateur. Les labs sont donc **guidés** (instructions + jeux de données + points de contrôle de type « quelle valeur affiche la carte X ? »).
- **Validation automatique de fichiers (version 3, optionnelle)** : le client exporte un **modèle `.pbit`** (le `.pbix` contient un modèle binaire non lisible) ; un **service isolé** analyse le JSON du modèle (mesures, relations, rôles RLS, types de visuels) ; limites strictes de taille, jamais d'exécution, antivirus (voir §5).

---

## 4. Architecture technique

### 4.1 Principes
1. **Monolithe modulaire** : nouveau module `modules/simulator` dans le backend existant (Spring Boot) — pas de micro-service tant que le volume ne l'exige pas ; frontières nettes pour pouvoir l'extraire.
2. **Domain-Driven Design léger** : contexte « Simulateur » distinct des contextes *Formation* et *Paiement* ; échanges par **événements de domaine** (le mécanisme `ApplicationEventPublisher` est déjà utilisé pour les certificats).
3. **Serveur autoritaire** : le navigateur n'est jamais source de vérité (temps, correction, quotas).
4. **Contenu versionné et immuable**.
5. **Générique** : le moteur est indépendant de la certification (`Certification`, `Blueprint`) pour réutilisation (DP-600, AZ-900…).

### 4.2 Vue d'ensemble

```
Navigateur (React, /espace/simulateur)
   │  HTTPS, cookie de session httpOnly, jeton court
   ▼
API Spring  ──► AttemptController / CatalogController / AdminItemController / LabController
   │
   ├─ simulator.application   (cas d'usage : StartAttempt, SaveAnswer, SubmitAttempt, AssembleExam, GrantAccess…)
   ├─ simulator.domain        (Item, ItemVersion, Blueprint, ExamForm, Attempt, Score, AccessGrant, Lab…)
   ├─ simulator.infrastructure(JPA, stockage MinIO, files d'événements, scorers)
   └─ ports : PaymentPort · LearnerPort · StoragePort · NotificationPort · AuditPort
        │
        ├─ Paiement existant + passerelle de paiement en ligne (webhooks signés) → événement PaymentConfirmed
        ├─ Comptes apprenants/personnel, permissions, journal d'audit (réutilisés)
        └─ MinIO (jeux de données de labs, pièces jointes d'énoncés)
PostgreSQL (schéma partagé, tables préfixées `sim_`)
```

### 4.3 Réutilisation de l'existant

| Besoin | Réutilisé | Où |
|---|---|---|
| Identité, sessions, double authentification du personnel, limitation de débit | Oui | `modules/auth`, `IpRateLimiter` |
| Droits fins (RBAC par permission), règle des quatre yeux, journal d'audit | Oui + nouveaux droits `SIMULATOR_VIEW`, `SIMULATOR_AUTHOR`, `SIMULATOR_REVIEW`, `SIMULATOR_MANAGE` | `Permission`, `AdminAccessRules`, `FourEyes`, `AuditService` |
| Éditeur riche avec code formaté (DAX/M) | Oui | `components/rich/RichText`, `lib/highlight.ts` |
| Fichiers (jeux de données, images d'énoncés) | Oui | `StorageService` (validation de types, liens signés) |
| Paiement et inscription | **Étendus** | `Payment`, `Registration`, `PromoCode` (plafond 30 %), `Invoice` |
| E-mails (bienvenue, rappels, résultats) | Oui | `MessageDispatcher`, `TemplatedMailer` |
| Page d'offre pilotée par le contenu | Oui | `site_settings`, `AdminContenus` |
| Notation, éditeur de questions, banque | **Non** : QCM à choix unique lié à une leçon | → module dédié |

### 4.4 Modèle de données (migrations V39 et suivantes, préfixe `sim_`)

| Table | Rôle |
|---|---|
| `sim_certification` (code `PL-300`, nom, éditeur) | Catalogue des certifications |
| `sim_blueprint` + `sim_blueprint_domain` | Version du guide de compétences (date), domaines, poids min/max, durée, nombre de questions, score de réussite |
| `sim_item` + `sim_item_version` | Question : `type`, `payload` (JSONB validé par type), `explanation_fr`, domaine, sous-compétence, difficulté, statut (`DRAFT`, `IN_REVIEW`, `APPROVED`, `PUBLISHED`, `RETIRED`), auteur, relecteur, version du guide visée |
| `sim_case_study` | Énoncé partagé et ses questions |
| `sim_exam_template` | Examen blanc nommé (n° 1 à 5) ou assemblage dynamique |
| `sim_exam_form` + `sim_exam_form_item` | Instantané figé des versions de questions d'une tentative |
| `sim_attempt` | Apprenant, forme, mode, état, début, **échéance serveur**, fin, score |
| `sim_attempt_answer` | Réponse, temps passé, marquée ; unique par (tentative, question) |
| `sim_attempt_event` | Événements horodatés (démarrage, sauvegarde, perte de focus, soumission) pour audit et détection d'anomalies |
| `sim_plan` + `sim_access_grant` | Forfaits ; droit d'usage (apprenant, forfait, tentatives restantes, expiration, paiement source, statut) |
| `sim_review_item` | Répétition espacée (boîte, prochaine échéance) |
| `sim_item_report` | Signalements d'erreur par les apprenants |
| `sim_item_stats` | Taux de réussite, discrimination, analyse des distracteurs (calculés) |
| `sim_lab` + `sim_lab_step` + `sim_lab_progress` (v2) | Labs guidés |

Contraintes : clés étrangères, index sur (apprenant, état), (forme, position), contrainte d'unicité des réponses, `CHECK` sur les statuts, **aucune colonne de réponse correcte** dans les tables lues par l'API apprenant (les corrigés vivent dans `payload` privé, jamais sérialisé vers l'extérieur).

### 4.5 Patrons de conception et principes SOLID

| Besoin | Patron | Application | Principe |
|---|---|---|---|
| Plusieurs types de questions | **Strategy** | `ItemType` → `ItemScorer` (choix unique, multiple, Oui/Non, ordonnancement, complétion de code, étude de cas) ; `ItemValidator` par type | **O**uvert/fermé : ajouter un type = ajouter une classe |
| Composer un examen | **Factory** + **Builder** | `ExamAssembler` à partir du `Blueprint`, avec contrainte de couverture et d'exposition | **S**ingle responsibility |
| Cycle de vie d'une tentative | **State** | `CREATED → IN_PROGRESS → SUBMITTED → SCORED`, `EXPIRED`, `ABANDONED` ; transitions interdites impossibles à exprimer | Substitution de Liskov |
| Notation | **Template Method** | Squelette commun (verrouiller → noter → agréger par domaine → estimer le score), étapes spécifiques par type | **O** |
| Droit d'usage après paiement | **Observer** / événements de domaine | `PaymentConfirmed` → `AccessGranted` ; `AttemptScored` → plan de révision, e-mail | **D**ependency inversion |
| Intégration paiement | **Adapter** + **Anti-corruption layer** | `PaymentGatewayPort` implémenté par chaque prestataire ; le domaine ignore le fournisseur | **D**, **I** |
| Accès aux données | **Repository** | Interfaces de domaine, implémentation JPA | **D** |
| Éligibilité à un examen / quota | **Specification** | `HasRemainingAttempts`, `IsAccessActive` combinables | **O** |
| Contenu publié | **Memento**/versionnage | `ItemVersion` immuable | — |
| Génération de rapports | **Visitor** (facultatif) | Agrégations par domaine/sous-compétence | **I** |
| Interfaces ciblées | **Interface Segregation** | `AttemptReader`, `AttemptWriter`, `ScoreCalculator` distincts | **I** |

Bonnes pratiques d'ingénierie : packages par fonctionnalité, DTO distincts des entités (jamais d'entité JPA en réponse API), validation à la frontière (Bean Validation), transactions courtes, verrouillage optimiste sur `sim_attempt`, idempotence des écritures de réponses, journalisation structurée avec identifiant de corrélation, migrations Flyway versionnées, tests à trois niveaux (§7).

### 4.6 API (extrait)

Apprenant (`/api/v1/simulator/...`, droit d'usage vérifié à chaque appel) :
`GET /catalog` · `GET /me/access` · `POST /attempts` (démarre ; **l'assemblage est fait côté serveur**) · `GET /attempts/{id}` (questions **sans corrigé**) · `PUT /attempts/{id}/answers/{itemId}` (idempotent) · `POST /attempts/{id}/flag` · `POST /attempts/{id}/submit` · `GET /attempts/{id}/report` (**seulement après correction**) · `GET /me/readiness` · `POST /items/{id}/report`.
Administration (`/api/v1/admin/simulator/...`) : banque (CRUD, transitions de statut, import), blueprints, forfaits, droits d'usage (octroi, prolongation, révocation — **tracés dans l'audit**), statistiques.
Paiement : `POST /api/v1/payments/gateway/webhook` (signature vérifiée, idempotent).

### 4.7 Interface (React, design system existant)

Espace `/espace/simulateur` : tableau de bord (indice de préparation, radar par domaine, tentatives restantes, prochaine action) · entraînement par domaine · **interface d'examen** (minuteur serveur, navigateur de questions, marquage, panneau d'étude de cas, glisser-déposer **accessible au clavier**, sauvegarde automatique avec file d'attente hors-ligne, avertissement avant fermeture) · rapport de résultats · plan de révision. Administration : banque de questions (tableau, filtres, éditeur, workflow de relecture), blueprints, forfaits, droits d'usage, statistiques. Accessibilité WCAG AA, adaptation mobile (entraînement) et recommandation « ordinateur » pour l'examen complet.

### 4.8 Performance et exploitation
- Les versions de questions publiées étant **immuables**, on les met en cache ; l'assemblage est préparé à l'avance pour les examens numérotés.
- Index adaptés ; pagination partout ; limites de charge utiles ; objectif : examen démarré en < 1,5 s, sauvegarde de réponse < 150 ms (p95), cible initiale 200 examens simultanés sur l'infrastructure actuelle (à valider par test de charge).
- Observabilité : métriques (tentatives, échecs de sauvegarde, latences), alertes sur webhooks de paiement en échec, tableau de bord produit.
- Sauvegardes : la banque de questions est un **actif critique** (sauvegarde chiffrée, restauration testée).

---

## 5. Sécurité dès la conception (Security by Design)

### 5.1 Modèle de menaces (STRIDE appliqué)

| Menace | Scénario | Contrôles |
|---|---|---|
| **S**poofing | Prise de compte, partage d'identifiants | Authentification existante + limitation de sessions simultanées par droit d'usage, alerte sur connexions de pays/appareils multiples, lien de connexion à usage unique |
| **T**ampering | Modifier le score ou le temps depuis le navigateur | **Notation et minuteur serveur** ; échéance stockée côté serveur ; réponses acceptées seulement avant l'échéance (+ marge réseau) ; verrouillage optimiste ; aucune donnée de correction envoyée avant soumission |
| **R**epudiation | « Je n'ai pas passé cet examen », litige de remboursement | Journal d'audit d'ajout seul (existant) étendu : octrois, prolongations, publication de questions, remboursements ; événements de tentative horodatés |
| **I**nformation disclosure | **Fuite de la banque** (exfiltration par script, revue, capture) | DTO sans corrigé ; correction détaillée **après** soumission seulement et selon le mode ; **ordre des choix et sélection randomisés par tentative** ; **filigrane** (visible + marqueur invisible lié à l'apprenant) sur les pages de revue ; limitation de débit par compte et par IP ; détection de lecture massive (nombre de questions vues vs temps) ; **aucune route d'export** ; objets privés MinIO à liens signés courts ; CGU interdisant la copie |
| **D**enial of service | Création massive de tentatives, scripts | Limiteur de débit, quotas de tentatives, plafonds de charge utile, files bornées |
| **E**levation of privilege | Accéder à la tentative d'un autre (IDOR), publier sans relecture | Contrôle d'appartenance à chaque requête (`attempt.learnerId == principal`), identifiants non devinables, permissions séparées auteur / relecteur / gestionnaire, **règle des quatre yeux** : l'auteur ne publie pas sa propre question |

### 5.2 Contrôles transversaux
- **Paiement** : webhooks **signés (HMAC)** vérifiés, anti-rejeu, **idempotence**, vérification du montant et de la devise côté serveur, réconciliation quotidienne ; aucun accès accordé sur la seule foi du navigateur.
- **Entrées** : validation stricte du `payload` par type (schéma), longueur maximale, aucun HTML interprété (Markdown restreint déjà éprouvé), requêtes paramétrées.
- **Téléversements** (labs v2/v3) : liste blanche d'extensions, **signature binaire**, limites de taille, **analyse antivirus**, stockage privé ; analyse de `.pbit` dans un **processus isolé** sans accès réseau, avec plafond de décompression (**protection contre les bombes zip**), délai maximal, jamais d'exécution.
- **Secrets** hors du code (variables d'environnement), rotation documentée ; **CSP** et en-têtes de sécurité sur les pages d'examen.
- **Confidentialité** : minimisation (pas de données inutiles dans les rapports), durée de conservation définie, **consentement explicite** avant partage avec un employeur, export et suppression sur demande.
- **Intégrité du contenu** : sauvegardes chiffrées de la banque, journal des modifications, restauration testée.
- **Chaîne d'approvisionnement** : aucune nouvelle dépendance sans accord ; analyse des dépendances existante conservée.

### 5.3 Tests de sécurité obligatoires (critères d'acceptation)
1. Test automatique qui **parcourt tous les DTO de l'API apprenant** et échoue si un champ de correction apparaît avant soumission.
2. Tests IDOR (accès croisé entre deux apprenants) sur toutes les routes de tentative.
3. Tentative de soumission après l'échéance → refus.
4. Rejeu de webhook de paiement → un seul octroi.
5. Un auteur ne peut pas publier sa propre question.
6. Test de charge et de limitation de débit.
7. Revue de menaces rejouée à la fin de chaque lot structurant.

---

## 6. Stratégie de contenu (chemin critique)

| Élément | Volume cible (MVP) | Remarque |
|---|---|---|
| Questions originales (EN) avec explication (FR) | ≈ 400 (≈ 600 en version complète) | Couvrent toutes les sous-compétences du guide du 20/04/2026 |
| Examens blancs complets | 3 au MVP (5 en version complète) | 40–60 questions, répartition conforme au blueprint |
| Banque par domaine | Les 4 domaines | Étude avec correction immédiate |
| Études de cas | 6 à 8 | 4 à 5 questions chacune |
| Labs guidés (v2) | 12 à 15 | Jeux de données locaux (FCFA) |

Chaîne de production : **rédaction → vérification technique dans Power BI Desktop (exécution réelle des DAX/M) → relecture par un deuxième expert → publication par un tiers (quatre yeux) → suivi statistique → retrait/correction**. Avec l'assistance de l'IA pour les premières versions, jamais en autonomie. Rythme réaliste : 8 à 12 questions finalisées par expert et par jour. **Recruter ou désigner un responsable contenu certifié PL-300** est la condition n° 1 du calendrier.

---

## 7. Plan d'implémentation

### 7.1 Découpage en lots (branches issues de `staging`, une branche et un worktree par lot, recette à chaque lot)

| Lot | Objectif | Livrables principaux | Durée | Dépend de |
|---|---|---|---|---|
| **S0 — Validation** | Décider avant d'investir | Page d'offre + précommande/liste d'attente, 40 questions pilotes, tableau de couverture du guide, test de prix, vérification du prix d'examen et de la langue au Sénégal, avis juridique (CGU, mentions) | 2 sem. | — |
| **S1 — Banque de questions** | Atelier de contenu | Modèle de données, blueprint PL-300 (version 20/04/2026), types choix unique/multiple/Oui-Non, éditeur d'admin, workflow brouillon → relecture → publication (quatre yeux), import CSV/JSON, droits et audit | 3 sem. | S0 |
| **S2 — Moteur de tentative** | Passer un examen | Assemblage selon le blueprint, tentative avec minuteur serveur, sauvegarde idempotente, soumission, notation (Strategy), rapport par domaine, interface d'examen et mode étude, droits d'usage manuels (octroi par l'admin), tests de sécurité §5.3 (1–3, 5) | 3 sem. | S1 |
| **S3 — Commerce** | Vendre sans intervention | Forfaits et quotas, page d'achat, **passerelle de paiement** (adaptateur + webhooks signés + réconciliation), coupons, reçu/facture, e-mails, accès accordé automatiquement ; tests §5.3 (4) | 3 sem. | S2, choix du prestataire |
| **S4 — Questions avancées et qualité** | Au niveau de l'examen réel | Études de cas, ordonnancement, complétion de code, statistiques de qualité des questions, signalement d'erreurs, durcissement anti-fuite (filigrane, randomisation, détection) | 3 sem. | S2 |
| **Lancement MVP** | Mise en vente | Recette complète, test de charge, sauvegarde/restauration, campagne de lancement, enquête de résultat | 1 sem. | S0–S4 |
| **S5 — Parcours de préparation** | Valeur différenciante | Indice de préparation, plan de révision, répétition espacée, rappels par e-mail, **labs guidés** | 4 sem. | MVP |
| **S6 — Entreprises et extensions** | Marché B2B | Licences par lots, cohortes, rapports avec consentement, (option) validation de `.pbit` isolée | 4 sem. | S5 |

Enchaînement : S0 → S1 → S2 → (S3 ‖ S4) → MVP. **MVP vendable ≈ 15 semaines depuis le démarrage de S0, soit ≈ 10 à 12 semaines après la porte de décision**, si le contenu est prêt au fil de l'eau. Version complète ≈ 5 mois.

Équipe de référence : 1 développeur backend, 1 développeur front, 1 responsable contenu certifié + 1 relecteur à mi-temps, le PO (arbitrages, recette), conseil juridique ponctuel.

### 7.2 Définition de « terminé » d'un lot
Code + tests verts (suite complète) · tests de sécurité du lot · migration relue · documentation d'exploitation et guide de recette mis à jour · parcours de recette exécuté sur staging · revue de code · aucune dépendance ajoutée sans accord.

### 7.3 Points de décision (portes)
- **Fin S0** : go si précommandes ≥ seuil fixé avec vous (proposition : 30 précommandes ou 8 entreprises intéressées) ET responsable contenu identifié.
- **Fin S2** : démonstration interne d'un examen complet de bout en bout ; calibrage du score estimé.
- **Avant lancement** : recette de sécurité signée, conformité juridique validée.

---

## 8. Vérification (comment on prouvera que ça marche)

1. **Tests unitaires** : scoreurs par type (cas limites : crédit partiel, réponses vides), assembleur (respect des bornes du blueprint, exposition), machine à états.
2. **Tests d'intégration** (Testcontainers, comme l'existant) : cycle complet démarrer → répondre → soumettre → rapport ; quotas ; expiration ; webhooks ; droits d'usage.
3. **Tests de sécurité** : liste §5.3.
4. **Tests de charge** : montée à 200 examens simultanés.
5. **Recette fonctionnelle** : nouveaux parcours ajoutés au `guide-recette-staging.md`, jeu de comptes de test, 10 testeurs externes réels sur l'examen d'essai.
6. **Revue de contenu** : tableau de couverture du guide 20/04/2026 à 100 % des sous-compétences ; taux d'erreurs signalées < 2 % après un mois.

---

## 9. Risques techniques, hypothèses et questions ouvertes

| Sujet | Position actuelle | À confirmer |
|---|---|---|
| Prestataire de paiement en ligne (Wave, Orange Money, carte) | Adaptateur générique ; choix selon frais, API de webhook, disponibilité au Sénégal | Comparatif et choix au début de S3 (pas de nouvelle dépendance sans votre accord) |
| Version française de l'examen | Non confirmée ; on garde **questions EN + explications FR** | Vérifier sur Microsoft Learn/Pearson VUE |
| Prix de l'examen au Sénégal | Inconnu | Vérifier sur Pearson VUE, l'intégrer à l'offre (« bon d'examen ») |
| Score estimé | Indicatif (barème Microsoft non public) | Calibrer avec les premiers apprenants |
| Fuite de la banque | Risque résiduel inévitable | Détection + filigrane + renouvellement régulier du contenu |
| Validation de fichiers `.pbit` | Optionnelle, complexe | Décider en fin de S5 selon la demande |
| Capacité de l'équipe en parallèle (intégration Brevo, importations, propositions de formateurs) | À arbitrer | Priorités à fixer avec vous |

---

## Sources
- [Guide d'étude PL-300 — Microsoft Learn](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-300)
- [Comparatif MeasureUp / Whizlabs](https://mscertquiz.com/blog/mscertquiz-vs-measureup-vs-whizlabs)
- [Exemple de pratique Udemy PL-300](https://www.udemy.com/course/pl-300-microsoft-power-bi-data-analyst-full-practice-exams/)
- [Coût du PL-300 (Readynez)](https://www.readynez.com/uk/blog/microsoft-pl-300-cost-how-much-is-it/)
- [Certification exams, NDAs and responsible behavior — Microsoft](https://learn.microsoft.com/en-gb/archive/blogs/betaexams/certification-exams-ndas-and-responsible-behavior)
