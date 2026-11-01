# Simulateur PL-300 — kit de production du contenu (lot S0)

Document de travail pour **Cedric** (responsable contenu) et le PO. Il fixe les règles d'écriture, le gabarit d'une question, la matrice de couverture à remplir et un échantillon de questions à valider. Référence : [proposition validée](simulateur-pl-300.md).

## 1. Règles non négociables

1. **Questions 100 % originales.** On part du **guide d'étude public** de Microsoft (compétences mesurées au 20 avril 2026), jamais d'une question vue à l'examen, ni d'un site de « dumps », ni d'un produit concurrent (MeasureUp, Whizlabs, ExamTopics…).
2. **Langue** : énoncé et choix **en anglais** (comme l'examen) ; **explication en français**.
3. **Chaque DAX / M / réglage cité est exécuté** dans Power BI Desktop (ou le service) avant publication. Une question non vérifiée ne passe pas en relecture.
4. **Deux personnes minimum** : un auteur et un relecteur différent. Personne ne valide sa propre question.
5. **Une seule bonne réponse défendable.** Les mauvais choix sont plausibles et correspondent à de vraies erreurs de praticien (pas de choix absurdes).
6. **Pas de piège de vocabulaire** ni de question dépendant d'une préversion instable.
7. **Traçabilité** : chaque question porte la compétence du guide qu'elle mesure et la date de version du guide.

## 2. Gabarit d'une question (à copier)

| Champ | Contenu |
|---|---|
| Identifiant | `PL300-<domaine>-<n°>` (ex. `PL300-MOD-014`) |
| Domaine / sous-compétence | Voir la matrice §3 |
| Type | Choix unique · Choix multiples (préciser « Choose two ») · Série Oui/Non · Ordonnancement · Complétion de code · Étude de cas |
| Difficulté | 1 facile · 2 moyen · 3 difficile |
| Énoncé (EN) | Contexte court, puis la question. Une exigence par question |
| Choix (EN) | 4 choix (A à D) ; la bonne réponse marquée |
| Explication (FR) | Pourquoi la bonne réponse est bonne ; pourquoi chaque autre choix est faux ; lien vers la documentation Microsoft |
| Vérification technique | Qui l'a exécutée, dans quel outil, date |
| Auteur / Relecteur | Deux noms différents |
| Version du guide | `2026-04-20` |
| Statut | Brouillon · En relecture · Approuvée · Publiée · Retirée |

## 3. Matrice de couverture (cible du MVP : 400 questions)

Pondérations du guide : Préparer 25–30 % · Modéliser 25–30 % · Visualiser 25–30 % · Gérer et sécuriser 15–20 %.

| Domaine | Sous-compétence (guide du 20/04/2026) | Cible MVP | Pilote (S0) | Rédigées | Vérifiées | Relues |
|---|---|---:|---:|---:|---:|---:|
| **Préparer les données** (120) | Se connecter aux données ; Import / DirectQuery / DirectLake ; paramètres | 30 | 3 | | | |
| | Profiler et nettoyer (qualité, valeurs nulles, erreurs d'import) | 30 | 3 | | | |
| | Transformer et charger (types, pivot/dépivot, fusion/ajout, clés, tables de faits et de dimensions) | 60 | 5 | | | |
| **Modéliser les données** (112) | Concevoir le modèle (propriétés, cardinalité, filtre croisé, dimensions à rôles multiples, table de dates) | 36 | 3 | | | |
| | Calculs DAX (agrégations, CALCULATE, intelligence temporelle, semi-additifs, groupes de calculs, mesures rapides) | 56 | 5 | | | |
| | Optimiser les performances (Performance Analyzer, vue de requête DAX, granularité) | 20 | 3 | | | |
| **Visualiser et analyser** (112) | Créer des rapports (visuels, thèmes, mise en forme conditionnelle, segments, rapports paginés, calculs visuels, Copilot) | 44 | 4 | | | |
| | Améliorer la lisibilité (signets, infobulles, interactions, navigation, drillthrough, mobile, accessibilité, actualisation automatique) | 36 | 4 | | | |
| | Repérer tendances et schémas (Analyser, regroupement/binning, visuels IA, lignes de référence, valeurs atypiques) | 32 | 3 | | | |
| **Gérer et sécuriser Power BI** (56) | Espaces de travail et éléments (applications, distribution, abonnements, alertes, passerelle, actualisation planifiée, certification de contenu) | 28 | 4 | | | |
| | Sécurité et gouvernance (rôles d'espace, accès aux éléments et modèles, RLS, étiquettes de sensibilité) | 28 | 3 | | | |
| **Total** | | **400** | **40** | | | |

Répartition par type visée : ≈ 60 % choix unique, 15 % choix multiples, 10 % Oui/Non, 8 % ordonnancement ou complétion de code, 7 % études de cas (6 à 8 cas de 4 à 5 questions).

## 4. Liste de contrôle de relecture

- [ ] L'énoncé ne contient qu'une exigence et aucune information inutile.
- [ ] Une seule réponse est correcte, et je peux le **démontrer** (capture ou DAX exécuté).
- [ ] Les trois autres choix sont faux **pour une raison précise** décrite dans l'explication.
- [ ] La terminologie est celle de l'interface en vigueur (noms de menus, de fonctions).
- [ ] La question mesure bien la sous-compétence indiquée.
- [ ] Aucun élément ne ressemble à une question connue d'un site tiers (recherche rapide).
- [ ] L'explication est claire pour un francophone et cite la documentation.
- [ ] Orthographe et niveau de difficulté cohérents.

## 5. Échantillon de brouillons à valider (non publiés)

> Ces cinq brouillons illustrent le format. **Aucune n'est validée** : chacune doit être exécutée dans Power BI et relue avant d'entrer dans la banque.

### PL300-MOD-001 — Modéliser / DAX — choix unique — difficulté 2

**Question.** You have a measure named `[Total Sales]`. You need a measure that always returns the total sales of the product category *Bikes*, even when a report visual or slicer filters `Product[Category]` to a different value. Which DAX expression should you use?

- A. `CALCULATE ( [Total Sales], Product[Category] = "Bikes" )` ✔
- B. `CALCULATE ( [Total Sales], KEEPFILTERS ( Product[Category] = "Bikes" ) )`
- C. `SUMX ( Product, [Total Sales] )`
- D. `[Total Sales] + ( Product[Category] = "Bikes" )`

**Explication (FR).** Un filtre booléen passé à `CALCULATE` **remplace** le filtre existant sur la même colonne : la mesure renvoie donc toujours les ventes de « Bikes ». `KEEPFILTERS` (B) fait l'inverse : il **conserve** le filtre du rapport et ne garde que l'intersection. `SUMX` (C) additionne la mesure ligne à ligne sans imposer de catégorie. L'expression D n'est pas une expression de mesure valide.

### PL300-PRE-001 — Préparer / Transformer — choix unique — difficulté 1

**Question.** A table has one column per month (`Jan`, `Feb`, … `Dec`) containing sales values. You need a table with one row per customer and month, with the month name in one column and the value in another. Which Power Query transformation should you apply to the month columns?

- A. Pivot columns
- B. Unpivot columns ✔
- C. Transpose
- D. Group by

**Explication (FR).** **Dépivoter** transforme des colonnes en lignes (attribut + valeur), c'est ce qu'il faut pour obtenir une ligne par client et par mois. *Pivoter* (A) fait l'inverse. *Transposer* (C) inverse lignes et colonnes de toute la table sans créer de paire attribut/valeur. *Regrouper* (D) agrège sans changer la forme.

### PL300-SEC-001 — Gérer et sécuriser / RLS — choix unique — difficulté 2

**Question.** You define a row-level security role in Power BI Desktop and publish the semantic model to the Power BI service. You need users in a Microsoft Entra security group to be restricted by the role. What should you do?

- A. Add the group to the role in the semantic model's **Security** settings in the Power BI service ✔
- B. Share the report with the group by using a direct link
- C. Assign the group the Viewer role in the workspace
- D. Create a new role in the Power BI service with the same name

**Explication (FR).** Après publication, les membres sont affectés aux rôles dans les paramètres de **sécurité du modèle sémantique** du service. Partager le rapport (B) ou donner le rôle d'espace Lecteur (C) ne rattache personne à un rôle RLS. Les rôles se créent dans le modèle, pas dans le service (D). *À vérifier : comportement des rôles d'espace (les membres avec un rôle d'écriture contournent la RLS).*

### PL300-VIS-001 — Visualiser / Créer des rapports — choix unique — difficulté 1

**Question.** You need to show how the monthly revenue of a single measure changes over the last 24 months. Which visual should you use?

- A. Line chart ✔
- B. Pie chart
- C. Treemap
- D. Funnel chart

**Explication (FR).** Un **graphique en courbes** est fait pour une tendance dans le temps. Le secteur (B) et l'arborescence (C) montrent des parts d'un tout ; l'entonnoir (D) montre des étapes successives d'un processus.

### PL300-MOD-002 — Modéliser / Conception — choix multiples (« Choose two ») — difficulté 2

**Question.** You have a `Sales` table and a `Date` table related on `Date[Date]` and `Sales[OrderDate]`. You need to use time-intelligence functions such as `TOTALYTD`. Which two actions should you perform? Each correct answer presents part of the solution.

- A. Mark the `Date` table as a date table ✔
- B. Ensure the `Date` column contains **unique** dates with no gaps ✔
- C. Set the relationship cross-filter direction to *Both*
- D. Convert `Date[Date]` to text

**Explication (FR).** Les fonctions d'intelligence temporelle exigent une table de dates **marquée comme telle**, avec une colonne de dates **unique et continue**. Le filtre croisé bidirectionnel (C) n'est pas nécessaire et peut dégrader les performances ; convertir en texte (D) casse la logique de dates.

## 6. Prochaines étapes (S0)

1. Cedric désigne un relecteur et valide ce kit.
2. Rédiger les **40 questions pilotes** (colonne « Pilote » du tableau) et les faire exécuter/relire.
3. Publier l'**examen d'essai gratuit (10 questions)** quand le moteur sera prêt (lot S2) ; d'ici là, la page d'offre collecte la liste d'attente.
4. Mesurer les inscriptions à la liste d'attente (page `/simulateur-pl-300`, visible dans *Messages → Simulateur*) pour décider de la suite.
