/**
 * Constantes centralisees de l'application.
 * Toutes les valeurs hardcodees doivent etre definies ici.
 */

// ============================================================
// Informations de l'entreprise
// ============================================================

export const COMPANY = {
  name: 'Model Technologie',
  tagline: 'Toujours plus haut !',
  description: 'Expert en formations Power BI et Data Analytics. Accompagnement des entreprises vers l\'excellence data.',
  address: 'Dakar, Senegal',
  phone: '+221 77 000 00 00',
  phoneRaw: '+221770000000',
  email: 'contact@modeltechnologie.com',
  whatsappUrl: 'https://wa.me/221770000000',
  social: {
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
  },
} as const;

// ============================================================
// Statistiques (affichees sur le site public)
// ============================================================

export const STATS = {
  professionals: '500+',
  partners: '15+',
  satisfaction: '98%',
  certificationRate: '90%',
} as const;

// ============================================================
// Navigation
// ============================================================

export const PUBLIC_NAVIGATION = [
  { name: 'Accueil', href: '/' },
  { name: 'A propos', href: '/a-propos' },
  { name: 'Services', href: '/services' },
  { name: 'Bootcamps', href: '/bootcamps' },
  { name: 'Alumni', href: '/alumni' },
  { name: 'References', href: '/references' },
  { name: 'Contact', href: '/contact' },
] as const;

export const ADMIN_NAVIGATION = [
  { href: '/admin', label: 'Tableau de bord', icon: 'LayoutDashboard', exact: true },
  { href: '/admin/bootcamps', label: 'Bootcamps', icon: 'BookOpen' },
  { href: '/admin/inscriptions', label: 'Inscriptions', icon: 'ClipboardList' },
  { href: '/admin/services', label: 'Services', icon: 'Briefcase' },
  { href: '/admin/references', label: 'References', icon: 'Star' },
  { href: '/admin/temoignages', label: 'Temoignages', icon: 'MessageSquare' },
  { href: '/admin/alumni', label: 'Alumni', icon: 'GraduationCap' },
  { href: '/admin/projets', label: 'Projets', icon: 'FolderKanban' },
  { href: '/admin/messages', label: 'Messages', icon: 'Mail' },
  { href: '/admin/galerie', label: 'Galerie', icon: 'Image' },
] as const;

export const FOOTER_SERVICES = [
  { name: 'Formation Power BI', href: '/services' },
  { name: 'Bootcamps Data', href: '/bootcamps' },
  { name: 'Formation Intra-entreprise', href: '/services' },
  { name: 'Certification Microsoft', href: '/services' },
] as const;

// ============================================================
// Configuration API
// ============================================================

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api/v1',
  timeout: 15000,
  retryCount: 3,
  retryDelay: 1000,
} as const;

// ============================================================
// Configuration React Query
// ============================================================

export const QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000,       // 5 minutes
  gcTime: 10 * 60 * 1000,         // 10 minutes (anciennement cacheTime)
  retryCount: 2,
  refetchOnWindowFocus: false,
} as const;

// ============================================================
// Donnees statiques de fallback (quand l'API n'est pas disponible)
// ============================================================

export const FALLBACK_SERVICES = [
  {
    icon: 'BarChart3',
    title: 'Formation Power BI',
    description: 'Maitrisez Microsoft Power BI, l\'outil de reference en Business Intelligence. Des fondamentaux a l\'expertise avancee.',
    features: [
      'Creation de tableaux de bord interactifs',
      'DAX et modelisation de donnees',
      'Connexion aux sources de donnees',
      'Partage et collaboration',
      'Bonnes pratiques de visualisation',
    ],
    duration: '3 a 5 jours selon le niveau',
  },
  {
    icon: 'FileSpreadsheet',
    title: 'Excel Avance & VBA',
    description: 'Allez au-dela des bases d\'Excel. Automatisez vos taches et creez des outils de gestion puissants.',
    features: [
      'Fonctions avancees (INDEX, MATCH, XLOOKUP)',
      'Tableaux croises dynamiques',
      'Introduction a VBA et macros',
      'Power Query pour l\'ETL',
      'Automatisation des reportings',
    ],
    duration: '2 a 3 jours',
  },
  {
    icon: 'Building',
    title: 'Formations Intra-entreprise',
    description: 'Programmes personnalises adaptes a vos problematiques metier et a votre contexte organisationnel.',
    features: [
      'Analyse de vos besoins specifiques',
      'Contenu sur-mesure',
      'Exercices bases sur vos donnees',
      'Sessions dans vos locaux',
      'Suivi post-formation inclus',
    ],
    duration: 'Sur mesure',
  },
  {
    icon: 'Award',
    title: 'Preparation Certification Microsoft',
    description: 'Preparez et reussissez l\'examen PL-300 Microsoft Power BI Data Analyst Associate.',
    features: [
      'Revue complete du programme d\'examen',
      'Exercices pratiques cibles',
      'Examens blancs commentes',
      'Conseils et astuces pour le jour J',
      'Taux de reussite superieur a 90%',
    ],
    duration: '2 a 3 jours',
  },
  {
    icon: 'Users',
    title: 'Coaching & Accompagnement',
    description: 'Accompagnement individuel ou en equipe pour vos projets data et la montee en competences continue.',
    features: [
      'Sessions de coaching personnalisees',
      'Revue de vos tableaux de bord',
      'Conseils d\'optimisation',
      'Transfert de competences',
      'Support continu',
    ],
    duration: 'A la demande',
  },
  {
    icon: 'GraduationCap',
    title: 'Bootcamps Intensifs',
    description: 'Programmes courts et intensifs pour une montee en competences rapide et efficace.',
    features: [
      'Format immersif sur quelques jours',
      'Projets pratiques fil rouge',
      'Travail en groupe',
      'Certification de fin de bootcamp',
      'Acces a la communaute alumni',
    ],
    duration: '3 a 5 jours',
  },
] as const;

