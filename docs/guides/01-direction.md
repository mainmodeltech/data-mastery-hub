# Guide — Profil **Direction**

> Public : les 1 à 2 personnes qui dirigent la plateforme. Prérequis : [bases communes](00-bases-communes.md).

## 1. Votre rôle

La Direction a **tous les droits**, y compris ceux qui seront ajoutés plus tard. Elle est la seule à pouvoir :

- créer les comptes de l'équipe et leur attribuer des profils (**Comptes back-office**) ;
- ajuster ce que chaque profil peut faire (**Profils & droits**) ;
- consulter le **Journal d'audit** (avec le profil *Lecture seule / Audit*).

Elle peut aussi tout ce que font les autres profils : c'est utile pour dépanner, mais **à utiliser avec discipline** (voir §5).

## 2. Ce que vous voyez

Tout le menu. Le **Tableau de bord** et **Mon espace** sont vos pages de départ.

## 3. Vos tâches

### 3.1 Piloter avec le tableau de bord

*Menu : Tableau de bord.*

- **À traiter** : les files d'attente (candidatures à examiner, paiements à confirmer, remboursements à valider, échéances en retard, certificats à valider, messages non lus, questions sans réponse, projets à corriger, lives des 7 jours, e-mails en échec). Un clic mène à la bonne page.
- **Période** (7 jours, 30 jours, 90 jours, 12 mois, ou dates libres puis *Appliquer*) : encaissé, reste à encaisser, en retard, candidatures acceptées, inscriptions payées, apprenants actifs.
- **Parcours des candidatures** : déposées → acceptées → payées, avec le taux de conversion global.
- **Évolution mensuelle**, **remplissage des sessions**, **formations les plus demandées**, **répartitions** (source, profil, pays, code promo), **apprenants et certificats**, **newsletter et messages**.
- Un montant n'est visible que si le profil a le droit financier : Admissions, Pédagogie, etc. voient l'activité **sans les montants**.

### 3.2 Créer un compte pour un nouvel arrivant

*Menu : Équipe & comptes → Comptes back-office → Nouveau compte.*

1. Saisir l'**e-mail** et le **nom complet**.
2. Choisir **un ou plusieurs profils** (voir la description de chaque profil dans la fenêtre).
3. Pour un profil *Partenaire*, choisir le **partenaire rattaché** (obligatoire : la personne ne verra que les formations de cet organisme).
4. Enregistrer : une **invitation** part par e-mail. La personne choisit son mot de passe puis configure la double authentification.

Principe de **moindre privilège** : on donne le profil du métier, pas « Direction par précaution ». Vous ne pouvez attribuer que des profils dont les droits sont inclus dans les vôtres.

### 3.3 Modifier, désactiver, dépanner un compte

- **Modifier** (stylo) : changer les profils, le nom, ou **désactiver** le compte (connexion refusée, sessions fermées). Un départ = désactiver le compte le jour même.
- **Réinitialiser la double authentification** : pour un collègue qui a perdu son téléphone. Ses sessions sont fermées, il est prévenu par e-mail, il reconfigure à la prochaine connexion. Vous **ne pouvez pas** le faire pour votre propre compte : demandez à l'autre membre de la Direction.
- Garde-fous : on ne peut ni désactiver son propre compte, ni retirer son propre profil Direction, ni retirer le **dernier** compte Direction actif.

### 3.4 Gérer les profils et leurs droits

*Menu : Équipe & comptes → Profils & droits.*

- **Profils** : liste des profils avec leurs droits ; *Nouveau profil* pour un profil sur mesure (ex. « Assistante admissions » sans la décision) ; *Rétablir les droits par défaut* pour revenir au réglage de départ ; *Supprimer* (impossible pour un profil livré, ni s'il est encore attribué).
- **Matrice des droits** : le tableau « qui peut faire quoi ». **À relire chaque trimestre** : quelqu'un a-t-il encore des droits dont il n'a plus besoin ?
- Les profils livrés sont ajustables, sauf **Direction** (fixe : tous les droits).
- Un changement de droits s'applique **immédiatement côté serveur** ; le menu de la personne se met à jour à sa prochaine connexion (au plus 15 minutes).

### 3.5 Le journal d'audit

*Menu : Équipe & comptes → Journal d'audit.*

- Filtrer par **période** (Aujourd'hui, 7 jours, 30 jours, Tout), **catégorie** (Paiements, Admissions, Tarifs, Pédagogie, Comptes et droits, Site), **action**, **personne**, texte libre.
- Le bouton **« À surveiller »** n'affiche que les lignes marquées :
  - **Sans second contrôle** : une action qui aurait dû être validée par une autre personne et ne l'a pas été faute d'autre personne habilitée ;
  - **Dérogation** : une candidature acceptée à un montant différent du tarif, un certificat délivré sans remplir les conditions.
- Cliquer sur la flèche d'une ligne pour voir le détail (adresse IP, montants, ancienne et nouvelle valeur…).
- **Habitude conseillée : 10 minutes par semaine** sur « À surveiller » + les modifications de comptes et de droits.

### 3.6 Valider les remboursements (avec la Finance)

*Menu : Paiements → filtre « Remboursements à valider ».*

Quand une personne de la Finance demande un remboursement, la pastille du menu **Paiements** s'allume pour vous. Lire le motif, puis **Valider le remboursement** (l'argent est considéré rendu, l'accès fermé s'il ne reste rien de payé) ou **Refuser la demande** (motif obligatoire, le paiement reste confirmé). Vous ne validez jamais **votre propre** demande si un autre habilité existe.

### 3.7 Valider les certificats, régler les codes promo, etc.

Ces tâches relèvent d'autres profils mais restent à votre portée — voir les guides [Pédagogie](04-pedagogie.md) et [Finance](02-finance.md).

## 4. À faire régulièrement

| Fréquence | Action |
|---|---|
| Chaque jour | Tableau de bord → « À traiter » ; pastilles du menu |
| Chaque semaine | Journal d'audit → « À surveiller » ; vérifier que les remboursements demandés sont traités |
| Chaque mois | Journal d'e-mails (échecs) ; comptes inutilisés à désactiver |
| Chaque trimestre | Matrice des droits : revue des accès |
| À chaque départ | Désactiver le compte, vérifier qu'aucune file n'est restée sans personne |

## 5. Bonnes pratiques propres à la Direction

- **Ne pas faire « à la place » en silence** : si vous saisissez un paiement et le confirmez vous-même parce que vous êtes seul, l'action est marquée *Sans second contrôle* — c'est normal tant que l'équipe est réduite, mais c'est ce qui sera regardé en audit. Dès qu'une personne de la Finance est recrutée, créez son compte : la règle des quatre yeux s'applique automatiquement.
- **Codes promo > 30 %** : plafonnés. Un ancien code au-dessus est signalé « À corriger » et refusé aux candidats ; à corriger avant de continuer à le diffuser.
- **Deux Directions, pas plus**, de préférence : l'une peut réinitialiser la double authentification de l'autre.
- **Les anciens profils** *Gestion complète (transition)* et *Éditeur* doivent être remplacés par des profils métier, puis retirés.

## 6. Parcours à répéter en séance

1. Créer un compte pour un collègue fictif (profil Admissions), vérifier l'e-mail d'invitation.
2. Ouvrir *Profils & droits*, comparer *Finance* et *Admissions* dans la matrice.
3. Demander un remboursement avec un compte Finance, le valider avec le compte Direction, puis lire la ligne dans le **Journal d'audit**.
4. Filtrer l'audit sur « À surveiller ».
5. Désactiver le compte fictif.
