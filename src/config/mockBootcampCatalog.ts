/**
 * mockBootcampCatalog.ts
 *
 * Catalogue de démonstration simulant ce que le backend devrait renvoyer une
 * fois les champs de contenu configurable ajoutés (voir docs/redesign-diagnostic.md §8
 * et les nouveaux champs sur `Bootcamp` dans src/types/bootcamp.type.ts).
 *
 * Utilisé comme fallback quand l'API est indisponible ou ne renvoie pas
 * encore ces champs — permet de développer/démontrer le rendu dynamique
 * (fiche formation + sélecteur de session) sans dépendre du backend.
 *
 * Chaque bootcamp porte SON PROPRE contenu (tagline, profils, outils,
 * programme, résultats, certification) et SES PROPRES sessions (cohortes) —
 * rien n'est déduit d'une catégorie. Ajouter une 5e ou 10e formation ne
 * demande aucune modification de code, juste une entrée de plus ici (ou,
 * une fois le backend étendu, un enregistrement de plus en base).
 */

import type { Bootcamp, BootcampSession } from "@/types/bootcamp.type";

function session(partial: Partial<BootcampSession> & { id: string; bootcampId: string }): BootcampSession {
    return {
        sessionName: null,
        cohortNumber: null,
        year: null,
        startDate: null,
        endDate: null,
        registrationDeadline: null,
        maxParticipants: 20,
        currentParticipants: 0,
        isFull: false,
        schedule: "Soirs & week-ends",
        status: "OPEN",
        format: "HYBRID",
        location: "Dakar",
        price: null,
        earlyBirdPrice: null,
        earlyBirdDeadline: null,
        isFeatured: false,
        published: true,
        spotsRemaining: null,
        ...partial,
    };
}

