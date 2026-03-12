/**
 * Service API pour les Messages de contact.
 * Compatible avec ApiResponse<T> du backend Spring Boot.
 */

import { httpClient } from '@/services/httpClient';
import type {
  ContactMessage,
  ContactMessageStatus,
  CreateContactMessageDTO,
  ApiResponse, ContactMessagesPage
} from '@/types';

const BASE_PATH  = '/contact-messages';
const ADMIN_PATH = '/admin/contact-messages';

// ─── Service ──────────────────────────────────────────────────────────────────

export const contactService = {
  /** Envoyer un message de contact (public — pas d'auth) */
  send: async (data: CreateContactMessageDTO): Promise<ContactMessage> => {
    const res = await httpClient.post<ApiResponse<ContactMessage>>(
        BASE_PATH,
        data,
        { skipAuth: true },
    );
    return res.data;
  },

  /**
   * Récupérer tous les messages (admin) — réponse paginée.
   * Retourne { items, pagination } pour que le hook soit simple à consommer.
   */
  getAll: async (page = 0, size = 50): Promise<ContactMessagesPage> => {
    const res = await httpClient.get<ApiResponse<ContactMessage[]>>(ADMIN_PATH, {
      params: { page, size },
    });
    return {
      items: res.data ?? [],
      pagination: res.pagination ?? {
        page,
        size,
        totalElements: res.data?.length ?? 0,
        totalPages: 1,
      },
    };
  },

  /** Récupérer un message par ID */
  getById: async (id: string): Promise<ContactMessage> => {
    const res = await httpClient.get<ApiResponse<ContactMessage>>(`${ADMIN_PATH}/${id}`);
    return res.data;
  },

  /** Changer le statut d'un message */
  updateStatus: async (id: string, status: ContactMessageStatus): Promise<ContactMessage> => {
    const res = await httpClient.put<ApiResponse<ContactMessage>>(
        `${ADMIN_PATH}/${id}/status`,
        null,
        { params: { status } },
    );
    return res.data;
  },

  /** Supprimer un message (soft-delete) */
  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`${ADMIN_PATH}/${id}`);
  },
};
