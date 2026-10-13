# Guide de recette — staging (12 octobre 2026)

Pour les collaborateurs qui testent la plateforme Model Technologie : ce que chaque profil peut faire, et les parcours à dérouler.
Remplacez `<STAGING>` par l'adresse du site de staging que vous communique l'équipe produit.

## 0. À lire avant de commencer

**Environnement de test.** Les données sont fictives. Ne saisissez jamais de vraies données de clients ni de vrais moyens de paiement.

**Ce qui n'est PAS encore dans cette version** (ne le signalez pas comme anomalie) :
- les profils **Financier** et **Manager** : ils sont spécifiés mais pas encore développés ; pour l'instant le rôle **Admin** cumule leurs droits ;
- l'installation du site en application (PWA) ne se teste que sur le site en HTTPS ;
- la lecture **hors ligne** ne fonctionne que pour les vidéos hébergées sur la plateforme (pas YouTube ni Vimeo) ;
- la CGU / contrat de formation, les pages légales, la recherche globale, les notifications WhatsApp.

**Double authentification (personnel).** Tout compte du back-office (Super Admin, Admin, Éditeur, Formateur, Partenaire) doit configurer une application d'authentification (Google Authenticator, Microsoft Authenticator, Authy, 1Password…) à sa **première connexion**, puis saisir un code à 6 chiffres à chaque connexion. Prévoyez votre téléphone et **notez les 10 codes de secours** affichés à la fin de la configuration (ils ne s'affichent qu'une fois). Les apprenants ne sont pas concernés.

**Session.** Elle se renouvelle toute seule pendant que vous travaillez ; fermer l'onglet puis revenir dans la journée ne demande pas de se reconnecter. Changer son mot de passe ferme toutes les sessions : reconnectez-vous ensuite.

**E-mails.** Les e-mails partent réellement (invitations, liens de paiement, certificats). Utilisez **votre propre adresse** pour les comptes de test. Les messages envoyés aux candidats fictifs d'autres personnes n'arriveront nulle part : utilisez des adresses que vous contrôlez (`prenom+test1@gmail.com` fonctionne avec Gmail).

**Captcha.** Les formulaires publics (candidature, contact, diagnostic, inscription masterclass) sont protégés par reCAPTCHA : il est invisible, mais un navigateur avec bloqueur de scripts peut le faire échouer.

**Comment signaler un problème** : une ligne par anomalie — *profil utilisé, page (adresse), ce que vous avez fait, ce que vous attendiez, ce qui s'est passé, capture d'écran, heure*. Ne copiez jamais un mot de passe ou un lien de connexion dans un message.

## 1. Préparation (équipe produit, une fois)

1. Se connecter avec le **Super Admin** (`<STAGING>/connexion`).
2. **Comptes** (menu *Équipe & comptes → Comptes back-office*) : créer un compte par rôle de test, chacun avec l'e-mail d'un collaborateur :
   | Rôle à créer | Pour tester |
   |---|---|
   | Admin | gestion complète sauf comptes |
   | Éditeur | catalogue et contenus |
   | Formateur | suivi de ses sessions |
   | Partenaire (rattaché à un partenaire du catalogue) | programme de ses formations |
   Chaque personne reçoit un e-mail d'invitation et définit son mot de passe.
3. **Données minimales** (rôle Admin) : une formation **publiée** avec un prix numérique, une **session ouverte** à venir avec places disponibles, un **programme** (au moins 1 module, 2 leçons dont 1 vidéo YouTube/Vimeo et 1 ressource, 1 quiz avec 3 questions, un projet final), un **code de parrainage**, un **formateur** affecté à la session.
4. Un **partenaire** dans *Catalogue → Partenaires* et une formation qui lui est rattachée.

## 2. Ce que chaque profil peut faire

