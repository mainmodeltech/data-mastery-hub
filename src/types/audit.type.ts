/**
 * audit.type.ts — journal d'audit (droit « Consulter le journal d'audit »), lecture seule.
 *   GET /admin/audit?action=&category=&actor=&flag=&q=&from=&to=&page=&size=  -> lignes, de la plus récente à la plus ancienne
 *   GET /admin/audit/catalogue                                                 -> valeurs des filtres
 */

export interface AuditEntry {
  id: string;
  occurredAt: string;
  actorEmail: string;
  actorName: string | null;
  /** Profils de la personne au moment de l'action (ex. « FINANCE, ADMISSIONS »). */
  actorProfiles: string | null;
  action: string;
  actionLabel: string;
  category: string;
  entityType: string | null;
  entityId: string | null;
  summary: string;
  details: Record<string, unknown> | null;
  /** NO_SECOND_CHECK (sans second contrôle), OVERRIDE (dérogation) ou absent. */
  flag: string | null;
  flagLabel: string | null;
  ip: string | null;
}

export interface AuditActionInfo {
  code: string;
  label: string;
  category: string;
}

export interface AuditCatalogue {
  actions: AuditActionInfo[];
  categories: string[];
  flags: AuditActionInfo[];
}

export interface AuditFilters {
  category?: string;
  action?: string;
  actor?: string;
  /** Une valeur de drapeau, ou « ANY » pour tout ce qui est signalé. */
  flag?: string;
  q?: string;
  from?: string;
  to?: string;
}
