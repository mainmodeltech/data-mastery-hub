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
  phone: '+221 78 631 04 32',
  phoneRaw: '+221786310432',
  email: 'admin@model-technologie.com',
  whatsappUrl: 'https://wa.me/221786310432',
  social: {
    linkedin: 'https://www.linkedin.com/company/model-technologie/?viewAsMember=true',
    instagram: 'https://www.instagram.com/model.technologie/',
  },
} as const;

// ============================================================
// Statistiques (affichees sur le site public)
// ============================================================

export const STATS = {
  professionals: '10+',
  partners: '5+',
  satisfaction: '98%',
  certificationRate: '90%',
} as const;

// ============================================================
// Navigation
// ============================================================

export const PUBLIC_NAVIGATION = [
  { name: 'Accueil', href: '/' },
  { name: 'Bootcamps', href: '/bootcamps' },
  { name: 'Entreprises', href: '/entreprises' },
  { name: 'Alumni', href: '/alumni' },
  { name: 'Contact', href: '/contact' },
  { name: 'A propos', href: '/a-propos' },
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
  { name: 'Bootcamps DataMasteryHub', href: '/bootcamps' },
  { name: 'Formation sur mesure Data', href: '/entreprises#data-sur-mesure' },
  { name: 'Formation sur mesure Power BI', href: '/entreprises#power-bi-entreprise' },
  { name: 'Mise à niveau Excel', href: '/entreprises#excel-entreprise' },
] as const;

// ============================================================
// Configuration API
// ============================================================

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'https://api.model-technologie.com/api/v1',
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
