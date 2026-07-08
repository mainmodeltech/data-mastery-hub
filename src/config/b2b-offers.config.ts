/**
 * b2b-offers.config.ts
 * Contenu éditorial statique des 3 offres B2B (entreprises).
 * Structuré sur le même principe que bootcamps.config.ts : contenu
 * commercial figé ici, données pilotables (titre, CTA…) via le CRUD
 * `serviceService` / `/admin/services` quand applicable.
 *
 * Sources : fiches produit B2B-01, B2B-02, B2B-03.
 * Aucune statistique ni garantie n'est inventée — seul le contenu fourni
 * dans les fiches est repris ici.
 */

import { Database, BarChart3, FileSpreadsheet } from "lucide-react";
import type { ElementType } from "react";

export type ColorKey = "accent" | "primary";

export interface B2BOffer {
    id: string;
    ref: string;
    icon: ElementType;
    colorKey: ColorKey;
    title: string;
    tagline: string;
    objectif: string;
    publicCible: string;
    formatDuree: string;
    contenuType: string[];
    livrables: string[];
    differenciateurs: string[];
    positionnementPrix: string;
    ctaLabel: string;
}

export const B2B_OFFERS: B2BOffer[] = [
    {
        id: "data-sur-mesure",
        ref: "B2B-01",
        icon: Database,
        colorKey: "primary",
        title: "Formation sur mesure en Data",
        tagline: "Rendez votre équipe autonome sur toute la chaîne data",
        objectif:
            "Rendre une équipe métier autonome sur l'ensemble de la chaîne data (collecte, nettoyage, analyse, restitution) adaptée aux outils déjà utilisés par l'entreprise.",
        publicCible:
            "Directions data/BI, équipes contrôle de gestion, finance, marketing d'entreprises et institutions (10 à 30 personnes)",
        formatDuree:
            "Diagnostic gratuit (1h) puis mission de 3 à 10 jours, présentiel ou hybride, sur données réelles de l'entreprise",
        contenuType: [
            "Cadrage des besoins métier",
            "Structuration et qualité des données",
            "SQL / Python selon le niveau",
            "Restitution avec Power BI ou Excel avancé",
        ],
        livrables: [
            "Support pédagogique sur-mesure",
            "Jeux de données de l'entreprise traités",
            "Attestation de formation Model Technologie",
        ],
        differenciateurs: [
            "Diagnostic gratuit avant-vente",
            "Contenu construit sur les données réelles du client (à l'image du projet CORAF)",
            "Engagement sur livrable mesurable, pas seulement sur des heures",
        ],
        positionnementPrix:
            "Devis sur-mesure selon durée et nombre de participants — logique de mission, non de tarif horaire standard",
        ctaLabel: "Demander mon diagnostic gratuit",
    },
    {
        id: "power-bi-entreprise",
        ref: "B2B-02",
        icon: BarChart3,
        colorKey: "accent",
        title: "Formation sur mesure Power BI",
        tagline: "Du tableur au tableau de bord interactif, pour toute votre équipe",
        objectif:
            "Faire passer une équipe reporting du tableur au tableau de bord interactif : modélisation, DAX, publication et gouvernance Power BI.",
        publicCible:
            "Équipes reporting/BI, contrôle de gestion, direction générale, cabinets d'audit et institutions financières (type CORAF)",
        formatDuree:
            "Parcours modulaire de 2 à 4 semaines (Excel Opérationnel → Excel Avancé/Power BI), présentiel intra-entreprise",
        contenuType: [
            "Power Query & modélisation des données",
            "Langage DAX",
            "Construction de tableaux de bord",
            "Publication et partage sécurisé",
            "Préparation à la certification PL-300",
        ],
        livrables: [
            "Tableaux de bord Power BI opérationnels et documentés",
            "Guide de gouvernance des rapports",
            "Attestation, préparation PL-300",
        ],
        differenciateurs: [
            "Déjà éprouvé avec CORAF (proposition Excel Opérationnel + Excel Avancé/Power BI livrée)",
            "Reproductible en offre « clé en main » pour d'autres cabinets d'audit/institutions",
        ],
        positionnementPrix:
            "Programme à 2 niveaux (Excel Opérationnel / Excel Avancé-Power BI), devis par cohorte intra-entreprise",
        ctaLabel: "Demander un programme Power BI",
    },
    {
        id: "excel-entreprise",
        ref: "B2B-03",
        icon: FileSpreadsheet,
        colorKey: "primary",
        title: "Mise à niveau Excel",
        tagline: "Débutant, Intermédiaire, Avancé — un socle Excel commun pour toute l'entreprise",
        objectif:
            "Homogénéiser le niveau Excel de l'ensemble des collaborateurs et créer un point d'entrée volume vers les offres Power BI.",
        publicCible:
            "Collaborateurs tous services (comptabilité, RH, commercial, opérations) — grands groupes et PME",
        formatDuree:
            "3 paliers indépendants ou en parcours continu (Débutant 2j / Intermédiaire 2j / Avancé 3j), intra-entreprise",
        contenuType: [
            "Débutant : interface, formules de base, mise en forme",
            "Intermédiaire : tableaux croisés dynamiques, fonctions de recherche",
            "Avancé : modélisation financière, Power Query, automatisation, préparation Power BI",
        ],
        livrables: [
            "Classeur de référence de l'entreprise",
            "Fiches mémo par niveau",
            "Attestation par palier",
        ],
        differenciateurs: [
            "Produit volume à marge maîtrisée",
            "Porte d'entrée compte-client avant l'up-sell vers Power BI ou la Formation sur mesure en Data",
        ],
        positionnementPrix:
            "Tarif dégressif par volume de collaborateurs, forfait par palier",
        ctaLabel: "Demander un devis par palier",
    },
];

export function getB2BOffer(id: string): B2BOffer | undefined {
    return B2B_OFFERS.find((o) => o.id === id);
}