export const FALLBACK_BOOTCAMPS = [
  {
    id: 'static-1',
    title: 'Power BI pour la Finance',
    description: 'Maitrisez Power BI avec des cas pratiques orientes finance : analyse de la rentabilite, suivi budgetaire, reporting financier automatise.',
    duration: '5 jours (35h)',
    audience: 'Controleurs de gestion, DAF, analystes financiers',
    prerequisites: 'Maitrise d\'Excel, notions de comptabilite',
    price: '450 000 FCFA',
    nextSession: '20 - 24 Janvier 2026',
    benefits: [
      'Tableaux de bord financiers interactifs',
      'Automatisation des reportings mensuels',
      'Analyse de variance et KPIs',
      'Connexion aux sources comptables',
      'Certification de fin de formation',
    ],
    featured: true,
    published: true,
  },
  {
    id: 'static-2',
    title: 'Data Analytics pour Managers',
    description: 'Developpez une culture data-driven. Apprenez a interpreter les donnees et prendre des decisions eclairees basees sur les faits.',
    duration: '3 jours (21h)',
    audience: 'Managers, directeurs, chefs de projet',
    prerequisites: 'Aucun prerequis technique',
    price: '350 000 FCFA',
    nextSession: '10 - 12 Fevrier 2026',
    benefits: [
      'Lecture et interpretation des donnees',
      'Identification des KPIs pertinents',
      'Prise de decision basee sur les donnees',
      'Communication avec les equipes data',
      'Initiation a Power BI',
    ],
    featured: false,
    published: true,
  },
  {
    id: 'static-3',
    title: 'Reporting & Data Visualization',
    description: 'Creez des visualisations impactantes et des rapports automatises qui communiquent efficacement vos insights.',
    duration: '4 jours (28h)',
    audience: 'Analystes, charges de reporting, data analysts',
    prerequisites: 'Bases Excel, esprit analytique',
    price: '400 000 FCFA',
    nextSession: '3 - 6 Mars 2026',
    benefits: [
      'Principes de data visualization',
      'Power BI Desktop complet',
      'Conception de dashboards efficaces',
      'Storytelling avec les donnees',
      'Publication et partage',
    ],
    featured: false,
    published: true,
  },
  {
    id: 'static-4',
    title: 'Preparation Certification PL-300',
    description: 'Preparez-vous intensivement a l\'examen Microsoft PL-300 Power BI Data Analyst avec un taux de reussite superieur a 90%.',
    duration: '3 jours (21h)',
    audience: 'Utilisateurs Power BI confirmes',
    prerequisites: 'Experience Power BI (6 mois minimum)',
    price: '300 000 FCFA',
    nextSession: '17 - 19 Mars 2026',
    benefits: [
      'Revision complete du syllabus',
      'Exercices pratiques cibles',
      '3 examens blancs commentes',
      'Strategies de passage d\'examen',
      'Support jusqu\'a l\'examen',
    ],
    featured: false,
    published: true,
  },
] as const;

export const FALLBACK_REFERENCES = [
  { name: 'SGBS', sector: 'Banque' },
  { name: 'BOA', sector: 'Banque' },
  { name: 'CBAO', sector: 'Banque' },
  { name: 'AXA', sector: 'Assurance' },
  { name: 'Ecobank', sector: 'Banque' },
  { name: 'Orange', sector: 'Telecom' },
  { name: 'LONASE', sector: 'Loisirs' },
  { name: 'PAD', sector: 'Logistique' },
] as const;
