/**
 * mockFormationsCatalog.ts
 *
 * Données de démonstration pour le catalogue par domaines (Lot 1).
 * Respecte exactement le contrat de src/types/formation.type.ts — à remplacer par
 * de vraies données dès que le backend expose Domain/Partner (voir note de ce
 * fichier et docs/design/README.md §3-§4). src/services/formationService.ts
 * bascule automatiquement dessus si l'API réelle ne répond pas.
 */
import { BarChart3, Database, Users2 } from "lucide-react";
import type { Domain, Partner, Formation } from "@/types/formation.type";
import type { BootcampSession } from "@/types/bootcamp.type";

const nowYear = new Date().getFullYear();

function session(partial: Partial<BootcampSession> & Pick<BootcampSession, "id" | "bootcampId">): BootcampSession {
  return {
    sessionName: null,
    cohortNumber: null,
    year: nowYear,
    startDate: null,
    endDate: null,
    registrationDeadline: null,
    maxParticipants: 15,
    currentParticipants: 0,
    isFull: false,
    schedule: "Soir & week-end",
    status: "OPEN",
    format: "PRESENTIEL",
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

// ─── Domaines ─────────────────────────────────────────────────────────────────

export const MOCK_DOMAINS: Domain[] = [
  {
    id: "dom-data-bi",
    slug: "data-bi",
    name: "Data & BI",
    description: "Power BI, Python, SQL et Excel Finance — conçues et dispensées par Model Technologie.",
    badge: "NOTRE SPÉCIALITÉ",
    comingSoon: false,
    displayOrder: 0,
  },
  {
    id: "dom-gestion-projet",
    slug: "gestion-de-projet-agile",
    name: "Gestion de projet & Agile",
    description: "Scrum, certifications PM — en partenariat avec des experts certifiés.",
    badge: "NOUVEAU · EN PARTENARIAT",
    comingSoon: false,
    displayOrder: 1,
  },
  {
    id: "dom-cyber",
    slug: "cybersecurite",
    name: "Cybersécurité",
    description: "[Prochain domaine] — fondamentaux de la cybersécurité pour les équipes IT.",
    badge: "BIENTÔT",
    comingSoon: true,
    displayOrder: 2,
  },
];

// ─── Partenaires ──────────────────────────────────────────────────────────────

export const MOCK_PARTNERS: Partner[] = [
  {
    id: "partner-agile-senegal",
    slug: "agile-senegal",
    name: "Agile Sénégal",
    logoUrl: null,
    bio:
      "Cabinet de formation certifié, spécialisé dans les méthodes agiles et la préparation aux certifications Scrum.org.",
    website: "https://example.com/agile-senegal",
  },
];

// ─── Formations ───────────────────────────────────────────────────────────────

export const MOCK_FORMATIONS: Formation[] = [
  {
    id: "formation-bi",
    slug: "power-bi-business-intelligence",
    title: "Bootcamp Power BI & Business Intelligence",
    description:
      "Maîtrisez Power BI, DAX et Power Query pour construire des tableaux de bord professionnels et préparer la certification Microsoft PL-300.",
    duration: "8 semaines",
    audience: "Contrôleurs de gestion, responsables financiers, managers, commerciaux",
    prerequisites: "Bases d'Excel",
    price: "450 000 FCFA",
    benefits: [
      "Tableaux de bord Power BI professionnels",
      "Maîtrise du langage DAX",
      "Préparation à la certification Microsoft PL-300",
    ],
    category: "bi",
    tag: "Le plus demandé",
    iconName: "BarChart3",
    featured: true,
    published: true,
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nextSession: session({
      id: "sess-bi-1",
      bootcampId: "formation-bi",
      sessionName: "Cohorte 12",
      cohortNumber: 12,
      startDate: `${nowYear}-02-10`,
      endDate: `${nowYear}-04-05`,
      registrationDeadline: `${nowYear}-02-03`,
      maxParticipants: 15,
      currentParticipants: 9,
      spotsRemaining: 6,
      price: "450 000 FCFA",
    }),
    sessions: [
      session({
        id: "sess-bi-1",
        bootcampId: "formation-bi",
        sessionName: "Cohorte 12",
        cohortNumber: 12,
        startDate: `${nowYear}-02-10`,
        endDate: `${nowYear}-04-05`,
        registrationDeadline: `${nowYear}-02-03`,
        currentParticipants: 9,
        spotsRemaining: 6,
        price: "450 000 FCFA",
      }),
      session({
        id: "sess-bi-2",
        bootcampId: "formation-bi",
        sessionName: "Cohorte 13",
        cohortNumber: 13,
        startDate: `${nowYear}-05-12`,
        endDate: `${nowYear}-07-07`,
        registrationDeadline: `${nowYear}-05-05`,
        status: "UPCOMING",
        currentParticipants: 2,
        spotsRemaining: 13,
        price: "450 000 FCFA",
      }),
    ],
    domainId: "dom-data-bi",
    domain: MOCK_DOMAINS[0],
    deliveredBy: "INTERNAL",
    partnerId: null,
    partner: null,
    level: "DEBUTANT",
    format: "PRESENTIEL",
    targetRoles: ["Banque & Finance", "Comptabilité & Audit", "Commercial"],
    certificationPrep: "Microsoft Power BI Data Analyst (PL-300)",
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
    ],
    curriculum: [
      { week: "Semaines 1-2", title: "Fondamentaux & Excel Avancé", hours: "18h", topics: ["TCD avancés", "INDEX/MATCH/SUMIFS", "Power Query"], project: "Tableau de bord financier Excel" },
      { week: "Semaines 3-4", title: "Modélisation des données", hours: "18h", topics: ["Modèle en étoile", "DAX", "Mesures calculées"], project: "Modèle de données multi-sources" },
      { week: "Semaines 5-6", title: "Déploiement & Certification", hours: "18h", topics: ["Power BI Service", "RLS", "Préparation PL-300"], project: "🏆 Projet final · Présentation devant jury" },
    ],
    outcomes: [
      { stat: "94%", label: "taux de satisfaction alumni" },
      { stat: "8 sem.", label: "pour devenir opérationnel" },
      { stat: "100%", label: "pratique sur cas réels" },
    ],
    testimonial: {
      name: "Emmanuel BOUADI",
      role: "Data analyst",
      company: "WAVE",
      initials: "EB",
      content:
        "Durant mon stage à la Banque Centrale, les compétences acquises en Excel, Power Query et Power BI m'ont permis de concevoir un tableau de bord automatisé.",
    },
    certification: {
      name: "Microsoft Power BI Data Analyst (PL-300)",
      logo: "🏅",
      description: "Certification reconnue mondialement, préparée tout au long du programme",
    },
    relatedFormationIds: ["formation-data-python"],
  },

  {
    id: "formation-data-python",
    slug: "data-analyst-python-sql",
    title: "Bootcamp Data Analyst — Python & SQL",
    description:
      "Apprenez Python, SQL et Power BI pour devenir Data Analyst opérationnel et construisez un portfolio de projets réels.",
    duration: "10 semaines",
    audience: "Reconversion, jeunes diplômés, développeurs",
    prerequisites: "Aucun",
    price: "550 000 FCFA",
    benefits: [
      "Maîtrise de Python et SQL",
      "Portfolio de 3+ projets",
      "Préparation aux entretiens Data Analyst",
    ],
    category: "data",
    tag: null,
    iconName: "Database",
    featured: true,
    published: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nextSession: session({
      id: "sess-data-1",
      bootcampId: "formation-data-python",
      sessionName: "Cohorte 7",
      cohortNumber: 7,
      startDate: `${nowYear}-03-03`,
      endDate: `${nowYear}-05-12`,
      registrationDeadline: `${nowYear}-02-24`,
      currentParticipants: 11,
      spotsRemaining: 4,
      price: "550 000 FCFA",
    }),
    sessions: [
      session({
        id: "sess-data-1",
        bootcampId: "formation-data-python",
        sessionName: "Cohorte 7",
        cohortNumber: 7,
        startDate: `${nowYear}-03-03`,
        endDate: `${nowYear}-05-12`,
        registrationDeadline: `${nowYear}-02-24`,
        currentParticipants: 11,
        spotsRemaining: 4,
        price: "550 000 FCFA",
      }),
    ],
    domainId: "dom-data-bi",
    domain: MOCK_DOMAINS[0],
    deliveredBy: "INTERNAL",
    partnerId: null,
    partner: null,
    level: "DEBUTANT",
    format: "HYBRIDE",
    targetRoles: ["Banque & Finance", "RH"],
    certificationPrep: "Certificat DataCamp",
    profiles: [
      { icon: "🔄", label: "En reconversion professionnelle" },
      { icon: "🎓", label: "Jeunes diplômés (toute filière)" },
      { icon: "⚙️", label: "Développeurs souhaitant se spécialiser" },
    ],
    tools: [
      { name: "Python", level: 80 },
      { name: "SQL", level: 80 },
      { name: "Pandas", level: 85 },
      { name: "PostgreSQL", level: 70 },
    ],
    curriculum: [
      { week: "Semaines 1-3", title: "Python pour la Data", hours: "36h", topics: ["Pandas", "Numpy", "Matplotlib"], project: "Analyse exploratoire d'un dataset réel" },
      { week: "Semaines 4-6", title: "Fondamentaux de la Data", hours: "36h", topics: ["SQL", "Jointures", "PostgreSQL"], project: "Analyse de données e-commerce en SQL" },
      { week: "Semaines 8-10", title: "Projets Réels & Emploi", hours: "36h", topics: ["Méthodologie projet", "Git", "Portfolio GitHub"], project: "🏆 Projet final certifiant" },
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
        "Grâce aux compétences acquises en analyse, traitement et visualisation des données, j'ai pu décrocher mon emploi actuel.",
    },
    certification: {
      name: "Certificat DataCamp (en cours)",
      logo: "🎓",
      description: "Certificat reconnu par les entreprises dans le monde",
    },
    relatedFormationIds: ["formation-bi"],
  },

  {
    id: "formation-scrum-master",
    slug: "scrum-master-certifie-psm1",
    title: "Scrum Master Certifié (PSM I)",
    description:
      "Préparez la certification Professional Scrum Master I (Scrum.org) et animez des équipes agiles avec confiance.",
    duration: "4 semaines",
    audience: "Chefs de projet, product owners, managers IT",
    prerequisites: "Aucun",
    price: "350 000 FCFA",
    benefits: [
      "Animation de cérémonies Scrum",
      "Préparation à l'examen PSM I",
      "Mise en pratique sur cas réels d'équipe",
    ],
    category: "gestion-projet",
    tag: "Nouveau",
    iconName: "Users2",
    featured: false,
    published: true,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nextSession: session({
      id: "sess-scrum-1",
      bootcampId: "formation-scrum-master",
      sessionName: "Session mars",
      startDate: `${nowYear}-03-17`,
      endDate: `${nowYear}-04-11`,
      registrationDeadline: `${nowYear}-03-10`,
      maxParticipants: 12,
      currentParticipants: 5,
      spotsRemaining: 7,
      format: "HYBRID",
      price: "350 000 FCFA",
    }),
    sessions: [
      session({
        id: "sess-scrum-1",
        bootcampId: "formation-scrum-master",
        sessionName: "Session mars",
        startDate: `${nowYear}-03-17`,
        endDate: `${nowYear}-04-11`,
        registrationDeadline: `${nowYear}-03-10`,
        maxParticipants: 12,
        currentParticipants: 5,
        spotsRemaining: 7,
        format: "HYBRID",
        price: "350 000 FCFA",
      }),
    ],
    domainId: "dom-gestion-projet",
    domain: MOCK_DOMAINS[1],
    deliveredBy: "PARTNER",
    partnerId: "partner-agile-senegal",
    partner: MOCK_PARTNERS[0],
    level: "INTERMEDIAIRE",
    format: "HYBRIDE",
    targetRoles: ["Chef de projet", "RH"],
    certificationPrep: "Professional Scrum Master I (PSM I) — Scrum.org",
    profiles: [
      { icon: "📋", label: "Chefs de projet" },
      { icon: "🧭", label: "Product owners" },
      { icon: "👥", label: "Managers d'équipes IT" },
    ],
    tools: [
      { name: "Scrum", level: 85 },
      { name: "Jira", level: 70 },
      { name: "Facilitation agile", level: 75 },
    ],
    curriculum: [
      { week: "Semaine 1", title: "Fondamentaux Scrum", hours: "9h", topics: ["Rôles", "Artefacts", "Événements"], project: "Simulation de sprint planning" },
      { week: "Semaine 2-3", title: "Animation & Facilitation", hours: "12h", topics: ["Rétrospectives", "Résolution de conflits", "Mesure de vélocité"], project: "Animation d'une rétrospective" },
      { week: "Semaine 4", title: "Préparation certification", hours: "9h", topics: ["Blancs d'examen PSM I", "Révisions ciblées"], project: "🏆 Examen blanc final" },
    ],
    outcomes: [
      { stat: "85%", label: "réussite à l'examen PSM I" },
      { stat: "4 sem.", label: "pour se certifier" },
    ],
    testimonial: null,
    certification: {
      name: "Professional Scrum Master I (PSM I)",
      logo: "🏅",
      description: "Certification internationale délivrée par Scrum.org",
    },
    relatedFormationIds: ["formation-bi"],
  },
];

export function getFormationBySlug(slug: string): Formation | undefined {
  return MOCK_FORMATIONS.find((f) => f.slug === slug);
}
