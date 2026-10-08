/**
 * stats.type.ts — tableau de bord d'administration (SUPER_ADMIN et ADMIN uniquement).
 * Contrat : api-contract.md §3.D nonies, enveloppe ApiResponse<T>.
 *   GET /admin/stats/actions                         -> AdminActions (pastilles du menu, léger)
 *   GET /admin/stats/overview?from=&to= (YYYY-MM-DD) -> StatsOverview ; défaut 30 jours,
 *        400 si from > to ou plus de 366 jours
 * Montants en XOF, entiers non arrondis par le serveur ; taux en % ou null.
 */

export interface AdminActions {
  newApplications: number;
  paymentsToConfirm: number;
  overdueInstallments: number;
  unreadMessages: number;
  openQuestions: number;
  projectsToReview: number;
  upcomingLives: number;
  failedEmails: number;
}

export interface StatsFunnel {
  submitted: number;
  accepted: number;
  paid: number;
  acceptanceRate: number | null;
  paymentRate: number | null;
  conversionRate: number | null;
}

export interface StatsRevenue {
  collected: number;
  refunded: number;
  net: number;
  /** Reste à encaisser, toutes périodes */
  outstanding: number;
  /** Part de `outstanding` dont l'échéance est dépassée, toutes périodes */
  overdue: number;
  averagePayment: number | null;
  collectedByMethod: Record<string, number>;
}

export interface MonthlyPoint {
  /** yyyy-MM */
  month: string;
  registrations: number;
  collected: number;
}

export interface SessionFill {
  sessionId: string;
  sessionName: string | null;
  formationTitle: string | null;
  startDate: string | null;
  status: string;
  capacity: number;
  confirmed: number;
  pending: number;
  /** % ou null si la capacité est inconnue */
  fillRate: number | null;
}

export interface FormationStat {
  formationId: string;
  title: string;
  registrations: number;
  paid: number;
  collected: number;
}

export interface StatsOverview {
  from: string;
  to: string;
  currency: string;
  registrations: { total: number; byStatus: Record<string, number> };
  funnel: StatsFunnel;
  revenue: StatsRevenue;
  monthly: MonthlyPoint[];
  sessions: SessionFill[];
  topFormations: FormationStat[];
  breakdowns: {
    bySource: Record<string, number>;
    byProfile: Record<string, number>;
    byCountry: Record<string, number>;
    byPromoCode: Record<string, number>;
  };
  learners: {
    total: number;
    newInPeriod: number;
    activeEnrollments: number;
    certificatesIssued: number;
    certificatesTotal: number;
  };
  audience: {
    newsletterSubscribers: number;
    newsletterNewInPeriod: number;
    contactMessagesByType: Record<string, number>;
  };
}

/** Durée maximale acceptée par le serveur (au-delà : 400) */
export const MAX_PERIOD_DAYS = 366;

/** Taux en % ; null (pas de données) → « — » */
export function formatRate(rate: number | null | undefined): string {
  if (rate == null) return "—";
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(rate)} %`;
}
