/**
 * bootcamps.config.ts
 * Données statiques enrichissant les bootcamps retournés par l'API.
 * Extraites du composant page pour alléger celui-ci et faciliter la maintenance.
 */

import { BarChart3, Database, BookOpen } from "lucide-react";
import type { ElementType } from "react";

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
        tagline: "Maîtrisez la Business Intelligence en 8 semaines",
        colorKey: "accent",
        icon: BarChart3,
        profiles: [
            { icon: "💼", label: "Contrôleurs de gestion" },
            { icon: "📊", label: "Responsables financiers" },
            { icon: "👥", label: "Managers & chefs de projet" },
            { icon: "📈", label: "Commerciaux & marketing" },
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
                project: "Dashboard commercial interactif",
            },
            {
                week: "Semaines 5-6",
                title: "Déploiement & Certification",
                hours: "18h",
                topics: [
                    "Power BI Service : partage et collaboration",
                    "Sécurité au niveau des lignes (RLS)",
                    "Préparation certification Microsoft PL-300",
                    "Projet final de certification",
                ],
                project: "🏆 Projet final · Présentation devant jury",
            },
        ],
        outcomes: [
            { stat: "94%", label: "taux de satisfaction alumni" },
            { stat: "8 sem.", label: "pour devenir opérationnel" },
            { stat: "100%", label: "pratique sur cas réels " },
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
