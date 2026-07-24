/**
 * bootcamps.config.ts
 * Données statiques enrichissant les bootcamps retournés par l'API.
 * Extraites du composant page pour alléger celui-ci et faciliter la maintenance.
 *
 * Catalogue DataMasteryHub (B2C) — 4 bootcamps :
 *   bi             → Bootcamp Power BI
 *   python         → Bootcamp Python pour la data
 *   sql            → Bootcamp SQL pour la data
 *   excel-finance  → Bootcamp Excel pour Financiers & Contrôleurs de gestion
 *
 * La clé `data` est conservée pour compatibilité avec d'éventuels bootcamps
 * encore tagués ainsi côté backend (ancien catalogue Python+SQL fusionné) :
 * à faire migrer vers `python` / `sql` via l'admin (/admin/bootcamps).
 */

import { BarChart3, Code2, Table2, Calculator, Database, BookOpen } from "lucide-react";
import type { ElementType } from "react";
import type { Bootcamp } from "@/types/bootcamp.type";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ColorKey = "accent" | "primary";

export interface ToolEntry {
    name: string;
    level: number; // 0–100
}

export interface CurriculumWeek {
    week: string;
    title: string;
    hours: string;
    topics: string[];
    project: string;
}

export interface ProfileEntry {
    icon: string;
    label: string;
}

export interface OutcomeEntry {
    stat: string;
    label: string;
}

export interface TestimonialEntry {
    name: string;
    role: string;
    company: string;
    content: string;
    initials: string;
}

export interface CertificationEntry {
    name: string;
    logo: string;
    description: string;
}

export interface StaticEnrichment {
    tagline: string;
    colorKey: ColorKey;
    icon: ElementType;
    profiles: ProfileEntry[];
    tools: ToolEntry[];
    curriculum: CurriculumWeek[];
    outcomes: OutcomeEntry[];
    testimonial: TestimonialEntry;
    certification: CertificationEntry;
}

// ─── Données par catégorie ────────────────────────────────────────────────────

