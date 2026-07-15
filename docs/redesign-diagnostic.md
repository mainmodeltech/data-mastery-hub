# Diagnostic — Refonte design model-technologie.com

Branche : `redesign/discovery` (créée depuis `feature/new-design` après commit du travail catalogue).

## 1. Constat du client (reformulé)

- La police paraît petite → difficile à lire.
- Trop d'information → l'utilisateur ne sait pas où regarder.
- On n'arrive pas à l'essentiel → le parcours "voir formation → prix/durée → s'inscrire" est noyé.

Ce que les visiteurs viennent chercher (donné par le client) :
1. Voir les formations avec leur contenu
2. Voir le prix et la durée
3. S'inscrire et payer
4. Voir des preuves / résultats concrets

## 2. Benchmarks — ce qui marche ailleurs

### pawapay.io (fintech, hors secteur mais référence de sobriété)
- Un seul message central en H1, un seul visuel (capture produit), un seul CTA dominant ("Get started") répété identique partout (nav, hero, footer) — pas de CTA concurrents.
- Preuves chiffrées (10bn FCFA traités, NPS 91.3, 20 marchés) affichées **immédiatement après le hero**, pas en bas de page.
- Logos clients juste après les chiffres → la confiance est établie avant même de décrire le produit.
- Beaucoup de blanc entre les sections ; chaque section = une idée, 2-4 lignes de texte max.

### data-bird.co (école data, concurrent direct le plus proche)
- Cartes de formation **très courtes** : titre, une phrase de description, durée affichée en chiffre ("420h"), badge de niveau, un seul CTA flèche "Découvrir". Pas de liste de 5 "outcomes" + 6 "outils" + 3 "pills" empilés comme chez nous.
- Preuves chiffrées en gros caractères dès le haut de page (+4000 formés, NPS 9/10, 4,8/5 Google) + logos entreprises alumni + témoignages avec photo.
- CTA de conversion ("Prendre RDV", "Contacter un conseiller") répété à chaque rupture de section, toujours dans la même couleur contrastée.

### gomycode.com/sn/fr
- Non accessible en direct (403 sur la requête automatisée) — à consulter manuellement. Ce que je sais par ailleurs de ce type de site (école bootcamp africaine) : typographie très grande sur les titres, une formation = une carte = un CTA unique "Postuler", peu de texte de remplissage.

### Ce que les 3 ont en commun
- **Un seul CTA primaire** répété (pas 2-3 boutons différents en compétition).
- **Prix et durée visibles sans avoir à lire un paragraphe.**
- **Preuves chiffrées tout en haut**, pas après 5 autres sections.
- **Cartes de formation courtes** : titre, 1 phrase, durée, prix, CTA — le détail complet vit sur la page produit, pas sur la carte.

## 3. Constat concret sur le site actuel

### Densité d'information sur l'accueil
`src/pages/Index.tsx` empile **8 sections** avant le footer : Hero → Stats → BootcampsSection → OrientationTeaser → ReferencesSection → B2BSection → SessionsSection → Testimonials. Un visiteur qui veut juste "voir les formations et le prix" doit descendre au 3ᵉ bloc, et doit encore descendre pour les preuves (témoignages en position 8/8).

### Le Hero fait trop de choses à la fois
[HeroSection.tsx](src/components/home/HeroSection.tsx) contient, dans le seul premier écran : un badge, un H1 sur 3 lignes avec soulignement SVG animé, un sous-titre, **2 CTA de poids visuel quasi égal** ("Voir les bootcamps" / "Quel parcours me convient ?"), 3 badges de confiance, **et** une carte décorative avec un faux dashboard (mini-graphique à 12 barres + 3 stats + badge flottant). C'est beaucoup à traiter avant même de savoir ce qu'on vend.

### Les cartes de formation sont trop longues
[BootcampsSection.tsx](src/components/home/BootcampsSection.tsx) : chaque carte empile badge → icône+titre+sous-titre → paragraphe description → 3 pills (durée/niveau/effectif) → **5 lignes** "Ce que vous apprendrez" → **liste de 5-6 badges outils** → puis enfin, tout en bas, prix + CTA. Le prix (ce que le client dit vouloir voir en premier) est l'avant-dernier élément lu.

