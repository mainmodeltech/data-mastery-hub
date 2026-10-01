/**
 * formation.type.ts
 *
 * Lot 1 (docs/design/README.md §2-§3) — catalogue de formations par domaines.
 *
 * ⚠️ Domain/Partner et les champs delivered_by/level/format/certification_prep
 * n'existent PAS ENCORE côté backend (repo modeltech-backend, hors de cet espace
 * de travail) — voir README §3 "Modèle de données" + §4 lot back
 * `feature/domain-partner-model`. Ces types sont le contrat proposé côté front,
 * à faire valider puis implémenter côté backend ; en attendant, src/config/
 * mockFormationsCatalog.ts fournit des données de démonstration qui respectent
 * exactement ce contrat, et src/services/formationService.ts bascule dessus
 * si l'API réelle ne répond pas (404/erreur réseau) ou ne renvoie pas ces champs.
 *
 * `targetRoles` (filtre "Métier" visible dans Formations.dc.html) n'est PAS listé
 * au §3 du README : c'est une proposition d'ajout, pas un champ confirmé.
 */
import type { Bootcamp, BootcampSession } from "./bootcamp.type";
import type {
  ProfileEntry,
  ToolEntry,
  CurriculumWeek,
  OutcomeEntry,
  TestimonialEntry,
  CertificationEntry,
} from "@/config/bootcamps.config";

export type DeliveredBy = "INTERNAL" | "PARTNER";
export type FormationLevel = "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE";
export type FormationFormat = "PRESENTIEL" | "EN_LIGNE" | "HYBRIDE";

export interface Domain {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Badge court affiché sur la carte domaine, ex. "NOTRE SPÉCIALITÉ" / "NOUVEAU · EN PARTENARIAT" / "BIENTÔT" */
  badge: string;
  /** true = domaine annoncé mais pas encore de formations publiées (carte "Prochain domaine") */
  comingSoon: boolean;
  displayOrder: number;
}

export interface Partner {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  bio: string;
  website: string | null;
}

/**
 * Formation = Bootcamp (contrat backend actuel) + les champs proposés pour le
 * nouveau catalogue par domaines. Reste assignable partout où un `Bootcamp`
 * est attendu (ex: RegistrationModal) grâce au typage structurel.
 */
export interface Formation extends Bootcamp {
  slug: string;
  domainId: string;
  domain: Domain;
  deliveredBy: DeliveredBy;
  partnerId: string | null;
  partner: Partner | null;
  level: FormationLevel;
  format: FormationFormat;
  /** Proposition d'ajout (non confirmée côté backend) — voir note de fichier. */
  targetRoles: string[];
  certificationPrep: string | null;
  profiles: ProfileEntry[];
  tools: ToolEntry[];
  curriculum: CurriculumWeek[];
  outcomes: OutcomeEntry[];
  testimonial: TestimonialEntry | null;
  certification: CertificationEntry | null;
  relatedFormationIds: string[];
}

/** Une session, enrichie du nom/slug/domaine de sa formation — pour la vue calendrier. */
export interface FlatSession extends BootcampSession {
  formationId: string;
  formationSlug: string;
  formationTitle: string;
  domainName: string;
  deliveredBy: DeliveredBy;
  partnerName: string | null;
}

export const LEVEL_LABELS: Record<FormationLevel, string> = {
  DEBUTANT: "Débutant",
  INTERMEDIAIRE: "Intermédiaire",
  AVANCE: "Avancé",
};

export const FORMAT_LABELS: Record<FormationFormat, string> = {
  PRESENTIEL: "Présentiel · Dakar",
  EN_LIGNE: "En ligne",
  HYBRIDE: "Hybride",
};