export const STATIC_BY_CATEGORY: Record<string, StaticEnrichment> = {
    bi: {
        tagline: "Du tableur au tableau de bord — préparez la certification PL-300",
        colorKey: "accent",
        icon: BarChart3,
        profiles: [
            { icon: "💼", label: "Contrôleurs de gestion" },
            { icon: "📊", label: "Responsables financiers" },
            { icon: "👥", label: "Managers & chefs de projet" },
            { icon: "📈", label: "Indépendants & commerciaux" },
        ],
        tools: [
            { name: "Power BI", level: 80 },
            { name: "Excel Avancé", level: 80 },
            { name: "DAX", level: 85 },
            { name: "Power Query", level: 80 },
            { name: "Power BI Service", level: 70 },
            { name: "Power Pivot", level: 60 },
        ],
        curriculum: [
            {
                week: "Semaines 1-2",
                title: "Fondamentaux & Excel Avancé",
                hours: "18h",
                topics: [
                    "Excel : tableaux croisés dynamiques avancés",
                    "Formules complexes : INDEX, MATCH, SUMIFS",
                    "Power Query : import et transformation de données",
                    "Premiers pas avec Power BI Desktop",
                ],
                project: "Tableau de bord financier Excel",
            },
            {
                week: "Semaines 3-4",
                title: "Modélisation des données",
                hours: "18h",
                topics: [
                    "Modèle en étoile et relations entre tables",
                    "Introduction au langage DAX",
                    "Mesures calculées et colonnes personnalisées",
                    "Gestion des dates et calendrier",
                ],
                project: "Modèle de données multi-sources",
            },
            {
                week: "Semaines 4-5",
                title: "Visualisation & Storytelling",
                hours: "18h",
                topics: [
                    "Choix du bon visuel selon le message",
                    "Interactivité : filtres, slicers, drill-through",
                    "Design de dashboards professionnels",
                    "DAX avancé : fonctions Time Intelligence",
                ],
                project: "Dashboard commercial interactif — cas d'entreprise sénégalaise (FCFA, fournisseurs locaux)",
            },
            {
                week: "Semaines 5-6",
                title: "Déploiement & Certification",
                hours: "18h",
                topics: [
                    "Power BI Service : partage et collaboration",
                    "Sécurité au niveau des lignes (RLS)",
                    "Préparation certification Microsoft PL-300",
                    "Simulation d'examen PL-300",
                ],
                project: "🏆 Projet final · Présentation devant jury",
            },
        ],
        outcomes: [
            { stat: "94%", label: "taux de satisfaction alumni" },
            { stat: "100%", label: "pratique sur cas réels" },
        ],
        testimonial: {
            name: "Emmanuel BOUADI",
            role: "Data analyst",
            company: "WAVE",
            initials: "EB",
            content:
                "Durant mon stage à la Banque Centrale, les compétences acquises en Excel, Power Query et Power BI m'ont permis de concevoir un tableau de bord automatisé pour le suivi des recommandations.",
        },
        certification: {
            name: "Microsoft Power BI Data Analyst (PL-300)",
            logo: "🏅",
            description:
                "Certification reconnue mondialement, préparée tout au long du programme",
        },
    },

    python: {
        tagline: "La programmation appliquée à la data, pour sortir du low-code",
        colorKey: "primary",
        icon: Code2,
        profiles: [
            { icon: "🔄", label: "Reconversion technique" },
            { icon: "🎓", label: "Étudiants en fin de cursus" },
            { icon: "📈", label: "Futurs Data Analyst / Data Scientist" },
        ],
        tools: [
            { name: "Python", level: 85 },
            { name: "Pandas", level: 85 },
            { name: "Numpy", level: 75 },
            { name: "Matplotlib / Seaborn", level: 75 },
            { name: "Jupyter Notebook", level: 80 },
            { name: "Introduction Machine Learning", level: 60 },
        ],
        curriculum: [
            {
                week: "Bloc 1",
                title: "Bases du langage Python",
                hours: "—",
                topics: [
                    "Variables, structures de données, fonctions",
                    "Boucles et logique conditionnelle",
                    "Manipulation de fichiers",
                    "Prise en main de Jupyter Notebook",
                ],
                project: "Premiers scripts d'automatisation",
            },
            {
                week: "Bloc 2",
                title: "Manipulation de données avec Pandas & Numpy",
                hours: "—",
                topics: [
                    "Import, nettoyage et transformation de données",
                    "Jointures et agrégations avec Pandas",
                    "Calculs numériques avec Numpy",
                    "Cas d'usage sur données sénégalaises",
                ],
                project: "Nettoyage et analyse d'un dataset réel",
            },
            {
                week: "Bloc 3",
                title: "Visualisation de données",
                hours: "—",
                topics: [
                    "Matplotlib : graphiques et personnalisation",
                    "Seaborn : visualisations statistiques",
                    "Storytelling avec les données",
                    "Notebooks commentés en français",
                ],
                project: "Rapport d'analyse visuel commenté",
            },
            {
                week: "Bloc 4",
                title: "Introduction au Machine Learning & Portfolio",
                hours: "—",
                topics: [
                    "Notions de base du Machine Learning",
                    "Premiers modèles de prédiction simples",
                    "Constitution du portfolio de projets",
                    "Préparation aux entretiens techniques",
                ],
                project: "🏆 Projet final · Notebook commenté présenté devant jury",
            },
        ],
        outcomes: [],
        testimonial: { name: "", role: "", company: "", content: "", initials: "" },
        certification: {
            name: "Attestation DataMasteryHub",
            logo: "🎓",
            description: "Délivrée à l'issue du bootcamp, accompagnée du portfolio de projets",
        },
    },

    sql: {
        tagline: "La brique fondamentale pour interroger n'importe quelle base de données",
        colorKey: "accent",
        icon: Table2,
        profiles: [
            { icon: "🌱", label: "Débutants en data" },
            { icon: "📊", label: "Professionnels Excel en évolution" },
            { icon: "🧩", label: "Complément aux bootcamps Power BI / Python" },
        ],
        tools: [
            { name: "SQL (MySQL)", level: 85 },
            { name: "Modèle relationnel", level: 80 },
            { name: "Jointures & sous-requêtes", level: 80 },
            { name: "Agrégations", level: 80 },
            { name: "Bonnes pratiques de performance", level: 65 },
        ],
        curriculum: [
            {
                week: "Bloc 1",
                title: "Modèle relationnel",
                hours: "—",
                topics: [
                    "Comprendre une base de données relationnelle",
                    "Tables, clés primaires et étrangères",
                    "Lecture d'un schéma de base de données",
                    "Prise en main de MySQL",
                ],
                project: "Exploration d'une base de données d'entreprise",
            },
            {
                week: "Bloc 2",
                title: "Requêtes et jointures",
                hours: "—",
                topics: [
                    "SELECT, WHERE, ORDER BY",
                    "Jointures : INNER, LEFT, RIGHT JOIN",
                    "Filtres et conditions combinées",
                    "Cas d'usage sur un schéma d'entreprise sénégalaise",
                ],
                project: "Requêtes croisées multi-tables",
            },
            {
                week: "Bloc 3",
                title: "Agrégations et sous-requêtes",
                hours: "—",
                topics: [
                    "GROUP BY et fonctions d'agrégation",
                    "Sous-requêtes imbriquées",
                    "Vues et requêtes réutilisables",
                    "Bonnes pratiques de performance",
                ],
                project: "Rapport d'analyse construit en SQL",
            },
            {
                week: "Bloc 4",
                title: "Projet final",
                hours: "—",
                topics: [
                    "Construction d'une base de données d'entraînement",
                    "Consolidation des acquis sur cas réel",
                    "Documentation des requêtes",
                    "Préparation à la suite du parcours (Power BI ou Python)",
                ],
                project: "🏆 Base de données d'entraînement réutilisable",
            },
        ],
        outcomes: [],
        testimonial: { name: "", role: "", company: "", content: "", initials: "" },
        certification: {
            name: "Attestation DataMasteryHub",
            logo: "🎓",
            description: "Délivrée à l'issue du bootcamp, avec la base de données d'entraînement réutilisable",
        },
    },

    "excel-finance": {
        tagline: "Excel spécialisé finance & contrôle de gestion — passerelle vers Power BI",
        colorKey: "primary",
        icon: Calculator,
        profiles: [
            { icon: "🧮", label: "Comptables & contrôleurs de gestion" },
            { icon: "🔍", label: "Auditeurs" },
            { icon: "🏦", label: "Profils banque, fintech, UEMOA" },
        ],
        tools: [
            { name: "Excel avancé", level: 85 },
            { name: "Modélisation financière", level: 80 },
            { name: "Tableaux de bord EBITDA", level: 75 },
            { name: "Consolidation multi-sources", level: 75 },
            { name: "Fonctions financières avancées", level: 80 },
        ],
        curriculum: [
            {
                week: "Bloc 1",
                title: "Modélisation financière sous Excel",
                hours: "—",
                topics: [
                    "Structuration d'un modèle financier",
                    "Fonctions financières avancées",
                    "Bonnes pratiques de construction de classeurs",
                    "Cas pratiques budget/reporting",
                ],
                project: "Modèle de budget réutilisable",
            },
            {
                week: "Bloc 2",
                title: "Pilotage & EBITDA",
                hours: "—",
                topics: [
                    "Construction de tableaux de bord de pilotage",
                    "Calcul et suivi de l'EBITDA",
                    "Indicateurs de performance financière",
                    "Mise en forme professionnelle des rapports",
                ],
                project: "Tableau de bord de pilotage EBITDA",
            },
            {
                week: "Bloc 3",
                title: "Consolidation multi-sources",
                hours: "—",
                topics: [
                    "Power Query pour la consolidation de données",
                    "Fusion de sources comptables multiples",
                    "Automatisation des reportings récurrents",
                    "Contrôles de cohérence des données",
                ],
                project: "Reporting consolidé automatisé",
            },
            {
                week: "Bloc 4",
                title: "Passerelle vers Power BI",
                hours: "—",
                topics: [
                    "De la modélisation Excel au dashboard Power BI",
                    "Connexion des classeurs Excel à Power BI",
                    "Panorama des suites : quand passer à Power BI",
                    "Plan de montée en compétence individuel",
                ],
                project: "🏆 Restitution des modèles Excel réutilisables",
            },
        ],
        outcomes: [],
        testimonial: { name: "", role: "", company: "", content: "", initials: "" },
        certification: {
            name: "Attestation DataMasteryHub",
            logo: "🎓",
            description: "Délivrée à l'issue du bootcamp, avec les modèles Excel réutilisables (budget, reporting, EBITDA)",
        },
    },

    /** @deprecated Ancien catalogue Python+SQL fusionné — à migrer vers `python`/`sql` via l'admin */
    data: {
        tagline: "De zéro à Data Analyst opérationnel en 10 semaines",
        colorKey: "primary",
        icon: Database,
        profiles: [
            { icon: "🔄", label: "En reconversion professionnelle" },
            { icon: "🎓", label: "Jeunes diplômés (toute filière)" },
            { icon: "⚙️", label: "Développeurs souhaitant se spécialiser" },
            { icon: "💼", label: "Professionnels voulant évoluer" },
        ],
        tools: [
            { name: "Python", level: 80 },
            { name: "SQL", level: 80 },
            { name: "Pandas", level: 85 },
            { name: "Streamlit", level: 70 },
            { name: "Matplotlib", level: 75 },
            { name: "PostgreSQL", level: 70 },
        ],
        curriculum: [
            {
                week: "Semaines 1-3",
                title: "Python pour la Data",
                hours: "36h",
                topics: [
                    "Python : variables, fonctions, structures de données",
                    "Pandas : import, nettoyage et transformation",
                    "Numpy : calculs numériques et statistiques",
                    "Visualisation avec Matplotlib & Seaborn",
                ],
                project: "Analyse exploratoire d'un dataset réel",
            },
            {
                week: "Semaines 4-6",
                title: "Fondamentaux de la Data",
                hours: "36h",
                topics: [
                    "Introduction à la data : types, sources, usages",
                    "SQL de base : SELECT, WHERE, JOIN, GROUP BY",
                    "SQL avancé : sous-requêtes, window functions",
                    "Bases de données relationnelles et PostgreSQL",
                ],
                project: "Analyse de données e-commerce en SQL",
            },
            {
                week: "Semaines 6-7",
                title: "Analyse Avancée & Visualisation",
                hours: "36h",
                topics: [
                    "Statistiques descriptives et inférentielles",
                    "Corrélation, régression, segmentation",
                    "Power BI : dashboards et storytelling data",
                    "Automatisation des pipelines de données",
                ],
                project: "Dashboard Power BI connecté à Python",
            },
            {
                week: "Semaines 8-10",
                title: "Projets Réels & Emploi",
                hours: "36h",
                topics: [
                    "Méthodologie projet data end-to-end",
                    "Git et bonnes pratiques professionnelles",
                    "Construction du portfolio GitHub",
                    "Préparation aux entretiens data analyst",
                ],
                project: "🏆 Projet final certifiant · Présentation devant jury",
            },
        ],
        outcomes: [
            { stat: "3+", label: "projets dans le portfolio" },
            { stat: "10 sem.", label: "du zéro à l'opérationnel" },
            { stat: "90%", label: "trouvent un poste en 3 mois" },
        ],
        testimonial: {
            name: "Joseph Yacine DIASSO",
            role: "Analyste",
            company: "SONATEL",
            initials: "JYD",
            content:
                "Cette certification a joué un rôle déterminant dans mon insertion professionnelle. Grâce aux compétences acquises en analyse, traitement et visualisation des données, j'ai pu décrocher mon emploi actuel.",
        },
        certification: {
            name: "Certificat DataCamp (En cours)",
            logo: "🎓",
            description: "Certificat reconnu par les entreprises dans le monde",
        },
    },
};

