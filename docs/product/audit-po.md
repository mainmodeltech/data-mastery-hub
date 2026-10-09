# Audit produit — Model Technologie (front `data-mastery-hub` + back `modeltech-backend`)

**Date de l'audit** : 9 octobre 2026 · **Environnement testé** : local uniquement (front `localhost:8080`, API `localhost:8081`, PostgreSQL/MinIO Docker, e-mails réels via SMTP Gmail)
**Référentiel** : `docs/design/README.md`, `api-contract.md`, `front-handoff.md` et les 27 écrans `docs/design/screens` (aucune autre source).
**Posture** : Product Owner. Chaque fonctionnalité a été exercée dans le navigateur et/ou via l'API contre le vrai backend, avec un compte par rôle.

---

## 1. Synthèse

| Persona | Implémentation | Verdict global |
|---|---|---|
| Visiteur / candidat (site public) | **78 %** | Vitrine solide et parcours candidature → paiement fonctionnel ; contenus encore statiques ou vides par endroits |
| Apprenant | **66 %** | Cœur pédagogique complet (cours, quiz, projet, certificat) ; il manque tout le côté « compte » (paiements, reçus, notifications) |
| Admin (SUPER_ADMIN / ADMIN) | **69 %** | Pilotage, paiements, catalogue et programme opérationnels ; 8 fonctions déjà prêtes côté API n'ont pas d'écran |
| Éditeur | Accès OK, **interface inadaptée** | Menu non filtré, pages interdites affichées vides sans message |
| Formateur | Backend **prêt**, interface **inaccessible** | Connecté, il est renvoyé à la page d'accueil : aucune de ses pages n'est atteignable |
| Partenaire | Backend **partiel**, interface **inaccessible** | Même blocage ; pas de « mes formations », pas de suivi du revenu partagé |

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

## 3. Visiteur / candidat — site public (78 %)

| # | Fonctionnalité | Impl. | Test | Constat |
|---|---|---|---|---|
| V1 | Accueil | ● | ✅ | Cohorte et formations viennent de l'API. Le texte éditorial (titres, témoignages, bandeaux) est codé en dur. |
| V2 | Catalogue `/formations` (domaines, niveau, format, métier, prestataire) | ● | ✅ | Filtres opérationnels, données de l'API. |
| V3 | Fiche formation (gabarit interne/partenaire, sessions, places, tarif) | ◐ | ⚠️ | Pour la formation Scrum, les blocs « Pour qui », « À la fin de la formation » et « Programme » sont **vides**. Le bouton « Télécharger le programme » ne réagit pas. |
| V4 | Candidature (modale : session, pays, code promo) | ● | ⏳ | reCAPTCHA : à tester par le PO. Les champs et la disponibilité des places s'affichent. |
| V5 | Page de paiement `/paiement/:token` | ● | ✅ | Instructions, déclaration, dépôt de justificatif, états (à payer, en vérification, payé), facture téléchargeable. Le **reçu public existe côté API mais n'est pas proposé**. |
| V6 | Coaching | ◐ | ⚠️ | Vitrine uniquement : les créneaux (Lun 18h…) sont décoratifs, aucune réservation, tarifs « Sur devis », tous les boutons renvoient vers le formulaire de contact. |
| V7 | Entreprises + diagnostic | ● | ⏳ | Formulaire présent (reCAPTCHA). « Télécharger la plaquette » non vérifié. |
| V8 | Alumni | ◐ | ⚠️ | Page fonctionnelle mais **aucune donnée** (0 alumni, 0 projet en base). |
| V9 | Ressources / blog | ◐ | ⚠️ | Page avec recherche, filtres et newsletter, mais « Ressources » est badgé « EN COURS » dans l'en-tête et « Blog » dans le pied de page alors que la page existe. |
| V10 | Contact + FAQ | ● | ⏳ | Formulaire présent (reCAPTCHA) ; deux profils (particulier / entreprise). |
| V11 | Devenir partenaire | ● | ⏳ | Formulaire présent (reCAPTCHA). |
| V12 | À propos | ● | ✅ | Équipe et liens LinkedIn. |
| V13 | Quiz d'orientation | ● | ✅ | 5 questions → recommandation de formation. |
| V14 | Masterclass | ◐ | ⚠️ | Page figée sur un événement passé (24 mars 2026, « inscriptions closes ») ; l'admin parle du 20 mars. Pas de gestion d'événements. |
| V15 | Newsletter (inscription, confirmation, désinscription) | ● | ⏳ | Pages présentes ; test à faire avec reCAPTCHA. |
| V16 | Vérification d'un certificat `/certificats/:id` | ● | ✅ | Affiche le nom, la formation, le signataire, les compétences, le PDF ; état « révoqué » prévu. |
| V17 | Responsive mobile | ● | ✅ | Aucun débordement horizontal sur les 13 pages publiques testées. |
| V18 | En-tête adapté à l'utilisateur connecté (« Mon espace ») | ○ | ❌ | Connecté, l'en-tête continue d'afficher « Connexion ». |
| V19 | PWA installable | ○ | — | Aucun manifeste ni service worker (prévu au cahier). |
| V20 | Page 404 | ● | ✅ | |

