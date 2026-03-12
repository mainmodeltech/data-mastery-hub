// src/services/testimonialService.ts

import { httpClient } from '@/services/httpClient';
import type { Testimonial, TestimonialRequest } from '@/types/testimonial.types';

const ADMIN_PATH  = '/admin/testimonials';
const PUBLIC_PATH = '/testimonials';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const testimonialService = {
  /** Témoignages publiés — endpoint public, pas d'auth */
  getPublished: async (): Promise<Testimonial[]> => {
    const res = await httpClient.get<ApiResponse<Testimonial[]>>(
        `${PUBLIC_PATH}/published`,
        { skipAuth: true } as never,
    );
    return res.data ?? [];
  },

  getAll: async (): Promise<Testimonial[]> => {
    const res = await httpClient.get<ApiResponse<Testimonial[]>>(ADMIN_PATH);
    return res.data ?? [];
  },

  create: async (payload: TestimonialRequest): Promise<Testimonial> => {
    const res = await httpClient.post<ApiResponse<Testimonial>>(ADMIN_PATH, payload);
    return res.data;
  },

  update: async (id: string, payload: TestimonialRequest): Promise<Testimonial> => {
    const res = await httpClient.put<ApiResponse<Testimonial>>(`${ADMIN_PATH}/${id}`, payload);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`${ADMIN_PATH}/${id}`);
  },

  togglePublished: async (id: string): Promise<Testimonial> => {
    const res = await httpClient.patch<ApiResponse<Testimonial>>(`${ADMIN_PATH}/${id}/toggle-published`);
    return res.data;
  },
};