| Profil | Connexion | Page d'arrivée | Ce que le profil voit et peut faire |
|---|---|---|---|
| **Visiteur** (sans compte) | — | `/` | Parcourir le site, candidater, payer par lien, écrire, s'abonner, vérifier un certificat |
| **Apprenant** | `/connexion` | `/espace` | Suivre ses formations, passer les évaluations, obtenir ses certificats, voir ses paiements, échanger |
| **Formateur** | `/connexion` | `/admin/espace` | Voir **ses** sessions et les suivre : appel, questions des apprenants, correction des projets, messages à la session, certificats |
| **Partenaire** | `/connexion` | `/admin/espace` | Voir **ses** formations et en éditer le programme, la banque de questions, le projet final |
| **Éditeur** | `/connexion` | `/admin/bootcamps` | Catalogue (formations, domaines, partenaires, sessions), masterclass, messages, newsletter, pages du site, témoignages, alumni, projets |
| **Admin** | `/connexion` | `/admin` | Tout ce que fait l'Éditeur **plus** : tableau de bord, candidatures, paiements, inscriptions, factures, certificats, codes de parrainage, communauté, journal d'e-mails, apprenants |
| **Super Admin** | `/connexion` | `/admin` | Tout ce que fait l'Admin **plus** : comptes du back-office (création, rôles, partenaire rattaché, activation) |

Détail du menu d'administration par rôle (✔ visible, – masqué) :

| Entrée du menu | Super Admin | Admin | Éditeur | Formateur | Partenaire |
|---|:-:|:-:|:-:|:-:|:-:|
| Mon espace (mes sessions / mes formations) | – | – | – | ✔ | ✔ |
| Tableau de bord | ✔ | ✔ | – | – | – |
| Formations, Domaines, Partenaires, Sessions | ✔ | ✔ | ✔ | – | – |
| Éditeur de programme et banque de questions | ✔ | ✔ | ✔ | – | ✔ (ses formations) |
| Candidatures, Paiements, Inscriptions | ✔ | ✔ | – | – | – |
| Masterclass | ✔ | ✔ | ✔ | – | – |
| Factures, Certificats, Codes parrainage | ✔ | ✔ | – | – | – |
| Messages, Newsletter | ✔ | ✔ | ✔ | – | – |
| Communauté (modération), Journal d'e-mails | ✔ | ✔ | – | – | – |
| Pages du site, Témoignages, Alumni, Projets | ✔ | ✔ | ✔ | – | – |
| Apprenants | ✔ | ✔ | – | – | – |
| Suivi de session | ✔ | ✔ | – | ✔ (ses sessions) | – |
| Comptes back-office | ✔ | – | – | – | – |

## 3. Parcours à tester

Cochez la colonne **OK / KO**. Un parcours se déroule dans l'ordre. Le **parcours 1 → 6** est le fil rouge : un candidat devient apprenant puis diplômé.

### Fil rouge (Visiteur → Admin → Apprenant → Formateur)

| # | Profil | Étapes | Résultat attendu | OK / KO |
|---|---|---|---|:-:|
| 1 | Visiteur | Ouvrir une fiche formation, cliquer **Candidater**, remplir le formulaire avec une adresse que vous contrôlez | Message de confirmation ; la candidature apparaît dans *Admin → Candidatures → Nouvelles candidatures* | ☐ |
| 2 | Admin | *Candidatures* → **Accepter** la candidature : fixer le montant, 2 échéances, valider | Un e-mail avec le **lien de paiement** est envoyé ; la carte passe en « Paiement en attente » | ☐ |
| 3 | Visiteur | Ouvrir le lien de paiement de l'e-mail ; lire les instructions Wave / Orange Money ; **déclarer** un paiement (référence fictive) ; joindre une **capture** (PNG ou JPG) | « Paiement déclaré » ; la capture est acceptée. Un fichier HTML renommé en `.png` doit être **refusé** | ☐ |
| 4 | Admin | *Paiements* → ouvrir la déclaration, **ouvrir la capture** (lien temporaire), **Confirmer** | Statut « Confirmé » ; le candidat reçoit un reçu ; un **compte apprenant** est créé et une invitation envoyée | ☐ |
| 5 | Apprenant | Ouvrir l'invitation, définir le mot de passe, se connecter | Arrivée sur `/espace`, la formation et la prochaine session apparaissent | ☐ |
| 6 | Apprenant | Ouvrir la formation → suivre une leçon vidéo → *Terminer* → ouvrir le quiz → réussir → déposer le projet final | La progression augmente ; le quiz affiche le score et la correction ; le projet est « Soumis » | ☐ |
| 7 | Formateur | *Mon espace* → ouvrir la session → *Questions* : répondre ; *Projets* : corriger et valider | L'apprenant voit la réponse et la validation ; une notification apparaît dans la cloche | ☐ |
| 8 | Admin | *Certificats* : vérifier l'éligibilité, émettre si besoin ; télécharger le PDF | Certificat **valide** avec numéro ; l'apprenant le voit dans *Certificats* | ☐ |
| 9 | Visiteur | Ouvrir l'adresse de vérification du certificat (`/certificats/<identifiant>`) ; **révoquer** le certificat côté Admin puis recharger | « Valide » puis « Révoqué » | ☐ |

