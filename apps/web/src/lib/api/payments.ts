import { apiClient } from '../api-client';
import {
  Payment,
  CreatePaymentRequest,
} from '@/types/payment';

export const paymentsApi = {
  create: async (data: CreatePaymentRequest): Promise<Payment & { clientSecret?: string }> => {
    const response = await apiClient.post('/payments', data);
    return response.data;
  },

  getMyPayments: async (): Promise<Payment[]> => {
    const response = await apiClient.get('/payments/my-payments');
    return response.data;
  },

  getByContract: async (contractId: string): Promise<Payment[]> => {
    const response = await apiClient.get(`/payments/contract/${contractId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Payment> => {
    const response = await apiClient.get(`/payments/${id}`);
    return response.data;
  },
};