export const MOCK_BOOTCAMP_CATALOG: Bootcamp[] = [
    {
        id: "mock-bi",
        title: "Bootcamp Power BI",
        description: "Maîtrisez Power BI du débutant à l'expert et préparez la certification Microsoft PL-300.",
        duration: "8 semaines",
        audience: "Contrôleurs de gestion, responsables financiers, managers",
        prerequisites: "Aucun prérequis technique",
        price: "150 000 FCFA",
        benefits: [
            "Créer des dashboards interactifs",
            "Modéliser vos données",
            "Automatiser les rapports mensuels",
            "Maîtriser le langage DAX",
            "Préparer la certification PL-300",
        ],
        category: "bi",
        tag: "Best Seller",
        iconName: "BarChart3",
        featured: true,
        published: true,
        displayOrder: 0,
        createdAt: "", updatedAt: "",
        tagline: "Du tableur au tableau de bord — préparez la certification PL-300",
        colorKey: "accent",
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
        ],
        curriculum: [
            { week: "Semaines 1-2", title: "Fondamentaux & Excel Avancé", hours: "18h", topics: ["Tableaux croisés dynamiques avancés", "Power Query : import et transformation", "Premiers pas avec Power BI Desktop"], project: "Tableau de bord financier Excel" },
            { week: "Semaines 3-4", title: "Modélisation des données", hours: "18h", topics: ["Modèle en étoile", "Introduction au langage DAX", "Mesures calculées"], project: "Modèle de données multi-sources" },
            { week: "Semaines 5-6", title: "Déploiement & Certification", hours: "18h", topics: ["Power BI Service", "Sécurité RLS", "Simulation d'examen PL-300"], project: "🏆 Projet final · Présentation devant jury" },
        ],
        outcomes: [
            { stat: "94%", label: "taux de satisfaction alumni" },
            { stat: "100%", label: "pratique sur cas réels" },
        ],
        testimonial: {
            name: "Emmanuel BOUADI", role: "Data analyst", company: "WAVE", initials: "EB",
            content: "Durant mon stage à la Banque Centrale, les compétences acquises en Excel, Power Query et Power BI m'ont permis de concevoir un tableau de bord automatisé.",
        },
        certification: { name: "Microsoft Power BI Data Analyst (PL-300)", logo: "🏅", description: "Certification reconnue mondialement, préparée tout au long du programme" },
        nextSession: session({ id: "mock-bi-s2", bootcampId: "mock-bi", sessionName: "Cohorte Mars 2026", cohortNumber: 5, year: 2026, startDate: "2026-03-09", endDate: "2026-05-01", currentParticipants: 12, maxParticipants: 20, spotsRemaining: 8, price: "150 000 FCFA", status: "OPEN", format: "HYBRID" }),
        sessions: [
            session({ id: "mock-bi-s1", bootcampId: "mock-bi", sessionName: "Cohorte Janvier 2026", cohortNumber: 4, year: 2026, startDate: "2026-01-12", endDate: "2026-03-06", currentParticipants: 20, maxParticipants: 20, spotsRemaining: 0, isFull: true, price: "150 000 FCFA", status: "CLOSED", format: "HYBRID" }),
            session({ id: "mock-bi-s2", bootcampId: "mock-bi", sessionName: "Cohorte Mars 2026", cohortNumber: 5, year: 2026, startDate: "2026-03-09", endDate: "2026-05-01", currentParticipants: 12, maxParticipants: 20, spotsRemaining: 8, price: "150 000 FCFA", status: "OPEN", format: "HYBRID" }),
            session({ id: "mock-bi-s3", bootcampId: "mock-bi", sessionName: "Cohorte Mai 2026", cohortNumber: 6, year: 2026, startDate: "2026-05-11", endDate: "2026-07-03", currentParticipants: 2, maxParticipants: 20, spotsRemaining: 18, price: "150 000 FCFA", status: "UPCOMING", format: "REMOTE" }),
        ],
    },
    {
        id: "mock-python",
        title: "Bootcamp Python pour la data",
        description: "Une compétence de programmation différenciante, appliquée à l'analyse de données.",
        duration: "10 semaines",
        audience: "Reconversion technique, étudiants, futurs Data Analyst",
        prerequisites: "Aucun prérequis technique",
        price: "100 000 FCFA",
        benefits: [
            "Manipuler des données réelles avec Python, Pandas & Numpy",
            "Visualiser et raconter vos analyses",
            "Construire un portfolio de notebooks",
            "Compléter avec le bootcamp SQL si besoin",
        ],
        category: "python",
        tag: null,
        iconName: "Code2",
        featured: false,
        published: true,
        displayOrder: 1,
        createdAt: "", updatedAt: "",
        tagline: "La programmation appliquée à la data, pour sortir du low-code",
        colorKey: "primary",
        profiles: [
            { icon: "🔄", label: "Reconversion technique" },
            { icon: "🎓", label: "Étudiants en fin de cursus" },
            { icon: "📈", label: "Futurs Data Analyst / Data Scientist" },
        ],
        tools: [
            { name: "Python", level: 85 },
            { name: "Pandas", level: 85 },
            { name: "Numpy", level: 75 },
            { name: "Jupyter Notebook", level: 80 },
        ],
        curriculum: [
            { week: "Bloc 1", title: "Bases du langage Python", hours: "—", topics: ["Variables, structures de données, fonctions", "Prise en main de Jupyter Notebook"], project: "Premiers scripts d'automatisation" },
            { week: "Bloc 2", title: "Manipulation de données", hours: "—", topics: ["Import, nettoyage, transformation avec Pandas", "Cas d'usage sénégalais"], project: "Nettoyage et analyse d'un dataset réel" },
            { week: "Bloc 4", title: "Machine Learning & Portfolio", hours: "—", topics: ["Notions de base du ML", "Constitution du portfolio"], project: "🏆 Notebook commenté présenté devant jury" },
        ],
        outcomes: [],
        testimonial: {
            name: "Khoudia DIAO", role: "Investment Analyst", company: "Mazars", initials: "KD",
            content: "J'ai appris Python, réalisé plusieurs projets réels et décroché un poste chez Mazars.",
        },
        certification: { name: "Attestation DataMasteryHub", logo: "🎓", description: "Délivrée à l'issue du bootcamp, accompagnée du portfolio de projets" },
        nextSession: session({ id: "mock-python-s2", bootcampId: "mock-python", sessionName: "Cohorte Février 2026", cohortNumber: 6, year: 2026, startDate: "2026-02-02", endDate: "2026-04-13", currentParticipants: 9, maxParticipants: 18, spotsRemaining: 9, price: "100 000 FCFA", status: "OPEN", format: "REMOTE" }),
        sessions: [
            session({ id: "mock-python-s2", bootcampId: "mock-python", sessionName: "Cohorte Février 2026", cohortNumber: 6, year: 2026, startDate: "2026-02-02", endDate: "2026-04-13", currentParticipants: 9, maxParticipants: 18, spotsRemaining: 9, price: "100 000 FCFA", status: "OPEN", format: "REMOTE" }),
            session({ id: "mock-python-s3", bootcampId: "mock-python", sessionName: "Cohorte Avril 2026", cohortNumber: 7, year: 2026, startDate: "2026-04-20", endDate: "2026-06-29", currentParticipants: 1, maxParticipants: 18, spotsRemaining: 17, price: "100 000 FCFA", status: "UPCOMING", format: "HYBRID" }),
        ],
    },
    {
        id: "mock-sql",
        title: "Bootcamp SQL pour la data",
        description: "La brique fondamentale pour interroger n'importe quelle base de données.",
        duration: "2 à 3 semaines",
        audience: "Débutants en data, professionnels Excel en évolution",
        prerequisites: "Aucun prérequis technique",
        price: "60 000 FCFA",
        benefits: [
            "Modèle relationnel et jointures",
            "Agrégations et sous-requêtes",
            "Bonnes pratiques de performance",
            "Base de données d'entraînement réutilisable",
        ],
        category: "sql",
        tag: null,
        iconName: "Table2",
        featured: false,
        published: true,
        displayOrder: 2,
        createdAt: "", updatedAt: "",
        tagline: "La brique fondamentale pour interroger n'importe quelle base de données",
        colorKey: "accent",
        profiles: [
            { icon: "🌱", label: "Débutants en data" },
            { icon: "📊", label: "Professionnels Excel en évolution" },
            { icon: "🧩", label: "Complément Power BI / Python" },
        ],
        tools: [
            { name: "SQL (MySQL)", level: 85 },
            { name: "Modèle relationnel", level: 80 },
            { name: "Jointures & sous-requêtes", level: 80 },
        ],
        curriculum: [
            { week: "Bloc 1", title: "Modèle relationnel", hours: "—", topics: ["Tables, clés primaires et étrangères", "Prise en main de MySQL"], project: "Exploration d'une base de données d'entreprise" },
            { week: "Bloc 2", title: "Requêtes et jointures", hours: "—", topics: ["SELECT, WHERE, ORDER BY", "INNER/LEFT/RIGHT JOIN"], project: "Requêtes croisées multi-tables" },
            { week: "Bloc 4", title: "Projet final", hours: "—", topics: ["Construction d'une base d'entraînement", "Documentation des requêtes"], project: "🏆 Base de données d'entraînement réutilisable" },
        ],
        outcomes: [],
        testimonial: { name: "", role: "", company: "", content: "", initials: "" },
        certification: { name: "Attestation DataMasteryHub", logo: "🎓", description: "Délivrée avec la base de données d'entraînement réutilisable" },
        nextSession: session({ id: "mock-sql-s1", bootcampId: "mock-sql", sessionName: "Cohorte Février 2026", cohortNumber: 3, year: 2026, startDate: "2026-02-16", endDate: "2026-03-06", currentParticipants: 14, maxParticipants: 20, spotsRemaining: 6, price: "60 000 FCFA", status: "OPEN", format: "REMOTE" }),
        sessions: [
            session({ id: "mock-sql-s1", bootcampId: "mock-sql", sessionName: "Cohorte Février 2026", cohortNumber: 3, year: 2026, startDate: "2026-02-16", endDate: "2026-03-06", currentParticipants: 14, maxParticipants: 20, spotsRemaining: 6, price: "60 000 FCFA", status: "OPEN", format: "REMOTE" }),
            session({ id: "mock-sql-s2", bootcampId: "mock-sql", sessionName: "Cohorte Avril 2026", cohortNumber: 4, year: 2026, startDate: "2026-04-06", endDate: "2026-04-24", currentParticipants: 3, maxParticipants: 20, spotsRemaining: 17, price: "60 000 FCFA", status: "UPCOMING", format: "REMOTE" }),
        ],
    },
    {
        id: "mock-excel-finance",
        title: "Excel pour Financiers & Contrôleurs de gestion",
        description: "Modélisation financière, tableaux de bord EBITDA et passerelle vers Power BI.",
        duration: "5 à 8 jours",
        audience: "Comptables, contrôleurs de gestion, auditeurs, profils banque/fintech",
        prerequisites: "Bases Excel",
        price: "120 000 FCFA",
        benefits: [
            "Modélisation financière sous Excel",
            "Tableaux de bord de pilotage et EBITDA",
            "Consolidation multi-sources",
            "Passerelle vers Power BI",
        ],
        category: "excel-finance",
        tag: null,
        iconName: "Calculator",
        featured: false,
        published: true,
        displayOrder: 3,
        createdAt: "", updatedAt: "",
        tagline: "Excel spécialisé finance & contrôle de gestion — passerelle vers Power BI",
        colorKey: "primary",
        profiles: [
            { icon: "🧮", label: "Comptables & contrôleurs de gestion" },
            { icon: "🔍", label: "Auditeurs" },
            { icon: "🏦", label: "Profils banque, fintech, UEMOA" },
        ],
        tools: [
            { name: "Excel avancé", level: 85 },
            { name: "Modélisation financière", level: 80 },
            { name: "Tableaux de bord EBITDA", level: 75 },
        ],
        curriculum: [
            { week: "Bloc 1", title: "Modélisation financière", hours: "—", topics: ["Structuration d'un modèle financier", "Fonctions financières avancées"], project: "Modèle de budget réutilisable" },
            { week: "Bloc 2", title: "Pilotage & EBITDA", hours: "—", topics: ["Tableaux de bord de pilotage", "Calcul et suivi de l'EBITDA"], project: "Tableau de bord de pilotage EBITDA" },
            { week: "Bloc 4", title: "Passerelle vers Power BI", hours: "—", topics: ["De la modélisation Excel au dashboard Power BI", "Plan de montée en compétence"], project: "🏆 Restitution des modèles Excel réutilisables" },
        ],
        outcomes: [],
        testimonial: { name: "", role: "", company: "", content: "", initials: "" },
        certification: { name: "Attestation DataMasteryHub", logo: "🎓", description: "Délivrée avec les modèles Excel réutilisables (budget, reporting, EBITDA)" },
        nextSession: session({ id: "mock-ef-s1", bootcampId: "mock-excel-finance", sessionName: "Cohorte Mars 2026", cohortNumber: 2, year: 2026, startDate: "2026-03-16", endDate: "2026-03-24", currentParticipants: 6, maxParticipants: 15, spotsRemaining: 9, price: "120 000 FCFA", status: "OPEN", format: "PRESENTIEL" }),
        sessions: [
            session({ id: "mock-ef-s1", bootcampId: "mock-excel-finance", sessionName: "Cohorte Mars 2026", cohortNumber: 2, year: 2026, startDate: "2026-03-16", endDate: "2026-03-24", currentParticipants: 6, maxParticipants: 15, spotsRemaining: 9, price: "120 000 FCFA", status: "OPEN", format: "PRESENTIEL" }),
        ],
    },
];

export function getMockBootcamp(id: string): Bootcamp | undefined {
    return MOCK_BOOTCAMP_CATALOG.find((b) => b.id === id);
}
