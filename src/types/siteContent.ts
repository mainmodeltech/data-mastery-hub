/**
 * siteContent.ts — forme des contenus éditoriaux servis par le backend (`/site-settings`).
 * Les valeurs par défaut vivent dans modeltech-backend : src/main/resources/site-content/<clé>.json.
 * Les chaînes peuvent contenir des variables `{nom}` remplacées à l'affichage (voir lib/template.ts).
 */

export interface LinkItem { label: string; href: string }
export interface FaqEntry { question: string; answer: string }
export interface FaqBlock { eyebrow: string; title: string; items: FaqEntry[] }

// ─── site.company ─────────────────────────────────────────────────────────────

export interface SiteCompany {
  name: string;
  tagline: string;
  description: string;
  address: string;
  addressHelper: string;
  phone: string;
  phoneRaw: string;
  whatsappUrl: string;
  whatsappHelper: string;
  email: string;
  emailHelper: string;
  hours: string;
  hoursHelper: string;
  social: { linkedin: string; instagram: string };
  map: { enabled: boolean; query: string; zoom: number; title: string };
}

// ─── site.nav ─────────────────────────────────────────────────────────────────

export interface SiteNav {
  header: { links: LinkItem[]; loginLabel: string; applyLabel: string; applyHref: string };
  footer: {
    about: string;
    columns: { title: string; links: LinkItem[] }[];
    contactTitle: string;
    rights: string;
  };
}

// ─── page.contact ─────────────────────────────────────────────────────────────

export interface PageContact {
  eyebrow: string;
  title: string;
  intro: string;
  form: {
    particulierLabel: string;
    entrepriseLabel: string;
    namePlaceholder: string;
    phonePlaceholder: string;
    emailPlaceholder: string;
    subjectPlaceholder: string;
    companyPlaceholder: string;
    messagePlaceholder: string;
    submitLabel: string;
    note: string;
    successTitle: string;
    successText: string;
    successAgain: string;
    subjects: { value: string; param: string }[];
  };
  faq: FaqBlock;
  image: string;
  imageAlt: string;
}

// ─── page.home ────────────────────────────────────────────────────────────────

export interface PageHome {
  hero: {
    badgeOpen: string; badgeClosed: string;
    titleMobile: { before: string; accent: string }; subtitleMobile: string;
    titleDesktop: { before: string; accent: string }; subtitleDesktop: string;
    primaryOpen: string; primaryClosed: string;
    secondary: LinkItem; quiz: LinkItem;
  };
  visual: { imageAlt: string; quote: string; author: string; authorExtra: string; image: string };
  proof: {
    alumniStat: { value: string; label: string };
    formationsLabel: string;
    projectStat: { value: string; label: string };
    companiesLabel: string;
    companies: string[];
  };
  cohort: {
    eyebrowOpen: string; eyebrowClosed: string;
    titleWithPlaces: string; titleDefault: string; description: string;
    applyOpen: string; applyClosed: string; compare: string;
    labels: { start: string; startUnknown: string; rhythm: string; format: string; prerequisites: string; price: string; spots: string };
  };
  byRole: { eyebrow: string; title: string; items: { title: string; description: string; path: string }[] };
  parcours: { eyebrow: string; title: string; all: string; seeProgram: string; fallbackTag: string };
  newDomain: { badge: string; eyebrow: string; title: string; description: string; cta: LinkItem; partner: LinkItem };
  coaching: { eyebrow: string; title: string; description: string; cta: LinkItem; image: string; imageAlt: string };
  testimonials: { eyebrow: string; title: string; all: string };
  highlights: { eyebrow: string; title: string; description: string }[];
  enterprises: {
    eyebrow: string; title: string; description: string; cta: LinkItem;
    offers: { eyebrow: string; title: string; description: string }[];
    forWhomLabel: string; forWhom: string[]; image: string; imageAlt: string;
  };
  closing: { title: string; description: string; apply: string; whatsapp: string; faq: FaqEntry[] };
}

// ─── page.about ───────────────────────────────────────────────────────────────

export interface PageAbout {
  hero: {
    badge: string; titleBefore: string; titleAccent: string; description: string;
    primary: LinkItem; secondary: LinkItem;
    stats: { value: string; label: string }[];
    image: string; imageAlt: string;
  };
  missionVision: { label: string; title: string; content: string }[];
  timeline: { eyebrow: string; title: string; items: { year: string; label: string; description: string }[] };
  values: { eyebrow: string; title: string; items: { title: string; description: string }[] };
  team: {
    eyebrow: string; title: string; description: string;
    members: {
      initials: string; color: string; name: string; role: string; description: string;
      linkedin: string; tags: string[]; photoUrl?: string;
    }[];
  };
  partners: { label: string; items: { name: string; sector: string }[] };
  cta: { eyebrow: string; title: string; description: string; primary: LinkItem; secondary: LinkItem; whatsapp: string };
}

// ─── page.coaching ────────────────────────────────────────────────────────────