---

## 4. Apprenant (66 %)

| # | Fonctionnalité | Impl. | Test | Constat |
|---|---|---|---|---|
| L1 | Connexion (mot de passe) | ● | ✅ | Redirection vers `/espace`. |
| L1b | Connexion par lien / code, Google | ● | ⏳ | Les modes s'affichent d'après `/auth/options`. Échecs (code invalide, jeton invalide) conformes (message générique). La réussite exige le code reçu par e-mail. |
| L2 | Verrouillage après 5 échecs | ● | ✅ | 429 au 6ᵉ essai ; message + bouton « lien par e-mail » affichés. |
| L3 | Définition du mot de passe à l'invitation | ● | ✅ | Parcours exercé sur les comptes de test. |
| L4 | Tableau de bord | ◐ | ⚠️ | Statistiques, reprise de leçon, lives, formations OK. Les « À faire » ne sont **pas cliquables** (« Régler l'échéance 2/2 » n'ouvre pas de lien de paiement). Incohérence : « Rendre votre projet final » persiste sur Power BI alors que le certificat est délivré. |
| L5 | Mes formations | ● | ✅ | Statuts : à venir, en cours, certifiée. |
| L6 | Lecteur de cours | ● | ✅ | Vidéo intégrée via `videoEmbedUrl`, ressources (dont verrou « après le quiz »), progression, déblocage séquentiel, navigation. |
| L7 | Notes personnelles | ◐ | ⚠️ | Enregistrées uniquement dans le navigateur (perdues au changement d'appareil). |
| L8 | Questions au formateur | ● | ✅ | Envoi, liste, réponse reçue par l'apprenant. |
| L9 | Quiz | ● | ✅ | Tirage, correction, tentatives, seuil. |
| L10 | Projet final (dépôt, retours) | ● | ⚠️ | Fonctionne, mais l'échec de dépôt n'affiche que « Échec du dépôt » sans le motif renvoyé par le serveur (bucket manquant en local, taille, format). |
| L11 | Conditions du certificat | ● | ✅ | Calculées par le serveur, affichées avec progression. |
| L12 | Calendrier & lives | ◐ | ⚠️ | Dérivé du programme côté front. L'API dédiée `/learner/calendar` existe et n'est pas utilisée. |
| L13 | Ressources | ◐ | ⚠️ | Idem : `/learner/resources` non utilisé. |
| L14 | Certificats (liste, PDF, vérification, LinkedIn) | ● | ✅ | PDF généré (≈ 118 Ko), lien LinkedIn fourni par l'API. |
| L15 | Profil | ◐ | ⚠️ | Nom, e-mail, changement de mot de passe. `/learner/profile` (téléphone, pays) et `/learner/password` existent côté API sans écran. |
| L16 | Mes paiements, reçus, attestation | ○ | ❌ | L'API fournit paiements, reçus PDF et attestation de formation ; aucun écran. |
| L17 | Notifications | ○ | — | Pas de centre de notifications (la cloche a été retirée car sans backend). |
| L18 | Communauté | ○ | — | Aucun backend ; entrée retirée du menu. |
| L19 | Hors ligne / audio seul / économie de données | ○ | — | Prévu à la maquette mobile, non implémenté. |
| L20 | PWA | ○ | — | Voir V19. |
| L21 | Responsive | ● | ✅ | Pas de débordement horizontal sur le lecteur de cours (test mobile). |

---

## 5. Admin — SUPER_ADMIN / ADMIN (69 %)

| # | Fonctionnalité | Impl. | Test | Constat |
|---|---|---|---|---|
| A1 | Tableau de bord (KPI, entonnoir, courbe, sessions, top formations, répartitions) | ● | ✅ | Données réelles ; périodes 7/30/90 jours/12 mois et personnalisée ; pastilles de menu via `/stats/actions`. |
| A2 | Paiements (suivi, avancement par formation) | ● | ✅ | Confirmation exercée de bout en bout. Refus, relance, remboursement non exercés (API OK). |
| A3 | Candidatures (kanban, accepter avec échéances, refuser) | ● | ✅ | L'acceptation renvoie correctement l'erreur « prix numérique manquant » puis envoie le lien. |
| A4 | Inscription manuelle | ○ | ❌ | Bouton « EN COURS ». API `POST /admin/registrations` fonctionnelle. |
| A5 | Annulation d'une inscription / remboursement | ◐ | ⚠️ | Remboursement possible depuis Paiements ; **annulation** sans écran (API prête). |
| A6 | Factures (émission, envoi, annulation, PDF) | ○ | ❌ | API testée : émission 201, liste 200, PDF 200. Aucun écran. |
| A7 | Inscriptions (liste) | ● | ⚠️ | Les compteurs ignorent le statut « Terminé » (affiche 0 confirmée / 0 en attente pour 2 inscriptions). |
| A8 | Formations (liste, fiche, publication) | ● | ✅ | Bouton « Programme » ajouté. |
| A9 | Éditeur de programme (modules, leçons, vidéo, ressources, quiz, projet, règles du certificat) | ● | ✅ | Création et enregistrement vérifiés ; Vimeo/YouTube reconnus. |
| A10 | Domaines | ● | ✅ | CRUD OK. |
| A11 | Partenaires (+ logo) | ● | ✅ | |
| A12 | Sessions (CRUD) | ● | ✅ | Écran large : défilement horizontal sur mobile. |
| A13 | Affectation d'un formateur à une session | ○ | ❌ | API OK (testée) ; aucun sélecteur. |
| A14 | Suivi de session (tableau, appel) | ◐ | ⚠️ | KPI et tableau OK. Boutons « Ajouter un apprenant » et « Envoyer un message » et « Délivrer le certificat » inactifs (« EN COURS »). |
| A15 | Messages de session, questions des apprenants, correction du projet | ○ | ❌ | API testée : réponse 200, message 202, correction 200. Aucun écran. |
| A16 | Certificats (liste, révocation, renvoi, dérogation `force`) | ○ | ❌ | API OK (409 explicite si conditions manquantes, 400 sans motif). |
| A17 | Apprenants (inviter, activer/désactiver, accès) | ● | ✅ | Invitation par e-mail OK. |
| A18 | Comptes back-office | ● | ✅ | Création/invitation par rôle ; réservé SUPER_ADMIN. |
| A19 | Codes promo / parrainage | ● | ✅ | Création, validation publique, suppression OK. |
| A20 | Boîte de messages (contact, diagnostic, partenaire) | ● | ✅ | |
| A21 | Newsletter (liste) | ● | ✅ | |
| A22 | Masterclass (inscrits) | ◐ | ⚠️ | Un seul événement figé. |
| A23 | Témoignages | ● | ✅ | |
| A24 | Alumni | ● | ✅ | |
| A25 | Projets alumni | ● | ✅ | |
| A26 | Contenus du site (`site-settings`) | ○ | ❌ | API disponible, base vide, aucun écran : rien du site n'est éditable. |
| A27 | Journal d'e-mails | ○ | ❌ | API disponible (`/admin/email-logs`) ; le dashboard compte les e-mails en échec sans lien vers leur détail. |
| — | Page « Services » (héritée) | — | ⚠️ | Page orpheline hors menu, vide : à supprimer. |

---

## 6. Éditeur, formateur, partenaire

### Éditeur (EDITOR)
- **API** ✅ : accès aux contenus (formations, domaines, partenaires, messages, témoignages, alumni, projets, newsletter, site-settings), refusé sur candidatures, paiements, codes promo, comptes.
- **Interface** ⚠️ : le menu affiche Candidatures, Inscriptions, Codes parrainage et Apprenants alors que l'API les refuse (403). Ces pages s'affichent **vides, sans message** (« Aucun apprenant »), ce qui laisse croire à une absence de données.

### Formateur (TRAINER)
- **API** ✅ : droits par session corrects (403 « Cette session ne vous est pas confiée » avant affectation, 200 après) ; suivi, appel, projets, questions, messages, certificats.
- **Interface** ❌ : après connexion, atterrissage sur l'accueil public. `/admin`, `/admin/sessions/:id`, `/admin/formations/:id`, `/espace` renvoient tous vers `/`. La page de suivi de session existe mais est **inatteignable**.
- **Manque API** : pas de « mes sessions » (`/admin/sessions` renvoie une erreur 500 : la route n'existe pas).

### Partenaire (PARTNER)
- **API** ✅ : accès à l'éditeur de programme et au projet **de ses formations uniquement** (autre formation : 403).
- **Interface** ❌ : même blocage que le formateur.
- **Manque** : pas de liste « mes formations », pas de suivi des inscriptions ni du **revenu reversé** (30 % pour Agile Sénégal), pas d'accès au suivi de ses sessions (403).

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
| T10 | Tests automatisés | Moyenne | Backend : 33 classes de test. **Front : aucun** (ni unitaire ni e2e). |
| T11 | PWA / mode hors ligne | Faible | Absent (voir V19). |
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
- Forum / communauté d'apprenants (aucun backend, entrée retirée du menu).

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
