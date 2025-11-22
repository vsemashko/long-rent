import { apiClient } from '../api-client';
import {
  Application,
  CreateApplicationRequest,
  UpdateApplicationRequest,
} from '@/types/application';

export const applicationsApi = {
  create: async (data: CreateApplicationRequest): Promise<Application> => {
    const response = await apiClient.post('/applications', data);
    return response.data;
  },

  getMyApplications: async (): Promise<Application[]> => {
    const response = await apiClient.get('/applications/my-applications');
    return response.data;
  },

  getLandlordApplications: async (): Promise<Application[]> => {
    const response = await apiClient.get('/applications/landlord-applications');
    return response.data;
  },

  getPropertyApplications: async (propertyId: string): Promise<Application[]> => {
    const response = await apiClient.get(`/applications/property/${propertyId}`);
    return response.data;
  },

  getApplicationCount: async (propertyId: string): Promise<{ count: number }> => {
    const response = await apiClient.get(`/applications/property/${propertyId}/count`);
    return response.data;
  },

  update: async (id: string, data: UpdateApplicationRequest): Promise<Application> => {
    const response = await apiClient.patch(`/applications/${id}`, data);
    return response.data;
  },

  withdraw: async (id: string): Promise<Application> => {
    const response = await apiClient.post(`/applications/${id}/withdraw`);
    return response.data;
  },
};
