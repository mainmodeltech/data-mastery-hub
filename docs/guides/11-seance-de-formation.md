# Préparer et animer la séance de formation de l'équipe

Plan type pour **une journée** (ou deux demi-journées) avec toute l'équipe. Il s'appuie sur les guides par profil et sur l'environnement de **recette (staging)**, jamais sur des données réelles.

## 1. Avant la séance (équipe produit, la veille)

| À préparer | Détail |
|---|---|
| **Environnement** | Staging à jour (dernière version) ; messagerie de test configurée (les e-mails arrivent dans des boîtes de test) |
| **Comptes de test** | Un compte par profil (Direction, Finance, Admissions, Pédagogie, Communication, Formateur, Partenaire, Audit) + 2 comptes **apprenant** de test. Mot de passe transmis **séparément** (pas dans la convocation). Double authentification **configurée à l'avance** pour tous, ou prévoir 10 minutes pour la faire ensemble |
| **Données de départ** | 1 formation publiée avec 1 module (vidéo, ressource, **quiz à 1 tentative**), 1 projet final, 1 session ouverte avec un formateur affecté ; 6 candidatures de test à des stades différents (nouvelle, paiement en attente, paiement déclaré, inscrite…) ; 1 paiement confirmé prêt à être remboursé ; 1 apprenant qui remplit les conditions du certificat ; 1 masterclass à venir |
| **Salle** | Un poste par personne, navigateur à **100 %**, densité d'affichage à *Compact* si besoin |
| **Documents** | Guide du profil imprimé ou ouvert ; [bases communes](00-bases-communes.md) ; [parcours de bout en bout](10-parcours-de-bout-en-bout.md) projetés |

## 2. Déroulé conseillé

