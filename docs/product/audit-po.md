# Audit produit — Model Technologie (front `data-mastery-hub` + back `modeltech-backend`)

**Date de l'audit** : 9 octobre 2026 · **Environnement testé** : local uniquement (front `localhost:8080`, API `localhost:8081`, PostgreSQL/MinIO Docker, e-mails réels via SMTP Gmail)
**Référentiel** : `docs/design/README.md`, `api-contract.md`, `front-handoff.md` et les 27 écrans `docs/design/screens` (aucune autre source).
**Posture** : Product Owner. Chaque fonctionnalité a été exercée dans le navigateur et/ou via l'API contre le vrai backend, avec un compte par rôle.

> **Mise à jour du 10 octobre 2026 — réalisation du backlog.** Les pourcentages ci-dessous (100 % sur les trois personas) mesurent la grille de cet audit : toutes les lignes sont passées à « livré ». Ils ne disent pas que tout est parfait : les points encore partiels sont listés au §9 (« Statut ») — notamment le revenu partagé des partenaires (S11), les tests de bout en bout du front (S8), le coaching sans réservation en temps réel (C2) et les formulaires protégés par reCAPTCHA, toujours à valider par le PO (§8). Le détail de la réalisation est dans les branches `po/lot-*` des deux dépôts.

---

## 1. Synthèse

| Persona | Implémentation | Verdict global |
|---|---|---|
| Visiteur / candidat (site public) | **100 %** (était 78 %) | Contenus pilotés par le back-office, carte, photos, PWA, en-tête connecté |
| Apprenant | **100 %** (était 66 %) | Cours, quiz, projet, certificat + paiements, reçus, notes serveur, notifications, communauté, hors ligne |
| Admin (SUPER_ADMIN / ADMIN) | **100 %** (était 69 %) | Toutes les fonctions de l'API ont leur écran (factures, certificats, e-mails, contenus, communauté…) |
| Éditeur | Menu et routes filtrés par rôle | Les pages interdites ne sont plus proposées |
| Formateur | Accès au suivi de ses sessions via « Mon espace » | Message, questions, correction du projet et certificats depuis le suivi |
| Partenaire | Accès à ses formations via « Mon espace » | Le suivi du revenu reversé reste à construire (S11) |

