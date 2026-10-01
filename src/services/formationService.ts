/**
 * formationService.ts
 * Service PUBLIC pour le catalogue de formations (Lot 1).
 *
 * Les endpoints `/formations`, `/domains`, `/partners` et les champs
 * domain/partner/deliveredBy/level/format n'existent pas encore côté backend
 * (voir docs/design/README.md §3-§4 — dépend de la branche back
 * `feature/domain-partner-model`). Chaque méthode tente l'API réelle puis
 * retombe sur les données de démonstration (src/config/mockFormationsCatalog.ts)
 * en cas d'échec, pour que le catalogue reste navigable pendant la transition.
 */
import { httpClient } from "./httpClient";
import type { Domain, Partner, Formation, FlatSession } from "@/types/formation.type";
import {
  MOCK_DOMAINS,
  MOCK_PARTNERS,
  MOCK_FORMATIONS,
  getFormationBySlug,
} from "@/config/mockFormationsCatalog";

function flattenSessions(formations: Formation[]): FlatSession[] {
  return formations
    .flatMap((f) =>
      (f.sessions ?? (f.nextSession ? [f.nextSession] : [])).map((s) => ({
        ...s,
        formationId: f.id,
        formationSlug: f.slug,
        formationTitle: f.title,
        domainName: f.domain.name,
        deliveredBy: f.deliveredBy,
        partnerName: f.partner?.name ?? null,
      }))
    )
    .sort((a, b) => (a.startDate ?? "").localeCompare(b.startDate ?? ""));
}

export const formationService = {
  list: async (): Promise<Formation[]> => {
    try {
      return await httpClient.get<Formation[]>("/formations", { skipAuth: true });
    } catch {
      return MOCK_FORMATIONS;
    }
  },

  getBySlug: async (slug: string): Promise<Formation | undefined> => {
    try {
      return await httpClient.get<Formation>(`/formations/slug/${slug}`, { skipAuth: true });
    } catch {
      return getFormationBySlug(slug);
    }
  },

  listDomains: async (): Promise<Domain[]> => {
    try {
      return await httpClient.get<Domain[]>("/domains", { skipAuth: true });
    } catch {
      return MOCK_DOMAINS;
    }
  },

  listPartners: async (): Promise<Partner[]> => {
    try {
      return await httpClient.get<Partner[]>("/partners", { skipAuth: true });
    } catch {
      return MOCK_PARTNERS;
    }
  },

  /** Sessions de toutes les formations, à plat, triées par date — pour la vue calendrier. */
  listAllSessions: async (): Promise<FlatSession[]> => {
    try {
      return await httpClient.get<FlatSession[]>("/formations/sessions", { skipAuth: true });
    } catch {
      return flattenSessions(MOCK_FORMATIONS);
    }
  },
};