export interface PageCoaching {
  hero: { eyebrow: string; title: string; description: string; primary: LinkItem; secondary: LinkItem; note: string; image: string; imageAlt: string };
  /** `items` vide = bloc des créneaux masqué (aucune disponibilité inventée). */
  slots: {
    title: string; badge: string; bookHref: string;
    items: { day: string; time: string; available: boolean }[];
    formatNote: string; durationNote: string;
  };
  whoFor: { eyebrow: string; title: string; items: { title: string; description: string }[] };
  pricing: {
    eyebrow: string; title: string; onQuote: string; choose: string; recommended: string; note: string;
    /** `price` vide = « Sur devis ». */
    tiers: { name: string; sessions: string; price: string; highlight: boolean; features: string[] }[];
  };
  process: { eyebrow: string; title: string; steps: { title: string; description: string }[] };
  coach: {
    initials: string; label: string; name: string; description: string; linkedinLabel: string; photoUrl?: string;
    /** `quote` vide = témoignage masqué. */
    testimonial: { quote: string; author: string };
  };
  faq: { eyebrow: string; title: string; cta: LinkItem; items: FaqEntry[] };
}

// ─── page.entreprises ─────────────────────────────────────────────────────────

export interface PageEntreprises {
  hero: {
    eyebrow: string; title: string; description: string; primary: LinkItem;
    /** `url` vide = bouton de plaquette masqué. */
    brochure: { label: string; url: string };
    image: { url: string; alt: string };
  };
  sectors: { label: string; items: string[] };
  departments: {
    eyebrow: string; title: string; todayLabel: string; afterLabel: string;
    items: { name: string; before: string; after: string }[];
  };
  offers: {
    eyebrow: string; title: string; cta: LinkItem;
    specLabels: { public: string; format: string; duration: string };
    items: {
      title: string; tagline: string; description: string;
      public: string; format: string; duration: string; features: string[];
    }[];
  };
  method: { eyebrow: string; title: string; steps: { title: string; description: string }[] };
  /** `enabled` faux ou `name` vide = bloc masqué. */
  reference: {
    enabled: boolean; eyebrow: string; title: string;
    name: string; sector: string; size: string; need: string; result: string;
    needLabel: string; resultLabel: string;
  };
  diagnostic: {
    eyebrow: string; title: string; points: string[];
    namePlaceholder: string; rolePlaceholder: string; companyPlaceholder: string; peoplePlaceholder: string;
    emailPlaceholder: string; phonePlaceholder: string; needPlaceholder: string; contextPlaceholder: string;
    submitLabel: string; note: string; successTitle: string; successText: string;
    image: string; imageAlt: string;
  };
}

// ─── page.partenaires ─────────────────────────────────────────────────────────

export interface PagePartenaires {
  hero: { eyebrow: string; title: string; description: string; primary: LinkItem; secondary: LinkItem; image: string; imageAlt: string };
  principle: { eyebrow: string; title: string; youTitle: string; you: string[]; weTitle: string; we: string[] };
  benefits: { eyebrow: string; title: string; items: { title: string; description: string }[] };
  method: { eyebrow: string; title: string; steps: { title: string; description: string }[] };
  requirements: { eyebrow: string; title: string; items: string[] };
  domains: { eyebrow: string; title: string; alreadyPartner: string; seeFormation: string };
  form: {
    eyebrow: string; title: string;
    namePlaceholder: string; orgPlaceholder: string; emailPlaceholder: string; phonePlaceholder: string;
    domainPlaceholder: string; linkedinPlaceholder: string; proposalPlaceholder: string; referencesPlaceholder: string;
    submitLabel: string; note: string; successTitle: string; successText: string;
  };
}

// ─── page.ressources ──────────────────────────────────────────────────────────

export interface ResourceArticle {
  category: string; title: string; summary?: string; url?: string; image?: string;
  author?: string; date?: string; readMin?: number;
}

export interface PageRessources {
  hero: { eyebrow: string; title: string; searchPlaceholder: string; searchLabel: string; allLabel: string };
  categories: string[];
  /** `item.title` vide = article à la une masqué. */
  featured: { badge: string; item: ResourceArticle; imageFallback: string };
  articles: { eyebrow: string; title: string; readLabel: string; empty: string; items: ResourceArticle[] };
  downloads: {
    eyebrow: string; title: string; subtitle: string; downloadLabel: string;
    items: { category: string; format: string; title: string; url: string }[];
  };
  /** `enabled` faux = atelier masqué. */
  workshop: { enabled: boolean; badge: string; title: string; subject: string; date: string; time: string; cta: LinkItem };
  quiz: { title: string; description: string; cta: LinkItem };
  newsletter: { title: string; subtitle: string; placeholder: string; submitLabel: string; successText: string };
  emptyNotice: string;
}

// ─── page.alumni ──────────────────────────────────────────────────────────────