| Horaire | Durée | Séquence | Format | Support |
|---|---|---|---|---|
| 9 h 00 | 20 min | **Accueil, objectifs, règles du jeu** (environnement de test : on peut tout casser) | Plénière | — |
| 9 h 20 | 40 min | **Bases communes** : connexion et double authentification (tout le monde la configure), menu, pastilles, densité, **profils**, **règle des quatre yeux**, **journal d'audit** | Plénière + pratique | [Bases communes](00-bases-communes.md) |
| 10 h 00 | 15 min | Pause | | |
| 10 h 15 | 45 min | **Démonstration du parcours 1** « du visiteur à l'apprenant inscrit » : on voit chaque profil agir à son tour (candidature, acceptation, paiement déclaré, confirmation, accès) | Démo guidée, quelqu'un joue chaque rôle | [Parcours de bout en bout](10-parcours-de-bout-en-bout.md) |
| 11 h 00 | 90 min | **Ateliers par profil** : chacun déroule les « *Parcours à répéter en séance* » de son guide avec son compte de test. Un animateur par atelier | Ateliers en parallèle (Admissions + Direction · Finance · Pédagogie + Formateur + Partenaire · Communication + Audit) | Guides 01 à 08 |
| 12 h 30 | 60 min | Déjeuner | | |
| 13 h 30 | 60 min | **Jeux de rôles croisés** (voir §3) : chaque scénario oblige deux profils à se passer la main | Binômes / trinômes | §3 |
| 14 h 30 | 15 min | Pause | | |
| 14 h 45 | 45 min | **Du côté de l'apprenant** : parcourir l'espace apprenant, comprendre ce qu'il voit ; répondre aux « questions fréquentes » | Pratique + débat | [Espace apprenant](09-apprenant.md) |
| 15 h 30 | 30 min | **Revue des règles** : qui répond aux messages, délais, **ce qu'on ne fait jamais** (partager un mot de passe, envoyer des données personnelles par messagerie personnelle, promettre un remboursement avant validation) ; décisions à prendre (§4) | Plénière | §4 |
| 16 h 00 | 30 min | **Auto-évaluation** (§5), questions, prochaines étapes (ouverture de l'accès aux vrais comptes, contact support) | Plénière | §5 |

## 3. Jeux de rôles croisés

À jouer en **binômes**, avec les comptes de test de chaque profil. Chaque scénario se termine par la lecture de la ligne dans le **journal d'audit**.

| # | Scénario | Profils | À constater |
|---|---|---|---|
| 1 | **Candidature express** : une candidature arrive, on l'accepte, l'apprenant déclare son paiement, on le confirme | Admissions · Finance (+ apprenant) | L'accès s'ouvre seulement après la confirmation ; l'invitation part ; audit : *Candidature acceptée*, *Paiement confirmé* |
| 2 | **Virement hors site** : Admissions saisit un virement ; la Finance le confirme. Puis **la même personne** tente de saisir *et* confirmer | Admissions · Finance | Refus « une autre personne doit confirmer » ; avec une seule personne habilitée : possible, ligne **Sans second contrôle** |
| 3 | **Remboursement** : demande par la Finance, validation par la Direction, puis refus d'une autre demande | Finance · Direction | Statut, annulation de l'inscription, places libérées ; audit à 3 lignes |
| 4 | **Remise commerciale** : un client entreprise négocie −20 % | Admissions · Direction | Seule la Direction (ou un double profil) peut accepter à un autre montant ; audit **Dérogation** |
| 5 | **Quiz raté à 1 tentative** | Formateur · Apprenant · Pédagogie | Accorder une tentative (motif) ; l'apprenant refait le quiz ; audit |
| 6 | **Question avec du code** : l'apprenant pose une question avec un extrait DAX ; le formateur répond avec un bloc de code | Apprenant · Formateur | Mise en forme et coloration des deux côtés ; aucune balise HTML interprétée |
| 7 | **Certificat** : l'apprenant éligible n'a rien reçu ; la pédagogie prévisualise puis valide ; l'apprenant le voit après | Pédagogie · Apprenant | Rien avant validation ; e-mail et PDF après ; lien de vérification valide ; révoquer → non valide |
| 8 | **Masterclass** : créer, publier, s'inscrire, pointer la présence, écrire aux absents | Communication · Pédagogie | Confirmation par e-mail ; message reçu |
| 9 | **Départ d'un collaborateur** : désactiver le compte | Direction | Le compte ne peut plus se connecter ; audit : *Compte modifié* |
| 10 | **Contrôle** : retrouver toutes les actions « à surveiller » du jour | Audit | Filtre « À surveiller » ; lecture des détails |

## 4. Décisions à prendre en équipe (à noter pendant la séance)

1. **Qui négocie les remises** ? (dérogation de prix = droit « Déroger au prix » + « Décider une candidature »)
2. **Qui confirme les paiements** quand la Finance est absente ? (Direction en secours, avec le marquage « Sans second contrôle » si elle est seule habilitée)
3. **Délais de réponse** : messages entrants, questions des apprenants, paiements déclarés, candidatures.
4. **Qui crée les masterclass**, et à quel rythme ?
5. **Qui répond aux candidats refusés** (aucun e-mail automatique) ?
6. **Revue des accès** : date de la première revue trimestrielle ; qui lit le journal d'audit chaque semaine ?
7. **Interlocuteur support** pour les incidents (compte bloqué, e-mail non reçu, bug).

## 5. Auto-évaluation (fin de séance)

Chaque participant coche ce qu'il sait faire **seul**, sans le guide.

**Tous** — ☐ me connecter avec la double authentification · ☐ retrouver mes alertes · ☐ expliquer la règle des quatre yeux · ☐ dire où voir « qui a fait quoi ».

**Admissions** — ☐ accepter une candidature en 2 échéances · ☐ refuser avec un motif · ☐ retrouver un dossier par téléphone · ☐ saisir un paiement hors site · ☐ créer une inscription manuelle · ☐ inviter / désactiver un apprenant · ☐ traiter un message.

**Finance** — ☐ confirmer et refuser un paiement · ☐ demander et valider un remboursement · ☐ émettre, envoyer, annuler une facture · ☐ modifier un prix · ☐ créer un code parrainage (≤ 30 %).

**Pédagogie** — ☐ créer un module avec un quiz · ☐ régler les règles du certificat · ☐ affecter un formateur · ☐ accorder des tentatives · ☐ prévisualiser et valider un certificat · ☐ créer une masterclass.

**Communication** — ☐ modifier une page et la restaurer · ☐ publier un témoignage · ☐ créer un alumni et un projet · ☐ exporter les abonnés confirmés.

**Formateur** — ☐ faire l'appel · ☐ corriger un projet · ☐ répondre avec un bloc de code · ☐ écrire à la session.

**Partenaire** — ☐ ajouter un module et une leçon · ☐ saisir les questions d'un quiz · ☐ utiliser l'aperçu apprenant.

**Direction** — ☐ créer un compte et ses profils · ☐ réinitialiser une double authentification · ☐ lire la matrice des droits · ☐ utiliser « À surveiller » dans l'audit.

**Audit** — ☐ filtrer le journal par personne et par action · ☐ comprendre les marquages *Sans second contrôle* et *Dérogation*.

Une personne qui **n'a pas coché** une case à la fin de la journée : binôme de rattrapage dans la semaine.

## 6. Après la séance

- Envoyer à chacun **son guide** et le chapitre [bases communes](00-bases-communes.md).
- Consigner les **questions sans réponse** et les décisions du §4 ; les intégrer aux guides.
- Prévoir un **point à J+15** : questions réelles, blocages, ajustement des droits.
- Prévoir la **première revue trimestrielle** des accès (matrice des droits) et le **premier relevé hebdomadaire** du journal d'audit.