/** Enrichissement générique si la catégorie n'est pas référencée */
export const STATIC_FALLBACK: StaticEnrichment = {
    tagline: "Maîtrisez la data analysis",
    colorKey: "primary",
    icon: BookOpen,
    profiles: [],
    tools: [],
    curriculum: [],
    outcomes: [],
    testimonial: { name: "", role: "", company: "", content: "", initials: "" },
    certification: { name: "", logo: "🎓", description: "" },
};

/** Retourne les données statiques enrichissant un bootcamp selon sa catégorie */
export function getBootcampStatic(category: string): StaticEnrichment {
    return STATIC_BY_CATEGORY[category] ?? STATIC_FALLBACK;
}

/**
 * Résout le contenu d'affichage d'une formation : priorité aux champs portés
 * par la formation elle-même (une fois le backend étendu — voir
 * docs/redesign-diagnostic.md §8), avec repli sur l'ancien mapping par
 * catégorie pour les formations qui n'ont pas encore ces champs renseignés.
 * C'est le point d'entrée à utiliser dans les pages plutôt que
 * `getBootcampStatic(bootcamp.category)` directement.
 */
export function resolveBootcampContent(bootcamp: Bootcamp): StaticEnrichment {
    const fallback = getBootcampStatic(bootcamp.category);
    return {
        tagline: bootcamp.tagline ?? fallback.tagline,
        colorKey: bootcamp.colorKey ?? fallback.colorKey,
        icon: fallback.icon,
        profiles: bootcamp.profiles?.length ? bootcamp.profiles : fallback.profiles,
        tools: bootcamp.tools?.length ? bootcamp.tools : fallback.tools,
        curriculum: bootcamp.curriculum?.length ? bootcamp.curriculum : fallback.curriculum,
        outcomes: bootcamp.outcomes?.length ? bootcamp.outcomes : fallback.outcomes,
        testimonial: bootcamp.testimonial ?? fallback.testimonial,
        certification: bootcamp.certification ?? fallback.certification,
    };
}
