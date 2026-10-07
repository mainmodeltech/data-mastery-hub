/**
 * formationService.ts
 * Service PUBLIC pour le catalogue de formations (formations, domaines, partenaires).
 *
 * Le backend expose ces endpoints : en production, une erreur est propagée (la page affiche
 * un message) au lieu de montrer des formations fictives. Seuls les builds de développement
 * (ou VITE_ENABLE_DEMO_DATA=true) retombent sur src/config/mockFormationsCatalog.ts.
 */
import { httpClient } from "./httpClient";
import { DEMO_ALLOWED } from "./demoFallback";
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
    } catch (e) {
      if (!DEMO_ALLOWED) throw e;
      return MOCK_FORMATIONS;
    }
  },

  getBySlug: async (slug: string): Promise<Formation | undefined> => {
    try {
      return await httpClient.get<Formation>(`/formations/slug/${slug}`, { skipAuth: true });
    } catch (e) {
      if (!DEMO_ALLOWED) throw e;
      return getFormationBySlug(slug);
    }
  },

  listDomains: async (): Promise<Domain[]> => {
    try {
      return await httpClient.get<Domain[]>("/domains", { skipAuth: true });
    } catch (e) {
      if (!DEMO_ALLOWED) throw e;
      return MOCK_DOMAINS;
    }
  },

  listPartners: async (): Promise<Partner[]> => {
    try {
      return await httpClient.get<Partner[]>("/partners", { skipAuth: true });
    } catch (e) {
      if (!DEMO_ALLOWED) throw e;
      return MOCK_PARTNERS;
    }
  },

  /** Sessions de toutes les formations, à plat, triées par date — pour la vue calendrier. */
  listAllSessions: async (): Promise<FlatSession[]> => {
    try {
      return await httpClient.get<FlatSession[]>("/formations/sessions", { skipAuth: true });
    } catch (e) {
      if (!DEMO_ALLOWED) throw e;
      return flattenSessions(MOCK_FORMATIONS);
    }
  },
};
