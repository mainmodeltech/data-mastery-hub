/**
 * certificate.type.ts — certificats de fin de formation.
 * Contrat : api-contract.md §3.D sexies.
 *   GET /certificates/{publicId}      (public, ApiResponse) -> PublicCertificate ; 404 inconnu
 *   GET /certificates/{publicId}/pdf  (public, PDF)         ; 410 si révoqué
 *   GET /learner/certificates         (JSON brut)           -> LearnerCertificate[]
 */

export type CertificateStatus = "VALID" | "REVOKED";

export interface PublicCertificate {
  publicId: string;
  status: CertificateStatus;
  recipientName: string;
  formationTitle: string;
  durationLabel: string | null;
  skills: string[];
  includesProject: boolean;
  issuedAt: string;
  issuer: string;
  signatoryName: string | null;
  signatoryTitle: string | null;
  revokedAt: string | null;
}

export interface LearnerCertificate {
  publicId: string;
  formationId: string;
  formationTitle: string;
  issuedAt: string;
  status: CertificateStatus;
  /** Lien public de vérification fourni par l'API */
  verifyUrl: string;
  pdfPath: string;
  /** Lien « Ajouter à mon profil LinkedIn » fourni par l'API */
  linkedInUrl: string | null;
}