### Bug fonctionnel trouvé pendant l'audit
`BootcampsSection.tsx` contient encore un tableau **statique en dur** ("2 bootcamps", "Bootcamp Power BI & Excel", "Bootcamp Data Analyst") complètement déconnecté du nouveau catalogue à 4 bootcamps mis en place sur `feature/new-design`. Autrement dit l'accueil ment déjà sur le nombre de formations disponibles — à corriger dans tous les cas, indépendamment du redesign visuel.

### Texte petit — la densité de micro-texte est le vrai problème
Il n'y a pas de `font-size` racine réduit (`tailwind.config.ts` n'a pas d'échelle typographique custom, `index.css` ne touche pas la taille de base). Le problème n'est pas "la police est réglée petite" globalement : c'est que **beaucoup de texte porteur d'info utilise `text-xs`/`text-sm`** (12-14px) — rien que sur les composants de la page d'accueil : 32 usages de `text-xs` et 30 de `text-sm` sur ~1960 lignes, soit une micro-taille toutes les ~31 lignes. Badges, pills, labels, sous-titres de carte : tout est en petit corps, y compris des informations qu'on veut que l'utilisateur lise (durée, niveau, profils).

### Prix/durée noyés sur la page catalogue
Sur `/bootcamps` ([Bootcamps.tsx](src/pages/Bootcamps.tsx)), le prix vit dans la colonne sticky de droite — correct sur desktop — mais la structure de la page principale (colonne gauche) reste très chargée : outcomes, profils, outils avec barres de progression %, programme semaine par semaine en accordéon, certification, témoignage. Beaucoup de scroll avant "s'inscrire".

### Navigation
Le header a 2 méga-dropdowns (Bootcamps, Entreprises) + 4 liens plats + burger mobile — raisonnable en soi, mais chaque dropdown répète une bonne partie du contenu déjà présent sur l'accueil.

## 4. Direction proposée

### Principe directeur
**Une page = une idée à la fois, un CTA qui gagne toujours.** Réduire drastiquement le texte de remplissage, grossir ce qui doit être lu (prix, durée, titres), déplacer les preuves plus haut, écraser le nombre de sections/blocs par page.

### Échelle typographique proposée (à appliquer globalement, `tailwind.config.ts`)
| Usage | Actuel | Proposé |
|---|---|---|
| Corps de texte / labels d'info (durée, niveau, prix courant) | `text-xs`/`text-sm` (12-14px) | `text-base`/`text-lg` (16-18px) minimum pour tout ce qui porte une info utile |
| Paragraphe descriptif | `text-sm`/`text-base` | `text-base`/`text-lg`, line-height généreux |
| H1 hero | déjà correct (36-60px) | conservé, mais **un seul CTA dominant** en dessous |
| Micro-labels purement décoratifs (badge "New", eyebrow) | `text-xs` | conservé (l'usage est légitime ici) |

### Page d'accueil — nouvelle structure (cible : 4-5 blocs, pas 8)
1. **Hero simplifié** : H1 + 1 phrase + **1 seul CTA primaire** ("Voir les formations") + 1 lien texte secondaire discret ("Formation entreprise ? →"). Suppression du dashboard décoratif ou réduction à un seul chiffre clé.
2. **Preuves immédiates** : 3-4 chiffres clés + logos clients, remonté juste après le hero (aujourd'hui en position 5 et 7).
3. **Catalogue formations (carte courte)** : titre, 1 phrase, durée, prix, 1 CTA — sur le modèle data-bird. Le détail (outcomes, outils, programme) reste sur la page produit, pas sur la carte d'accueil.
4. **Témoignages / résultats concrets** (fusion avec les preuves si possible).
5. **CTA final unique** : s'inscrire / parler à un conseiller.

Sections à fusionner ou supprimer de l'accueil : `OrientationTeaser` (déplacer en lien discret plutôt qu'un bloc entier), `SessionsSection` (redondant avec le catalogue si le catalogue affiche déjà la prochaine session).

### Page `/bootcamps`
Garder la logique par onglet, mais réordonner la colonne principale : **prix/durée/CTA remontés en haut de la colonne gauche** (pas seulement dans la sticky card), programme en accordéon fermé par défaut (déjà le cas), réduire outils/profils à l'essentiel visuel (moins de barres de progression décoratives).

### Corriger en priorité (indépendant du redesign visuel)
Le bug `BootcampsSection.tsx` (données statiques obsolètes) doit être corrigé quel que soit le calendrier du redesign — il fait mentir la page d'accueil sur l'offre réelle.

## 5. Plan d'exécution proposé

1. **Validation de direction** (ce livrable) — prototype d'une page pour juger sur pièces avant de tout refaire.
2. **Design system** : nouvelle échelle typographique + espacements dans `tailwind.config.ts`/`index.css`, composants de base (carte formation courte, bloc preuve) réutilisables.
3. **Accueil** : nouvelle structure à 4-5 blocs.
4. **Catalogue `/bootcamps` et `/entreprises`** : application du même système de densité réduite.
5. **Pages secondaires** (`/a-propos`, `/alumni`, `/orientation`, `/contact`) : passage en cohérence typographique, sans refonte structurelle profonde (moins prioritaire selon les besoins exprimés).

## 6. Système de couleurs — validé via UI/UX Pro Max

Recherche menée avec l'outil `ui-ux-pro-max` (`--design-system "professional training consulting trust authority clean minimal service business"`) : le pattern recommandé de manière indépendante est **Trust & Authority** (navy + gold), typographie **Poppins/Open Sans** — ce qui converge avec :
- l'identité de marque d'origine communiquée en tout début de projet (Navy #1B3A5C, Orange #E8440A, Amber #FBBF24), jamais réellement implémentée (le site vivait sur un bleu/cyan différent) ;
- Poppins était déjà la police de titres en place (`font-heading`), donc aucun changement nécessaire là-dessus.

Décision : adoption du système Navy/Orange/Amber d'origine plutôt que du bleu/cyan précédent. Implémenté dans `src/index.css` (tokens `--primary`, `--accent`, nouveau token `--highlight` pour l'amber) + nettoyage de toutes les valeurs HSL codées en dur dans les dégradés de héros (`About.tsx`, `Alumni.tsx`, `Bootcamps.tsx`, `Entreprises.tsx`, `B2BSection.tsx`) qui référençaient encore l'ancienne teinte bleu/cyan. Corps de texte laissé en Inter (déjà proche d'Open Sans, changement non justifié).

