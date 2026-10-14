# Guide — Profil **Lecture seule / Audit**

> Public : l'expert-comptable, un associé, un auditeur : toute personne qui doit **voir** sans pouvoir **modifier**. Prérequis : [bases communes](00-bases-communes.md).

## 1. Votre rôle

Vous **contrôlez**. Vous voyez les chiffres, les paiements, les factures et surtout le **Journal d'audit**, sans aucun bouton d'action : rien de ce que vous faites ne peut modifier une donnée. Même par l'adresse directe d'une page d'action, le serveur répond « refusé ».

## 2. Ce que vous voyez

Mon espace · **Tableau de bord** (finances et activité) · Formations, Domaines, Sessions (lecture) · Partenaires (lecture) · Candidatures (lecture) · **Paiements** (lecture) · **Factures** (lecture) · **Codes parrainage** (lecture) · Journal d'e-mails · **Journal d'audit**.

## 3. Le journal d'audit

*Menu : Équipe & comptes → **Journal d'audit**.*

### 3.1 Ce qu'il contient

Une ligne par action sensible, avec **qui** (nom, e-mail, profils au moment de l'action), **quand** (date et heure à la seconde), **quoi** (libellé + résumé lisible avec les noms, les montants et le motif), **d'où** (adresse IP) et, dans le détail, les valeurs **avant / après**.

| Catégorie | Actions consignées |
|---|---|
| **Paiements** | Paiement saisi hors site · confirmé · refusé · remboursement demandé · effectué · refusé ou retiré · facture créée · annulée |
| **Admissions** | Candidature acceptée · refusée · inscription annulée · statut modifié · candidature supprimée · inscription manuelle · compte apprenant créé · activé ou désactivé |
| **Tarifs** | Prix d'une formation ou d'une session modifié · code de parrainage créé / modifié / désactivé / supprimé · part de revenu d'un partenaire modifiée |
| **Pédagogie** | Certificat délivré · validé et envoyé · révoqué · tentatives de quiz accordées |
| **Comptes et droits** | Compte créé · profils ou activation modifiés · double authentification réinitialisée · profil créé, modifié (droits ajoutés / retirés), rétabli, supprimé |
| **Site** | Contenu d'une page modifié ou rétabli |

### 3.2 Ses garanties

- **Ajout seul** : aucune ligne ne peut être modifiée ni supprimée — la base de données elle-même l'interdit, y compris pour les administrateurs.
- **Écrit dans la même opération que l'action** : si l'action échoue, la trace n'existe pas ; si la trace ne peut pas être écrite, l'action n'a pas lieu.
- **Auteur et adresse IP relevés par le système**, jamais saisis à la main.

### 3.3 Comment l'utiliser

- **Période** : *Aujourd'hui, 7 jours, 30 jours, Tout*.
- **Filtres** : catégorie, action précise, **personne** (nom ou e-mail), **texte libre** (un nom de candidat, un montant…).
- **« À surveiller »** : ne montre que les lignes marquées
  - **Sans second contrôle** — une action qui devait être validée par une autre personne et ne l'a pas été faute d'autre personne habilitée (paiement saisi et confirmé par la même personne, remboursement exécuté directement) ;
  - **Dérogation** — une candidature acceptée à un **montant différent du tarif**, un certificat délivré **sans que les conditions soient remplies**.
- **Détails** : la flèche à gauche de chaque ligne déplie l'adresse IP, l'élément concerné et les valeurs.
- La pagination est de 30 lignes ; resserrer les filtres plutôt que de tout parcourir.

### 3.4 Revue type (30 minutes par mois)

1. **« À surveiller »** sur le mois : combien de lignes ? Les justifications sont-elles dans les motifs ?
2. Catégorie **Comptes et droits** : un compte créé, un droit ajouté, une double authentification réinitialisée — par qui, pourquoi ?
3. Catégorie **Tarifs** : un prix ou un code de parrainage modifié sans raison apparente ?
4. Catégorie **Paiements** : rapprocher les remboursements effectués des demandes ; pas de remboursements répétitifs pour le même motif.
5. **Tableau de bord** : encaissé vs paiements confirmés de l'audit.
6. Noter les écarts et les remonter à la Direction.

## 4. Limites à connaître

- Le journal couvre les actions **faites dans la plateforme**, pas ce qui se passe en dehors (virements réellement émis, ce que dit un relevé bancaire).
- Les **exports** (CSV) ne sont pas tracés individuellement.
- Les actions **automatiques** du système (relances de paiement, préparation d'un certificat « à valider », e-mails) ne figurent pas dans ce journal : les e-mails ont leur propre **Journal d'e-mails**.

## 5. Parcours à répéter en séance

1. Ouvrir le **Tableau de bord** et le **Journal d'audit**.
2. Filtrer sur **Paiements** → **Remboursement demandé** : lire le résumé et le détail.
3. Activer **« À surveiller »** : repérer une ligne **Sans second contrôle**, comprendre pourquoi.
4. Chercher toutes les actions d'une **personne** donnée sur 7 jours.
5. Tenter une action (par exemple ouvrir une candidature) : constater qu'aucun bouton d'action n'existe.
