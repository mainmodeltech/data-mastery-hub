

// src/types/index.ts

// ... (types existants)

// --- Promo Codes ---
export interface PromoCode {
    id: string;
    code: string;
    description: string | null;

    // Parrain
    referrerName: string;
    referrerEmail: string | null;
    referrerPhone: string | null;

    // Réduction
    discountPercent: number;

    // Limites
    maxUses: number | null;
    usageCount: number;
    expiresAt: string | null;

    // État
    isActive: boolean;

    // Audit (BaseEntity)
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    isDeleted: boolean;
    deletedAt: string | null;
    deletedBy: string | null;
}

// DTOs pour la création et modification
export type CreatePromoCodeDTO = Omit<
    PromoCode,
    'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted' | 'deletedAt' | 'deletedBy' | 'usageCount'
>;

export type UpdatePromoCodeDTO = Partial<CreatePromoCodeDTO>;