### Site public (Visiteur)

| # | Étapes | Résultat attendu | OK / KO |
|---|---|---|:-:|
| 10 | Parcourir l'accueil, formations, coaching, entreprises, alumni, ressources, partenaires, à propos | Photos, textes et chiffres s'affichent ; aucun texte entre crochets ni fausse donnée ; une section vide est masquée | ☐ |
| 11 | Page **Contact** | Carte Google Maps affichée avec l'adresse ; formulaire envoyé → visible dans *Admin → Messages* | ☐ |
| 12 | **Coaching** : choisir une formule | Le formulaire de contact est pré-rempli | ☐ |
| 13 | **Entreprises** : demande de diagnostic ; **Partenaires** : candidature partenaire | Message de confirmation ; la demande est dans *Messages* avec son type | ☐ |
| 14 | **Newsletter** : s'abonner, ouvrir l'e-mail de confirmation, confirmer, puis se désinscrire | Deux pages de confirmation distinctes ; l'abonné passe « Confirmé » puis « Désinscrit » dans *Admin → Newsletter* | ☐ |
| 15 | **Masterclass** : s'inscrire | Confirmation ; inscrit visible dans *Admin → Masterclass* | ☐ |
| 16 | **Orientation** : répondre au quiz jusqu'au résultat | Une recommandation s'affiche | ☐ |
| 17 | Téléphone (ou fenêtre étroite) | Aucun défilement horizontal, menu mobile utilisable | ☐ |
| 18 | Une adresse inexistante | Page 404 | ☐ |

### Connexion et sécurité des comptes (tous profils)

| # | Étapes | Résultat attendu | OK / KO |
|---|---|---|:-:|
| 19 | Se connecter avec un mauvais mot de passe 5 fois | Message de verrouillage temporaire, avec proposition du lien de connexion | ☐ |
| 20 | **Connexion par lien/code** : demander un lien, utiliser le code à 6 chiffres | Connexion réussie ; un code utilisé ne marche pas deux fois | ☐ |
| 21 | **Mot de passe oublié** puis réinitialisation | Message neutre (même pour une adresse inconnue) ; le lien fonctionne une seule fois | ☐ |
| 22 | Se déconnecter puis revenir en arrière dans le navigateur | Retour à la connexion, pas de données visibles | ☐ |
| 23 | Connecté en **Apprenant**, saisir `/admin` ; connecté en **Formateur**, saisir `/admin/paiements` ; connecté en **Éditeur**, saisir `/admin/candidatures` | Redirection vers son propre espace, aucune donnée de l'autre profil | ☐ |
| 24 | Dans l'adresse d'une session, utiliser l'identifiant d'une **session d'un autre formateur** (deux formateurs requis) | Accès refusé | ☐ |
| 25 | Coller dans la barre d'adresse l'ancienne adresse publique d'une capture de paiement (si connue) | Accès refusé (le dossier est privé) | ☐ |

### Double authentification et sessions (personnel)

