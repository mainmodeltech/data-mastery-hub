/**
 * cohorts — logique pure du catalogue : quelles cohortes sont réellement ouvertes aux candidatures, combien de places restent, quel tarif
 * s'applique aujourd'hui. Sans dépendance (testée par tests/unit/cohorts.test.ts).
 *
 * On part de la liste des sessions, pas de `formation.nextSession` : ce champ peut désigner une cohorte déjà démarrée, qu'on ne doit
 * surtout pas proposer à un visiteur prêt à candidater.
 */

export interface CohortLike {
  id: string;
  formationId: string;
  startDate: string | null;
  registrationDeadline: string | null;
  maxParticipants: number;
  currentParticipants: number;
  isFull: boolean;
  spotsRemaining: number | null;
  status: string;
  price: string | null;
  earlyBirdPrice: string | null;
  earlyBirdDeadline: string | null;
}

/** Date du jour au format ISO court (celle que comparent les dates de l'API). */
export const todayIso = (now: Date = new Date()): string => now.toISOString().slice(0, 10);

export function spotsLeft(s: Pick<CohortLike, "spotsRemaining" | "maxParticipants" | "currentParticipants">): number {
  return Math.max(0, s.spotsRemaining ?? s.maxParticipants - s.currentParticipants);
}

/** Une cohorte est ouverte si elle accepte des candidatures : statut ouvert ou à venir, des places, une date limite non dépassée. */
export function isOpenCohort(s: CohortLike, today: string): boolean {
  if (s.status !== "OPEN" && s.status !== "UPCOMING") return false;
  if (s.isFull || spotsLeft(s) === 0) return false;
  const limit = s.registrationDeadline ?? s.startDate;
  return limit === null || limit >= today;
}

/** Les cohortes ouvertes, de la plus proche à la plus lointaine (sans date : à la fin). */
export function openCohorts<T extends CohortLike>(sessions: T[], today: string): T[] {
  return sessions
    .filter((s) => isOpenCohort(s, today))
    .sort((a, b) => (a.startDate ?? "9999").localeCompare(b.startDate ?? "9999"));
}

/** La prochaine cohorte ouverte de chaque formation (clé : id de la formation). */
export function nextOpenByFormation<T extends CohortLike>(sessions: T[], today: string): Map<string, T> {
  const map = new Map<string, T>();
  for (const s of openCohorts(sessions, today)) if (!map.has(s.formationId)) map.set(s.formationId, s);
  return map;
}

/** Taux de remplissage entre 0 et 1. */
export function fillRate(s: Pick<CohortLike, "maxParticipants" | "currentParticipants">): number {
  if (s.maxParticipants <= 0) return 0;
  return Math.min(1, Math.max(0, s.currentParticipants / s.maxParticipants));
}

/** « Plus que N places » : seulement quand c'est vrai et que c'est peu. */
export const SCARCE_AT = 5;
export const isScarce = (s: Pick<CohortLike, "spotsRemaining" | "maxParticipants" | "currentParticipants">): boolean => {
  const n = spotsLeft(s);
  return n > 0 && n <= SCARCE_AT;
};

export interface CohortPrice {
  /** Prix à afficher aujourd'hui. */
  price: string | null;
  /** Prix normal, quand un tarif early-bird est en cours. */
  regular: string | null;
  /** Date limite du tarif early-bird en cours. */
  until: string | null;
}

/** Le tarif early-bird ne compte que tant que sa date limite n'est pas passée. */
export function cohortPrice(
  s: Pick<CohortLike, "price" | "earlyBirdPrice" | "earlyBirdDeadline">,
  today: string,
  fallback: string | null = null,
): CohortPrice {
  const base = s.price ?? fallback;
  if (s.earlyBirdPrice && s.earlyBirdDeadline && s.earlyBirdDeadline >= today) {
    return { price: s.earlyBirdPrice, regular: base, until: s.earlyBirdDeadline };
  }
  return { price: base, regular: null, until: null };
}

export const pluralSpots = (n: number): string => (n === 1 ? "1 place restante" : `${n} places restantes`);

export const spotsLabel = (n: number): string => (n === 1 ? "1 place" : `${n} places`);
