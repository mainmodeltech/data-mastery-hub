/**
 * simulatorAdminService.ts — banque de questions du simulateur (administration).
 * Contrat : AdminSimulatorController. Les droits sont vérifiés par le serveur (SIMULATOR_VIEW / AUTHOR / REVIEW / MANAGE).
 */
import { httpClient } from "@/services/httpClient";
import type { AdminOrder, AdminPlan, GatewayStatus, OrderStatus, PlanUpdate } from "@/types/simulatorShop.type";
import type {
  CoverageRow, GrantRequest, GrantView, ImportResult, ItemFilters, ItemRequest, ItemSummary, ItemVersion, SimBlueprint,
} from "@/types/simulator.type";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: { page: number; size: number; totalElements: number; totalPages: number };
}

export interface ItemsPage { items: ItemSummary[]; totalElements: number; totalPages: number }

const base = "/admin/simulator";
const item = (code: string, version: number) => `${base}/items/${encodeURIComponent(code)}/versions/${version}`;

export const simulatorAdminService = {
  blueprint: async (): Promise<SimBlueprint> => (await httpClient.get<ApiResponse<SimBlueprint>>(`${base}/blueprint`)).data,

  coverage: async (): Promise<CoverageRow[]> => (await httpClient.get<ApiResponse<CoverageRow[]>>(`${base}/coverage`)).data ?? [],

  search: async (filters: ItemFilters, page: number, size = 20): Promise<ItemsPage> => {
    const res = await httpClient.get<ApiResponse<ItemSummary[]>>(`${base}/items`, { params: { ...filters, page, size } });
    return {
      items: res.data ?? [],
      totalElements: res.pagination?.totalElements ?? res.data?.length ?? 0,
      totalPages: res.pagination?.totalPages ?? 1,
    };
  },

  get: async (code: string, version?: number): Promise<ItemVersion> =>
    (await httpClient.get<ApiResponse<ItemVersion>>(`${base}/items/${encodeURIComponent(code)}`, { params: { version } })).data,

  create: async (body: ItemRequest): Promise<ItemVersion> => (await httpClient.post<ApiResponse<ItemVersion>>(`${base}/items`, body)).data,

  update: async (code: string, version: number, body: ItemRequest): Promise<ItemVersion> =>
    (await httpClient.put<ApiResponse<ItemVersion>>(item(code, version), body)).data,

  newVersion: async (code: string): Promise<ItemVersion> =>
    (await httpClient.post<ApiResponse<ItemVersion>>(`${base}/items/${encodeURIComponent(code)}/versions`)).data,

  submit: async (code: string, version: number): Promise<ItemVersion> =>
    (await httpClient.post<ApiResponse<ItemVersion>>(`${item(code, version)}/submit`)).data,

  review: async (code: string, version: number, body: { approve: boolean; verified: boolean; note?: string }): Promise<ItemVersion> =>
    (await httpClient.post<ApiResponse<ItemVersion>>(`${item(code, version)}/review`, body)).data,

  publish: async (code: string, version: number): Promise<ItemVersion> =>
    (await httpClient.post<ApiResponse<ItemVersion>>(`${item(code, version)}/publish`)).data,

  retire: async (code: string, version: number, reason: string): Promise<ItemVersion> =>
    (await httpClient.post<ApiResponse<ItemVersion>>(`${item(code, version)}/retire`, { reason })).data,

  setTrialSample: async (code: string, value: boolean): Promise<ItemVersion> =>
    (await httpClient.put<ApiResponse<ItemVersion>>(`${base}/items/${encodeURIComponent(code)}/trial-sample`, { value })).data,

  deleteDraft: async (code: string, version: number): Promise<void> => {
    await httpClient.delete<unknown>(item(code, version));
  },

  importItems: async (items: ItemRequest[]): Promise<ImportResult> =>
    (await httpClient.post<ApiResponse<ImportResult>>(`${base}/items/import`, { items })).data,

  grants: async (page: number, size = 20): Promise<{ items: GrantView[]; totalElements: number; totalPages: number }> => {
    const res = await httpClient.get<ApiResponse<GrantView[]>>(`${base}/grants`, { params: { page, size } });
    return {
      items: res.data ?? [],
      totalElements: res.pagination?.totalElements ?? res.data?.length ?? 0,
      totalPages: res.pagination?.totalPages ?? 1,
    };
  },

  plans: async (): Promise<AdminPlan[]> => (await httpClient.get<ApiResponse<AdminPlan[]>>(`${base}/plans`)).data ?? [],

  updatePlan: async (code: string, body: PlanUpdate): Promise<AdminPlan> =>
    (await httpClient.put<ApiResponse<AdminPlan>>(`${base}/plans/${encodeURIComponent(code)}`, body)).data,

  orders: async (status: OrderStatus | undefined, page: number, size = 20): Promise<{ items: AdminOrder[]; totalElements: number; totalPages: number }> => {
    const res = await httpClient.get<ApiResponse<AdminOrder[]>>(`${base}/orders`, { params: { status, page, size } });
    return { items: res.data ?? [], totalElements: res.pagination?.totalElements ?? res.data?.length ?? 0, totalPages: res.pagination?.totalPages ?? 1 };
  },

  verifyOrder: async (id: string): Promise<AdminOrder> => (await httpClient.post<ApiResponse<AdminOrder>>(`${base}/orders/${id}/verify`)).data,

  confirmOrder: async (id: string): Promise<AdminOrder> => (await httpClient.post<ApiResponse<AdminOrder>>(`${base}/orders/${id}/confirm`)).data,

  rejectOrder: async (id: string, reason: string): Promise<AdminOrder> =>
    (await httpClient.post<ApiResponse<AdminOrder>>(`${base}/orders/${id}/reject`, { reason })).data,

  /** Lien signé et temporaire vers le justificatif joint par l'acheteur. */
  orderProof: async (id: string): Promise<string> => (await httpClient.get<ApiResponse<{ url: string }>>(`${base}/orders/${id}/proof`)).data.url,

  gatewayStatus: async (): Promise<GatewayStatus> => (await httpClient.get<ApiResponse<GatewayStatus>>(`${base}/payments/status`)).data,

  grant: async (body: GrantRequest): Promise<GrantView> => (await httpClient.post<ApiResponse<GrantView>>(`${base}/grants`, body)).data,

  revokeGrant: async (id: string, reason: string): Promise<GrantView> =>
    (await httpClient.post<ApiResponse<GrantView>>(`${base}/grants/${id}/revoke`, { reason })).data,
};