export interface PageAlumni {
  hero: { eyebrow: string; title: string; image: string; imageAlt: string };
  /** Les valeurs peuvent contenir {alumniCount} et {rating} ; une statistique non calculable est masquée. */
  stats: { value: string; label: string }[];
  featured: { label: string; resultLabel: string };
  testimonials: { eyebrow: string; title: string; allLabel: string; empty: string };
  projects: { eyebrow: string; title: string; fallbackCapture: string; fallbackTag: string };
  ctas: { title: string; description: string; label: string; href: string; style: "navy" | "outline" }[];
  closing: { title: string; cta: LinkItem };
}

// ─── page.masterclass ─────────────────────────────────────────────────────────

export interface PageMasterclass {
  event: {
    /** Identifiant envoyé à POST /masterclass/register et utilisé par l'administration. */
    id: string;
    /** Début de l'événement (ISO 8601). */
    startsAt: string;
    durationLabel: string; timeLabel: string; place: string; format: string;
    registrationsClosed: boolean;
    registeredCount: string;
  };
  hero: {
    badgeOpen: string; badgeClosed: string;
    titleBefore: string; titleAccent: string; titleAfter: string; description: string;
    countdownLabel: string; points: string[]; image: string; imageAlt: string;
  };
  /** Variables : {count}, {date}. */
  closed: { badge: string; titleOver: string; titleClosed: string; message: string; formations: string };
  /** Variables : {email}, {date}, {time}. */
  form: {
    badge: string; title: string; subtitle: string;
    firstName: string; firstNamePlaceholder: string; lastName: string; lastNamePlaceholder: string;
    email: string; emailPlaceholder: string; phone: string; phonePlaceholder: string;
    profile: string; profilePlaceholder: string; profiles: { value: string; label: string }[];
    company: string; companyPlaceholder: string;
    submit: string; pending: string; meetNote: string;
    successTitle: string; successText: string; successDate: string;
    duplicateTitle: string; duplicateText: string; duplicateHint: string; duplicateReset: string;
  };
  /** `icon` : chart | zap | award. */
  learn: { eyebrow: string; title: string; description: string; items: { icon: string; title: string; description: string }[] };
  programme: { eyebrow: string; title: string; items: { time: string; title: string; description: string }[] };
  speaker: { label: string; name: string; role: string; bio: string; photoUrl: string; tags: string[] };
  cta: { titleOpen: string; titleClosed: string; textOpen: string; textClosed: string; buttonOpen: string; buttonClosed: string };
}

// ─── page.formations ──────────────────────────────────────────────────────────

export interface PageFormations {
  hero: { eyebrow: string; title: string; description: string; image: string; imageAlt: string };
  domains: { eyebrow: string; title: string; loading: string; empty: string; partnerLine: string; internalLine: string };
  calendar: { eyebrow: string; title: string; description: string };
  process: { eyebrow: string; title: string; steps: { title: string; description: string }[] };
  quiz: { title: string; description: string; cta: LinkItem };
  faq: FaqBlock;
}

// ─── page.orientation ─────────────────────────────────────────────────────────

export interface OrientationResult {
  /** chart | database | graduation | building */
  icon: string;
  tag: string; title: string; subtitle: string;
  /** Slug de la formation du catalogue à relier (titre, durée, prix, session viennent alors de l'API). */
  formationSlug: string;
  description: string; highlights: string[];
  cta: LinkItem; secondary: LinkItem;
  urgencyText: string;
  testimonial: { name: string; role: string; content: string; initials: string };
}

export interface PageOrientation {
  intro: {
    badge: string; titleBefore: string; titleAccent: string; description: string;
    features: { icon: string; text: string; sub: string }[];
    social: string; start: string; note: string; image: string; imageAlt: string;
  };
  /** Variables : {current}, {total}. */
  ui: {
    back: string; questionOf: string; next: string; seeResult: string; analysis: string;
    resultTitle: string; resultSubtitle: string; accomplish: string;
    questionLabel: string; whatsappLink: string; alumniLabel: string; alumniLink: string; restart: string;
  };
  questions: {
    id: string; title: string; subtitle: string;
    options: { emoji: string; label: string; sublabel?: string; value: string }[];
  }[];
  /**
   * Règles évaluées dans l'ordre : la première dont une clause (`anyOf`) est satisfaite donne le résultat.
   * Une clause est satisfaite quand, pour chaque question citée, la réponse figure dans la liste.
   */
  rules: { result: string; anyOf: Record<string, string[]>[] }[];
  defaultResult: string;
  results: Record<string, OrientationResult>;
}

/** Clés connues → forme du contenu. Complété page par page. */
export interface SiteContentMap {
  "site.company": SiteCompany;
  "site.nav": SiteNav;
  "page.contact": PageContact;
  "page.home": PageHome;
  "page.about": PageAbout;
  "page.coaching": PageCoaching;
  "page.entreprises": PageEntreprises;
  "page.partenaires": PagePartenaires;
  "page.ressources": PageRessources;
  "page.alumni": PageAlumni;
  "page.masterclass": PageMasterclass;
  "page.formations": PageFormations;
  "page.orientation": PageOrientation;
}

export type SiteContentKey = keyof SiteContentMap;
