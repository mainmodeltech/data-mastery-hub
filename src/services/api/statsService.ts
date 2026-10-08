import { httpClient } from "@/services/httpClient";
import type { AdminActions, StatsOverview } from "@/types/stats.type";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const statsService = {
  actions: async (): Promise<AdminActions> =>
    (await httpClient.get<ApiResponse<AdminActions>>("/admin/stats/actions")).data,

  overview: async (from: string, to: string): Promise<StatsOverview> =>
    (await httpClient.get<ApiResponse<StatsOverview>>("/admin/stats/overview", { params: { from, to } })).data,
};
