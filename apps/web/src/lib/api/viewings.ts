import { apiClient } from '../api-client';
import {
  Viewing,
  CreateViewingRequest,
  UpdateViewingRequest
} from '@/types/viewing';

export const viewingsApi = {
  create: async (data: CreateViewingRequest): Promise<Viewing> => {
    const response = await apiClient.post('/viewings', data);
    return response.data;
  },

  getUserViewings: async (): Promise<Viewing[]> => {
    const response = await apiClient.get('/viewings/my-viewings');
    return response.data;
  },

  getLandlordViewings: async (): Promise<Viewing[]> => {
    const response = await apiClient.get('/viewings/landlord-viewings');
    return response.data;
  },

  getPropertyViewings: async (propertyId: string): Promise<Viewing[]> => {
    const response = await apiClient.get(`/viewings/property/${propertyId}`);
    return response.data;
  },

  update: async (id: string, data: UpdateViewingRequest): Promise<Viewing> => {
    const response = await apiClient.patch(`/viewings/${id}`, data);
    return response.data;
  },

  cancel: async (id: string): Promise<Viewing> => {
    const response = await apiClient.post(`/viewings/${id}/cancel`);
    return response.data;
  },
};