**Ce qui fonctionne de bout en bout (vérifié)** : candidature (créée par l'admin) → acceptation avec échéances → e-mail et lien de paiement → déclaration + justificatif côté candidat → confirmation par l'admin → compte apprenant + invitation + accès → cours (vidéo Vimeo, ressources, progression) → quiz → dépôt du projet → correction → certificat PDF vérifiable publiquement.

**Les 5 constats majeurs**
1. **Formateurs et partenaires ne peuvent pas utiliser la plateforme** : leur connexion aboutit sur l'accueil public et toutes les routes `/admin/*` les y renvoient. Le backend, lui, est prêt (droits par ressource corrects).
2. **Le backend est en avance sur le front** : l'API expose déjà inscription manuelle, annulation, factures, certificats (liste, révocation, renvoi), affectation de formateur, messages de session, questions, journal d'e-mails, contenus du site, reçus, attestation… sans écran correspondant.
3. **Fuites et risques de sécurité côté backend** : l'endpoint public de validation d'un code promo renvoie nom, e-mail et téléphone du parrain ; les journaux du profil `dev` contiennent les mots de passe de connexion ; les jetons de réinitialisation sont stockés en clair.
4. **Aucun contenu éditorial piloté depuis le back-office** : `site-settings` est vide, l'accueil, les FAQ, le coaching et la masterclass sont codés en dur.
5. **Aucun test automatisé côté front** et pas de PWA (pourtant prévue au cahier : « PWA installable »).

---

## 2. Méthode et légende

- **Implémentation** : ● livré · ◐ partiel · ○ absent. Le pourcentage = (livré + 0,5 × partiel) / nombre de fonctionnalités du persona.
- **Test fonctionnel** : ✅ conforme · ⚠️ à améliorer · ❌ défaut · ⏳ non testé (raison indiquée).
- **Comptes utilisés** : admin `dev.admin@modeltech.local`, apprenant `dplionnel@gmail.com`, plus trois comptes créés pour l'audit (éditeur, formateur, partenaire, adresses `dplionnel+po-…@gmail.com`).
- **Non testé par choix** : formulaires protégés par reCAPTCHA (à faire par le PO, voir §8), connexion Google, réussite du lien/code de connexion (code reçu par e-mail), lecture effective de la vidéo Vimeo.

---

## 3. Visiteur / candidat — site public (100 %, était 78 %)

| # | Fonctionnalité | Impl. | Test | Constat |
|---|---|---|---|---|
| V1 | Accueil | ● | ✅ | Cohorte, formations et témoignages viennent de l'API ; textes, chiffres, métiers, offres, FAQ et photos viennent du backend (contenu `page.home`, éditable dans « Pages du site »). |
| V2 | Catalogue `/formations` (domaines, niveau, format, métier, prestataire) | ● | ✅ | Filtres opérationnels, données de l'API. |
| V3 | Fiche formation (gabarit interne/partenaire, sessions, places, tarif) | ● | ✅ | Les blocs « Pour qui », « À la fin » et « Programme » sont masqués tant qu'ils sont vides (plus de sections creuses) ; le bouton mort est remplacé par « Voir le programme ». La saisie du contenu du Scrum reste à faire dans l'éditeur. |
| V4 | Candidature (modale : session, pays, code promo) | ● | ⏳ | reCAPTCHA : à tester par le PO. Les champs et la disponibilité des places s'affichent. |
| V5 | Page de paiement `/paiement/:token` | ● | ✅ | Instructions, déclaration, dépôt de justificatif, états (à payer, en vérification, payé), facture téléchargeable. Le **reçu public existe côté API mais n'est pas proposé**. |
| V6 | Coaching | ● | ✅ | Contenu, formules et tarifs pilotés par le back-office (tarif vide = « Sur devis »). Réservation par demande : le créneau ou la formule choisis pré-remplissent le message du formulaire de contact. Les créneaux fictifs ont été retirés (affichés seulement s'ils sont saisis). |
| V7 | Entreprises + diagnostic | ● | ⏳ | Formulaire présent (reCAPTCHA). Textes, offres et photos pilotés par le back-office ; le bouton « Télécharger la plaquette » n'apparaît que si un fichier est renseigné. |
| V8 | Alumni | ● | ✅ | Page alimentée uniquement par les témoignages, alumni et projets réellement publiés (les faux témoignages de repli ont été supprimés) ; statistiques calculées sur les données ; message d'attente tant que rien n'est publié. |
| V9 | Ressources / blog | ● | ✅ | Page pilotée par le back-office (articles, modèles à télécharger, atelier, newsletter réelle) ; plus aucun contenu d'illustration ni badge « EN COURS ». Tant qu'aucun article n'est publié, la page le dit clairement. |
| V10 | Contact + FAQ | ● | ⏳ | Formulaire (reCAPTCHA), coordonnées, FAQ et photo pilotés par le back-office ; **carte Google Maps** intégrée (adresse modifiable) ; pré-remplissage depuis le coaching. |
| V11 | Devenir partenaire | ● | ⏳ | Formulaire présent (reCAPTCHA). |
| V12 | À propos | ● | ✅ | Équipe, valeurs, parcours, partenaires et photo pilotés par le back-office. |
| V13 | Quiz d'orientation | ● | ✅ | Questions, règles de recommandation et résultats pilotés par le back-office ; chaque résultat se relie à une formation du catalogue (titre, durée, prix, session viennent de l'API) ; règles couvertes par des tests unitaires. |
| V14 | Masterclass | ● | ✅ | Événement (identifiant, date, inscriptions ouvertes/closes, programme, formateur) piloté par le back-office : changer de masterclass ne demande plus de déploiement ; la page admin des inscrits suit l'événement courant. |
| V15 | Newsletter (inscription, confirmation, désinscription) | ● | ⏳ | Pages présentes ; test à faire avec reCAPTCHA. |
| V16 | Vérification d'un certificat `/certificats/:id` | ● | ✅ | Affiche le nom, la formation, le signataire, les compétences, le PDF ; état « révoqué » prévu. |
| V17 | Responsive mobile | ● | ✅ | Aucun débordement horizontal sur les pages publiques ni sur les pages admin testées (sessions et éditeur de formation corrigés). |
| V18 | En-tête adapté à l'utilisateur connecté (« Mon espace ») | ● | ✅ | Connecté, « Connexion » devient « Mon espace » (espace apprenant ou back-office selon le rôle). |
| V19 | PWA installable | ● | ⏳ | Manifeste, service worker prudent (jamais l'API) et règles nginx livrés ; l'installation se valide en préproduction (HTTPS, build de production). |
| V20 | Page 404 | ● | ✅ | |

---

## 4. Apprenant (100 %, était 66 %)

| # | Fonctionnalité | Impl. | Test | Constat |
|---|---|---|---|---|
| L1 | Connexion (mot de passe) | ● | ✅ | Redirection vers `/espace`. |
| L1b | Connexion par lien / code, Google | ● | ⏳ | Les modes s'affichent d'après `/auth/options`. Échecs (code invalide, jeton invalide) conformes (message générique). La réussite exige le code reçu par e-mail. |
| L2 | Verrouillage après 5 échecs | ● | ✅ | 429 au 6ᵉ essai ; message + bouton « lien par e-mail » affichés. |
| L3 | Définition du mot de passe à l'invitation | ● | ✅ | Parcours exercé sur les comptes de test. |
| L4 | Tableau de bord | ● | ✅ | « À faire » cliquables (paiement, projet, quiz) ; plus de « Rendre votre projet final » sur une formation déjà certifiée (correctif backend testé). |
| L5 | Mes formations | ● | ✅ | Statuts : à venir, en cours, certifiée. |
| L6 | Lecteur de cours | ● | ✅ | Vidéo intégrée via `videoEmbedUrl`, ressources (dont verrou « après le quiz »), progression, déblocage séquentiel, navigation. |
| L7 | Notes personnelles | ● | ✅ | Enregistrées sur le serveur (synchronisées entre appareils, copie locale de secours, statut visible). |
| L8 | Questions au formateur | ● | ✅ | Envoi, liste, réponse reçue par l'apprenant. |
| L9 | Quiz | ● | ✅ | Tirage, correction, tentatives, seuil. |
| L10 | Projet final (dépôt, retours) | ● | ✅ | Le motif renvoyé par le serveur (taille, format, stockage) est affiché lors d'un échec de dépôt. |
| L11 | Conditions du certificat | ● | ✅ | Calculées par le serveur, affichées avec progression. |
| L12 | Calendrier & lives | ● | ✅ | Lu sur `/learner/calendar` (plus de chargement de tous les programmes). |
| L13 | Ressources | ● | ✅ | Lu sur `/learner/resources`, groupé par formation, verrou « après le quiz » respecté. |
| L14 | Certificats (liste, PDF, vérification, LinkedIn) | ● | ✅ | PDF généré (≈ 118 Ko), lien LinkedIn fourni par l'API. |
| L15 | Profil | ● | ✅ | Prénom, nom, téléphone et pays modifiables ; changement de mot de passe. |
| L16 | Mes paiements, reçus, attestation | ● | ✅ | `/espace/paiements` : échéances à régler (lien de paiement), reçus PDF, attestations d'inscription. Vérifié sur un compte de test. |
| L17 | Notifications | ● | ✅ | Centre de notifications dérivé des données réelles (échéances, projet, quiz, lives des 7 jours, certificat prêt), lu/non lu mémorisé sur l'appareil. Pas de notification push ni d'e-mail supplémentaire. |
| L18 | Communauté | ● | ✅ | Fil d'entraide par formation (messages et réponses, noms « Prénom N. », suppression de ses messages) ; modération par l'équipe (`/admin/communaute`). 4 tests d'intégration backend. |
| L19 | Hors ligne / audio seul / économie de données | ● | ⏳ | Mode économie de données (vidéo à la demande, basse qualité), audio seul, téléchargement des vidéos hébergées en direct et page « Hors ligne ». Limite : les vidéos intégrées depuis Vimeo/YouTube ne sont pas téléchargeables. |
| L20 | PWA | ● | ⏳ | Voir V19. |
| L21 | Responsive | ● | ✅ | Pas de débordement horizontal sur le lecteur de cours (test mobile). |

---

## 5. Admin — SUPER_ADMIN / ADMIN (100 %, était 69 %)

| # | Fonctionnalité | Impl. | Test | Constat |
|---|---|---|---|---|
| A1 | Tableau de bord (KPI, entonnoir, courbe, sessions, top formations, répartitions) | ● | ✅ | Données réelles ; périodes 7/30/90 jours/12 mois et personnalisée ; pastilles de menu via `/stats/actions`. |
| A2 | Paiements (suivi, avancement par formation) | ● | ✅ | Confirmation exercée de bout en bout. Refus, relance, remboursement non exercés (API OK). |
| A3 | Candidatures (kanban, accepter avec échéances, refuser) | ● | ✅ | L'acceptation renvoie correctement l'erreur « prix numérique manquant » puis envoie le lien. |
| A4 | Inscription manuelle | ● | ✅ | Dialogue dans « Candidatures » (formation, session, profil, pays…) ; la candidature arrive dans « Nouvelles candidatures ». Vérifié de bout en bout. |
| A5 | Annulation d'une inscription / remboursement | ● | ✅ | Annulation avec motif via l'API dédiée (échéances annulées, place libérée) depuis les colonnes de paiement et les inscrits ; remboursement depuis Paiements. |
| A6 | Factures (émission, envoi, annulation, PDF) | ● | ✅ | Émission depuis la carte d'un inscrit ; page « Factures » : PDF, envoi par e-mail, annulation motivée. |
| A7 | Inscriptions (liste) | ● | ✅ | Compteurs corrigés : « Confirmées / terminées », « En attente » (tout le parcours avant confirmation), « Annulées / refusées ». |
| A8 | Formations (liste, fiche, publication) | ● | ✅ | Bouton « Programme » ajouté. |
| A9 | Éditeur de programme (modules, leçons, vidéo, ressources, quiz, projet, règles du certificat) | ● | ✅ | Création et enregistrement vérifiés ; Vimeo/YouTube reconnus. |
| A10 | Domaines | ● | ✅ | CRUD OK. |
| A11 | Partenaires (+ logo) | ● | ✅ | |
| A12 | Sessions (CRUD) | ● | ✅ | Débordement mobile corrigé. |
| A13 | Affectation d'un formateur à une session | ● | ✅ | Sélecteur dans le suivi de session (liste des comptes formateurs actifs). |
| A14 | Suivi de session (tableau, appel) | ● | ✅ | « Ajouter un apprenant », « Écrire à la session », « Envoyer un message » et « Délivrer le certificat » sont réels (dérogation motivée pour les administrateurs). |
| A15 | Messages de session, questions des apprenants, correction du projet | ● | ✅ | Historique des messages, réponse aux questions, correction du projet (fichiers rendus, valider ou demander des modifications). |
| A16 | Certificats (liste, révocation, renvoi, dérogation `force`) | ● | ✅ | Page « Certificats » : lien de vérification, PDF, renvoi, révocation motivée ; délivrance par dérogation depuis le suivi de session. |
| A17 | Apprenants (inviter, activer/désactiver, accès) | ● | ✅ | Invitation par e-mail OK. |
| A18 | Comptes back-office | ● | ✅ | Création/invitation par rôle ; réservé SUPER_ADMIN. |
| A19 | Codes promo / parrainage | ● | ✅ | Création, validation publique, suppression OK. |
| A20 | Boîte de messages (contact, diagnostic, partenaire) | ● | ✅ | |
| A21 | Newsletter (liste) | ● | ✅ | |
| A22 | Masterclass (inscrits) | ● | ✅ | Suit l'événement courant défini dans « Pages du site ». |
| A23 | Témoignages | ● | ✅ | |
| A24 | Alumni | ● | ✅ | |
| A25 | Projets alumni | ● | ✅ | |
| A26 | Contenus du site (`site-settings`) | ● | ✅ | « Pages du site » : 13 contenus (menu, pied de page, coordonnées, accueil, formations, coaching, entreprises, ressources, partenaires, alumni, à propos, contact, masterclass, quiz) en éditeur de formulaire ou JSON, avec « Restaurer » la version d'origine. |
| A27 | Journal d'e-mails | ● | ✅ | Page « Journal d'e-mails » (filtres, erreurs, état de la messagerie, test d'envoi SUPER_ADMIN) ; l'alerte « e-mails en échec » du tableau de bord y mène. |
| — | Page « Services » (héritée) | — | ✅ | Supprimée (page, service et hook). |

---

## 6. Éditeur, formateur, partenaire

### Éditeur (EDITOR)
- **API** ✅ : accès aux contenus (formations, domaines, partenaires, messages, témoignages, alumni, projets, newsletter, site-settings), refusé sur candidatures, paiements, codes promo, comptes.
- **Interface** ✅ (corrigé) : menu et routes filtrés par rôle ; une page non autorisée n'est plus proposée.

### Formateur (TRAINER)
- **API** ✅ : droits par session corrects (403 « Cette session ne vous est pas confiée » avant affectation, 200 après) ; suivi, appel, projets, questions, messages, certificats.
- **Interface** ✅ (corrigé) : après connexion, atterrissage sur « Mon espace » (ses sessions) ; suivi de session, appel, correction du projet, questions, messages et certificats accessibles.
- **API** ✅ (corrigé) : endpoint « mes sessions » (`/admin/me`).

### Partenaire (PARTNER)
- **API** ✅ : accès à l'éditeur de programme et au projet **de ses formations uniquement** (autre formation : 403).
- **Interface** ✅ (corrigé) : « Mon espace » liste ses formations ; éditeur de programme et projet de ses formations.
- **Reste** : suivi des inscriptions et du **revenu reversé** (30 % pour Agile Sénégal) — voir S11.

---

## 7. Transverse — sécurité, qualité, exploitation

| # | Sujet | Gravité | Constat |
|---|---|---|---|
| T1 | `GET /promo-codes/validate?code=` (public) | **Élevée** | Renvoie nom, e-mail et téléphone du parrain, compteur d'utilisations. À réduire à : valide ou non + remise. |
| T2 | Journaux en profil `dev` | Moyenne | En développement, les corps de requêtes sont journalisés, y compris `LoginRequest(email, password)`. Les profils `staging` et `prod` journalisent `org.springframework.web` en INFO : le défaut n'y apparaît pas. À masquer quand même dans le profil `dev` (journaux partagés, captures d'écran). Noter que le profil `staging` laisse le code applicatif en DEBUG (volumineux). |
| T3 | Jetons de réinitialisation | Moyenne | Stockés en clair en base (les jetons de connexion par lien, eux, sont hachés). |
| T4 | Verrouillage de compte | Moyenne | 5 échecs verrouillent 15 min : un tiers peut verrouiller le compte d'un administrateur. Atténué par la connexion par lien e-mail. |
| T5 | Erreurs serveur | Moyenne | Une contrainte de base (catégorie de formation) renvoie **500** au lieu de 400 ; une route inconnue renvoie 500 « Une erreur est survenue ». |
| T6 | Accès non authentifié | Faible | Les routes protégées répondent **403** au lieu de 401. |
| T7 | Modèle de formation | Faible | `bootcamps.category` limité à `data/bi/python/sql/ai` : un nouveau domaine (ex. gestion de projet) impose une migration. |
| T8 | Notifications internes depuis le poste local | Moyenne | En local, les e-mails internes (message de contact, paiement à confirmer, question) partent vers la vraie adresse `admin@model-technologie.com`. Prévoir `NOTIFICATION_EMAIL_TO` en dev. |
| T9 | Environnement local | Moyenne | Le bucket MinIO `media` n'existait pas : tous les envois de fichiers échouaient (projets, justificatifs, logos, photos). Corrigé pendant l'audit ; à documenter / automatiser. Le script `dev-seed.sql` est obsolète (mot de passe admin différent). |
| T10 | Tests automatisés | Moyenne | Backend : 33 classes + celles ajoutées pendant la réalisation. Front : tests unitaires de la logique pure (`npm run test:unit`) ; **pas de e2e**. |
| T11 | PWA / mode hors ligne | Faible | Livré (voir V19, L19) ; à valider en préproduction. |
| T12 | Accessibilité | — | Non audité en profondeur (cibles, contrastes et libellés suivent le design system). |
| T13 | Données de démonstration | Faible | Le repli sur des données de démo reste actif en mode développement ; désactivé en production par construction. |

---

## 8. À tester par le Product Owner (hors de ma portée)

1. Formulaires protégés par reCAPTCHA : candidature (modale), contact, diagnostic entreprise, devenir partenaire, newsletter (inscription → e-mail de confirmation → désinscription), inscription masterclass.
2. Connexion par lien et par code à 6 chiffres (compte apprenant `dplionnel@gmail.com` : le lien reçu par e-mail).
3. Connexion Google (client configuré, origine `http://localhost:8080`).
4. Lecture réelle de la vidéo Vimeo/YouTube (iframe affichée, lecture non vérifiable dans mon environnement).
5. Contenu visuel des PDF (certificat, facture, reçu, attestation) face aux maquettes `docs/design/*-apercu.png`.
6. Vérification des numéros affichés : la page de paiement indique le **78 862 52 38**, le site affiche le **+221 78 631 04 32**.

---

## 9. Backlog MoSCoW

**Critères** — *Must* : sans cela un rôle prévu au cahier ne peut pas travailler, un flux de bout en bout est incomplet, ou il y a un risque sécurité/données. *Should* : forte valeur, contournement possible. *Could* : confort ou différenciation. *Won't* : explicitement hors de cette itération.
**Taille** : S ≈ 1 à 2 jours · M ≈ 3 à 5 jours · L > 1 semaine.

### Must have

| ID | Chantier | Taille | Portée | Pourquoi |
|---|---|---|---|---|
| M1 | **Ouvrir l'interface aux formateurs et partenaires** : redirection après connexion, `ProtectedRoute`, menu par rôle ; endpoints « mes sessions » (formateur) et « mes formations » (partenaire) | M | Front + back | Deux rôles du cahier sont aujourd'hui inutilisables |
| M2 | **Espace formateur / suivi de session complet** : correction du projet, réponse aux questions, messages, appel, délivrance de certificat, ajout d'apprenant | L | Front (API prête) | Boucle pédagogique incomplète ; 3 boutons « EN COURS » |
| M3 | **Candidatures : inscription manuelle + annulation** (F4a) | M | Front (API prête) | Seul moyen d'inscrire hors formulaire public |
| M4 | **Certificats côté admin** : liste, révocation, renvoi, dérogation motivée | M | Front (API prête) | Conformité et support apprenant |
| M5 | **Affecter un formateur à une session** | S | Front (API prête) | Prérequis de M1/M2 (droits par session) |
| M6 | **Corriger les risques sécurité** : T1 (fuite parrain), T3 (jetons en clair), T2 (mots de passe dans les logs du profil `dev`) | S–M | Back | Données personnelles et identifiants |
| M7 | **Droits visibles dans l'interface** : menu filtré par rôle, message explicite sur 403 (fin des pages « vides ») | S | Front | Évite des diagnostics erronés (éditeur) |
| M8 | **Factures** : émission, envoi par e-mail, annulation, PDF | M | Front (API prête) | Indispensable pour les paiements d'entreprise |
| M9 | **Fiabiliser l'exploitation locale/déploiement** : création automatique du bucket, seed à jour, `NOTIFICATION_EMAIL_TO`, erreurs 500 → 400 | S | Back/Ops | Évite les échecs silencieux (uploads) et les e-mails vers de vrais comptes |
| M10 | **Messages d'erreur d'upload explicites** (motif du serveur) | S | Front | Aujourd'hui « Échec du dépôt » seul |

### Should have

| ID | Chantier | Taille | Portée |
|---|---|---|---|
| S1 | **Espace apprenant « compte »** : « À faire » cliquables, Mes paiements (lien de paiement, reçus PDF), attestation de formation | M | Front (API prête) |
| S2 | **Contenus du site pilotés** : écran `site-settings` (accueil, FAQ, coaching, masterclass, numéros de contact) | L | Front (API prête) |
| S3 | **Journal d'e-mails** avec lien depuis l'alerte « e-mails en échec » | S | Front (API prête) |
| S4 | Brancher le front sur `/learner/calendar`, `/learner/resources`, `/learner/profile` | S | Front |
| S5 | Profil apprenant éditable (téléphone, pays) | S | Front |
| S6 | Site public : en-tête connecté (« Mon espace »/« Back-office »), badges « EN COURS » cohérents (Ressources, Blog, FAQ), boutons « Télécharger le programme/la plaquette » fonctionnels | S | Front |
| S7 | Fiches formation complètes (public cible, résultats, programme) et contrôle du formulaire d'édition | S–M | Contenu + admin |
| S8 | **Tests automatisés front** : parcours critiques en e2e (connexion, candidature→paiement, cours→certificat, éditeur de programme) | L | Front |
| S9 | Compteurs « Inscriptions » (statut Terminé) et cohérence des « À faire » après certificat | S | Front/Back |
| S10 | Responsive admin : sessions et éditeur de formation débordent sur mobile | S | Front |
| S11 | Tableau de bord partenaire : inscriptions, revenu partagé | L | Front + back |
| S12 | Notifications apprenant dans l'application | M | Front + back |

### Could have

| ID | Chantier | Taille |
|---|---|---|
| C1 | PWA installable, mode hors ligne, audio seul, économie de données | L |
| C2 | Coaching : réservation de créneaux réelle + paiement | L |
| C3 | Blog et FAQ dynamiques (back-office) | L |
| C4 | Masterclass multi-événements (création, inscription, replay) | M |
| C5 | Notifications WhatsApp (canal prévu côté backend) | M |
| C6 | Notes de cours synchronisées côté serveur | M |
| C7 | Recherche globale et exports supplémentaires (CSV) dans l'admin | M |
| C8 | Suppression de la page « Services » héritée | S |

### Won't have (cette itération)

- Paiement en ligne automatique par API Wave / Orange Money : la décision actuelle est la déclaration manuelle suivie d'une confirmation admin.
- Application mobile native.
- Multilingue.
- ~~Forum / communauté d'apprenants~~ : finalement réalisé (fil d'entraide par formation, voir statut).

### Statut au 10 octobre 2026

| ID | Statut | Réalisé / reste |
|---|---|---|
| M1 | Fait | Formateurs et partenaires atteignent « Mon espace » ; menu et routes par rôle ; endpoints « mes sessions / mes formations » |
| M2 | Fait | Suivi de session complet : appel, message, questions, correction du projet, certificats, ajout d'apprenant |
| M3 | Fait | Inscription manuelle et annulation motivée |
| M4 | Fait | Page Certificats (liste, révocation, renvoi) et délivrance par dérogation |
| M5 | Fait | Sélecteur de formateur dans le suivi de session |
| M6 | Fait | Validation de code promo minimale, jetons de réinitialisation hachés, secrets exclus des journaux |
| M7 | Fait | Menu filtré par rôle ; session expirée expliquée à la reconnexion |
| M8 | Fait | Factures : émission, PDF, envoi, annulation |
| M9 | Partiel | Bucket MinIO créé automatiquement ; erreurs 404/405/500 → statuts exacts. Reste : script `dev-seed.sql` obsolète et `NOTIFICATION_EMAIL_TO` en développement (T8) |
| M10 | Fait | Motif du serveur affiché lors d'un échec de dépôt |
| S1 | Fait | « À faire » cliquables, Mes paiements, reçus, attestations |
| S2 | Fait | « Pages du site » (13 contenus) |
| S3 | Fait | Journal d'e-mails relié au tableau de bord |
| S4 | Fait | Calendrier et ressources sur les endpoints dédiés |
| S5 | Fait | Profil éditable |
| S6 | Fait | En-tête connecté ; plus de badges « EN COURS » ; boutons morts supprimés ou conditionnés |
| S7 | Partiel | Blocs vides masqués ; le contenu de la formation Scrum reste à saisir dans l'éditeur |
| S8 | Partiel | Tests unitaires de la logique pure du front et tests d'intégration backend (+4 classes). Reste : parcours e2e (non faits : aucun outil e2e installé sans accord) |
| S9 | Fait | Compteurs d'inscriptions et « À faire » après certificat |
| S10 | Fait | Débordements mobiles corrigés |
| S11 | Non fait | Revenu partagé / inscriptions du partenaire |
| S12 | Fait | Centre de notifications dérivé des données du tableau de bord |
| C1 | Fait | PWA, économie de données, audio seul, vidéos hébergées hors ligne (Vimeo/YouTube non téléchargeables) |
| C2 | Partiel | Demande de créneau pré-remplie ; pas de réservation temps réel ni de paiement |
| C3 | Partiel | Textes, FAQ et articles pilotés par le back-office (JSON) ; pas d'éditeur d'articles dédié |
| C4 | Partiel | Un événement actif piloté par le contenu ; pas de gestion multi-événements |
| C5 | Non fait | WhatsApp |
| C6 | Fait | Notes synchronisées côté serveur |
| C7 | Non fait | Recherche globale |
| C8 | Fait | Page « Services » supprimée |
| Forum | Fait | Communauté par formation et modération (sorti des « Won't ») |

### Ordre de livraison recommandé
1. **Sécurité et socle** : M6, M9, M7, M10 (rapides, déblocants).
2. **Rôles manquants** : M5 → M1 → M2 (formateur d'abord, puis partenaire).
3. **Boucle admission** : M3, M8, M4.
4. **Expérience apprenant et contenu** : S1, S4, S5, S6, puis S2/S3.
5. **Qualité** : S8 en parallèle dès l'étape 2, pour sécuriser les parcours déjà livrés.

---

## 10. Annexe — données et actions de l'audit

**Comptes créés** (mot de passe de test commun, à supprimer ou désactiver après usage) : `dplionnel+po-editor@gmail.com` (EDITOR), `dplionnel+po-trainer@gmail.com` (TRAINER, affecté à « Session 1 » de Scrum Master), `dplionnel+po-partner@gmail.com` (PARTNER, Agile Sénégal), apprenant invité `dplionnel+po-invite@gmail.com`, candidat `dplionnel+po-candidat@gmail.com` (inscription confirmée, Data Analyst Cohorte 4, paiement de 150 000 FCFA, facture émise).

**Contenus de test** (marqués `PO-TEST`) : programme complet sur **Scrum Master certifié (PSM I)** (2 modules, quiz de 3 questions, projet final, règles de certificat 50/50/0), une question d'apprenant avec sa réponse, un message de session, un dépôt de projet (corrections demandées).

**Incident pendant l'audit** : un enregistrement de programme sur la formation **Power BI** a remplacé du contenu que vous aviez saisi entre-temps. Restauré : les 4 modules, les 4 leçons et la ressource. **Non récupérés** : la **consigne du projet final** (texte d'origine, début connu : « vous devez produire un tableau de board interactif pour la di… ») et les **règles du certificat** (remises aux valeurs par défaut 80 / 70 / 75). La consigne est marquée « À RESSAISIR » dans l'éditeur.

**Corrections d'environnement** : bucket MinIO `media` créé (lecture publique) ; adresse de test `po.test` des paramètres du site supprimée.
