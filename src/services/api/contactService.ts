/**
 * Service API pour les Messages de contact.
 */

import { httpClient } from '@/services/httpClient';
import type {
  ContactMessage,
  ContactMessageStatus,
  CreateContactMessageDTO,
  PaginatedResponse,
} from '@/types';

const BASE_PATH = '/contact-messages';
const ADMIN_PATH = '/admin/contact-messages';

export const contactService = {
  /** Envoyer un message de contact (public - pas besoin d'auth) */
  send: (data: CreateContactMessageDTO) =>
    httpClient.post<ContactMessage>(BASE_PATH, data, { skipAuth: true }),

  /** Recuperer tous les messages (admin) */
  getAll: (page?: number, size?: number, status?: ContactMessageStatus) =>
    httpClient.get<PaginatedResponse<ContactMessage>>(ADMIN_PATH, {
      params: { page, size, status },
    }),

  /** Recuperer un message par ID (admin) */
  getById: (id: string) =>
    httpClient.get<ContactMessage>(`${ADMIN_PATH}/${id}`),

  /** Mettre a jour le statut d'un message (admin) */
  updateStatus: (id: string, status: ContactMessageStatus, notes?: string) =>
    httpClient.patch<ContactMessage>(`${ADMIN_PATH}/${id}/status`, { status, notes }),

  /** Supprimer un message (admin) */
  delete: (id: string) =>
    httpClient.delete<void>(`${ADMIN_PATH}/${id}`),
};