Vérifié : `--primary: 211 55% 23%` (navy), `--accent: 16 92% 47%` (orange, rendu `rgb(230,68,10)` ≈ #E6440A) confirmés via les styles calculés du navigateur après build.

## 7. Statut d'implémentation

Direction validée par le client (avec demande d'ajout de photos réelles) puis généralisée. Le prototype `/redesign-preview` a été retiré une fois son contenu intégré dans les vraies pages.

Appliqué :
- **Navigation** : menu réduit à Accueil / Bootcamps / Entreprises / Alumni / Contact (À propos et Orientation restent accessibles via le footer / les liens contextuels, mais ne sont plus des onglets principaux).
- **Accueil** (`Index.tsx`) : 6 blocs au lieu de 8. Hero avec photo réelle (`bootcamp-3.jpg`) et un seul CTA dominant. `BootcampsSection` reconstruite pour être branchée sur l'API réelle (corrige le bug des "2 bootcamps" statiques) avec cartes courtes (titre, 1 phrase, durée, prix, CTA). Nouveau bloc `HumanProofSection` (photo + témoignage). `OrientationTeaser` et `SessionsSection` retirés (redondants).
- **`/bootcamps`** : barre prix/CTA ajoutée en haut de la colonne principale sur mobile (la sticky card couvrait déjà le desktop). Section "Outils maîtrisés" simplifiée (barres de % → badges).
- **`/entreprises`** : bande photo ajoutée, textes de contenu remontés de `text-sm` à `text-base`.
- **Alumni** : micro-ajustement de lisibilité sur les stats du hero.

Non traité dans cette passe (pertes de priorité assumées, cf. section 4) : refonte structurelle profonde de About/Alumni/Contact, échelle typographique globale dans `tailwind.config.ts` (les redesigns appliqués utilisent des tailles explicites par composant plutôt qu'un changement de token global, pour ne pas affecter l'admin).

**Photo hero actuelle** : placeholder (`bootcamp-3.jpg`, banque d'images existante du site). Une planche de composition a été produite séparément pour cadrer une vraie séance photo (cadrage 4:5, règle des tiers, lumière, palette de marque) — à remplacer dès que la photo définitive est disponible (un seul import à changer par composant : `HeroSection.tsx`, `HumanProofSection.tsx`, `Entreprises.tsx`).