| # | Profil | Étapes | Résultat attendu | OK / KO |
|---|---|---|---|:-:|
| S1 | Tout le personnel | Première connexion : mot de passe puis écran « Sécurisez votre compte » ; ajouter le compte dans l'application (clé à saisir ou bouton « Ouvrir mon application ») ; saisir le code | Les **10 codes de secours** s'affichent ; le bouton « Accéder au back-office » reste grisé tant que la case « J'ai conservé ces codes » n'est pas cochée | ☐ |
| S2 | Tout le personnel | Se déconnecter, se reconnecter | Après le mot de passe, le code à 6 chiffres est demandé ; un code faux est refusé ; 5 codes faux verrouillent quelques minutes | ☐ |
| S3 | Tout le personnel | Se connecter avec **un code de secours** (lien « Je n'ai plus accès à mon application ») | Connexion réussie ; le même code ne marche pas une seconde fois | ☐ |
| S4 | Tout le personnel | Connexion par **lien/code e-mail** (ou Google) | Le code de l'application d'authentification est demandé ensuite : l'e-mail seul ne suffit plus | ☐ |
| S5 | Tout le personnel | Travailler 20 minutes sans se reconnecter ; recharger la page | La session continue (renouvelée en silence) ; après un rechargement on reste connecté | ☐ |
| S6 | Tout le personnel | Ouvrir le même compte sur un second navigateur, puis changer le mot de passe sur le premier | Le second navigateur est déconnecté à sa prochaine action | ☐ |
| S7 | Super Admin | *Comptes* : repérer l'état « Double authentification » / « À configurer » de chaque compte | État exact pour chacun | ☐ |
| S8 | Super Admin | Réinitialiser le MFA d'un collaborateur (« Réinitialiser le MFA ») ; **essayer sur son propre compte** | Le collaborateur est prévenu par e-mail, ses sessions sont fermées, il reconfigure un appareil ; le bouton n'existe pas pour son propre compte | ☐ |
| S9 | Tout le personnel | Choisir un mot de passe faible (« Password123456 », « motdepasse2026 », son adresse e-mail) lors d'une réinitialisation | Refus avec une explication ; le lien reste utilisable ; 12 caractères minimum | ☐ |
| S10 | Apprenant | Se connecter | **Aucun** code supplémentaire demandé (la double authentification ne concerne pas les apprenants) ; 10 caractères minimum pour son mot de passe | ☐ |

### Administration (Admin / Super Admin)

| # | Profil | Étapes | Résultat attendu | OK / KO |
|---|---|---|---|:-:|
| 26 | Admin | **Tableau de bord** : changer la période (30 jours, 12 mois) | Montants en FCFA, entonnoir, courbe ; pastilles du menu cohérentes avec les files d'attente | ☐ |
| 27 | Admin | **Pages du site** : modifier un titre, enregistrer, recharger la page publique, puis **Restaurer** | Le texte change puis revient ; saisie trop longue (> 20 Ko) refusée proprement | ☐ |
| 28 | Admin | **Inscription manuelle** d'un apprenant ; **Annuler** avec un motif | Compte créé / inscription annulée, motif conservé | ☐ |
| 29 | Admin | **Factures** : créer une facture pour une entreprise, télécharger le PDF | PDF avec les mentions légales (NINEA, RCCM, coordonnées de paiement) | ☐ |
| 30 | Admin | **Codes parrainage** : créer un code, l'utiliser à la candidature | La remise s'applique au montant | ☐ |
| 31 | Admin | **Paiement** : refuser avec motif, relancer, rembourser | Statuts mis à jour ; e-mails au candidat | ☐ |
| 32 | Admin | **Journal d'e-mails** : trouver les e-mails des parcours précédents | Statut Envoyé / Échec / Ignoré lisible | ☐ |
| 33 | Admin | **Communauté** : masquer un message d'un apprenant | Le message disparaît côté apprenant | ☐ |
| 34 | Admin | **Apprenants** : désactiver puis réactiver un compte ; renvoyer l'invitation | L'apprenant désactivé ne peut plus se connecter ; la réactivation rétablit l'accès | ☐ |
| 35 | Super Admin | **Comptes back-office** : créer, changer le rôle, désactiver | Le nouveau rôle est pris en compte à la prochaine page ; impossible de se retirer son propre rôle | ☐ |
| 36 | Admin | **Suivi de session** (ouvrir une session) : appel, export CSV, message à la session | Fichier CSV ouvert sans erreur dans un tableur ; message reçu (utiliser une adresse de test) | ☐ |

### Éditeur, Formateur, Partenaire

| # | Profil | Étapes | Résultat attendu | OK / KO |
|---|---|---|---|:-:|
| 37 | Éditeur | Créer une formation brouillon, la publier ; créer un domaine ; modifier un témoignage | Visible sur le site public après publication | ☐ |
| 38 | Éditeur | Éditer le programme : ajouter un module, une leçon vidéo (lien YouTube ou Vimeo), des ressources, un quiz | L'aperçu vidéo s'affiche ; un lien non YouTube/Vimeo est refusé | ☐ |
| 39 | Éditeur | Menu : vérifier l'absence de *Candidatures*, *Paiements*, *Tableau de bord* | Entrées masquées, pages inaccessibles par adresse directe | ☐ |
| 40 | Formateur | *Mon espace* : seules **ses** sessions sont listées | Aucune session d'un autre formateur | ☐ |
| 41 | Partenaire | *Mon espace* : seules **ses** formations ; éditer le programme d'une formation d'un **autre** partenaire par adresse directe | Accès refusé | ☐ |

### Espace apprenant

| # | Étapes | Résultat attendu | OK / KO |
|---|---|---|:-:|
| 42 | **Mon espace** : reprise de leçon, « À faire » (cliquable), prochains lives | Les éléments pointent vers la bonne page ; une formation certifiée ne génère plus de tâche | ☐ |
| 43 | **Leçon** : onglets Ressources, Description, **Mes notes** (écrire, recharger la page, se reconnecter sur un autre navigateur) | Les notes sont conservées | ☐ |
| 44 | **Leçon** : poser une question à l'équipe | Visible côté Formateur, la réponse arrive en notification | ☐ |
| 45 | **Économie de données** et **Audio seul** | La vidéo se remplace par l'audio / une image fixe, le choix est mémorisé | ☐ |
| 46 | **Évaluations** : quiz avec chronomètre, quitter et reprendre ; tentative ratée puis réussie | Reprise sans perte ; correction affichée | ☐ |
| 47 | **Calendrier & lives** : ajouter un live à son agenda (.ics) | Fichier téléchargé, importable | ☐ |
| 48 | **Ressources** | Les fichiers des leçons s'ouvrent | ☐ |
| 49 | **Communauté** : publier, répondre (un niveau), supprimer son message | Les autres apprenants de la même formation le voient ; le nom public est lisible | ☐ |
| 50 | **Hors ligne** : télécharger une vidéo **hébergée**, couper le réseau, la lire | La vidéo se lit sans connexion ; les vidéos YouTube/Vimeo expliquent pourquoi elles ne sont pas disponibles | ☐ |
| 51 | **Mes paiements** : échéances, télécharger un reçu PDF, payer une échéance en attente | PDF correct ; le lien de paiement s'ouvre | ☐ |
| 52 | **Certificats** : télécharger le PDF, copier le lien de vérification, bouton LinkedIn | PDF avec QR ; lien valide | ☐ |
| 53 | **Mon profil** : modifier les informations et le mot de passe | Enregistré ; l'ancien mot de passe ne marche plus | ☐ |
| 54 | **Cloche** de notifications | Les nouveaux événements apparaissent, marqués lus après ouverture | ☐ |
| 55 | Téléphone : barre d'onglets du bas, lecteur de leçon, panneau Programme | Utilisable au pouce, sans débordement | ☐ |

## 4. Avant d'ouvrir à d'autres testeurs

Rappel (équipe technique) : le staging est joignable depuis Internet. La double authentification protège le back-office, mais l'accès au site peut encore être limité (liste d'adresses autorisées ou authentification de base) tant que la recette dure ; ne pas y charger de données réelles.
