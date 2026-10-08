/**
 * certificateService.ts — vérification publique et certificats de l'apprenant.
 * La vérification est enveloppée dans ApiResponse<T> ; /learner/certificates est en JSON brut.
 */
import { httpClient } from "@/services/httpClient";
import type { LearnerCertificate, PublicCertificate } from "@/types/certificate.type";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const certificateService = {
  verify: async (publicId: string): Promise<PublicCertificate> =>
    (await httpClient.get<ApiResponse<PublicCertificate>>(`/certificates/${encodeURIComponent(publicId)}`, { skipAuth: true })).data,

  /** PDF public ; 410 si le certificat est révoqué */
  downloadPdf: (publicId: string): Promise<Blob> =>
    httpClient.getBlob(`/certificates/${encodeURIComponent(publicId)}/pdf`, { skipAuth: true }),

  listMine: async (): Promise<LearnerCertificate[]> =>
    (await httpClient.get<LearnerCertificate[]>("/learner/certificates")) ?? [],
};
