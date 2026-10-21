import { httpClient } from "@/services/httpClient";
import type {
  ApproveProposalBody, ProposableFormation, ProposalBody, ProposalDetail, ProposalPayload, ProposalStatus, ProposalSummary,
} from "@/types/proposal.type";

const MINE = "/admin/program-proposals/mine";
const BASE = "/admin/program-proposals";

export const proposalService = {
  // Formateur
  myFormations: () => httpClient.get<ProposableFormation[]>(`${MINE}/formations`),
  mine: (formationId: string) => httpClient.get<ProposalPayload>(`${MINE}/${formationId}`),
  save: (formationId: string, body: ProposalBody) => httpClient.put<ProposalPayload>(`${MINE}/${formationId}`, body),
  submit: (formationId: string) => httpClient.post<ProposalPayload>(`${MINE}/${formationId}/submit`),
  withdraw: (formationId: string) => httpClient.post<ProposalPayload>(`${MINE}/${formationId}/withdraw`),

  // Pédagogie
  list: (status?: ProposalStatus) => httpClient.get<ProposalSummary[]>(BASE, { params: { status } }),
  pendingCount: () => httpClient.get<{ count: number }>(`${BASE}/pending-count`),
  detail: (id: string) => httpClient.get<ProposalDetail>(`${BASE}/${id}`),
  approve: (id: string, body: ApproveProposalBody) => httpClient.post<ProposalPayload>(`${BASE}/${id}/approve`, body),
  requestChanges: (id: string, comment: string) => httpClient.post<ProposalPayload>(`${BASE}/${id}/request-changes`, { comment }),
  reject: (id: string, comment: string) => httpClient.post<ProposalPayload>(`${BASE}/${id}/reject`, { comment }),
};
