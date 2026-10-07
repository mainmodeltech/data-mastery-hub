/**
 * catalogAdmin.type.ts — administration du catalogue (domaines, partenaires).
 * Contrat : modeltech-backend AdminDomainController (/admin/domains) et
 * AdminPartnerController (/admin/partners), réponses enveloppées dans ApiResponse.
 */

export interface AdminDomain {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  badge: string | null;
  comingSoon: boolean;
  visible: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DomainPayload {
  slug?: string;
  name: string;
  description?: string;
  badge?: string;
  comingSoon: boolean;
  visible: boolean;
  displayOrder: number;
}

export interface AdminPartner {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  bio: string | null;
  website: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  revenueSharePercent: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerPayload {
  slug?: string;
  name: string;
  bio?: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  revenueSharePercent?: number | null;
  active: boolean;
}
