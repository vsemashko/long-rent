import { apiClient } from '../api-client';
import {
  MaintenanceIssue,
  CreateIssueRequest,
  UpdateIssueRequest,
  IssueStats,
} from '@/types/maintenance';

export const maintenanceApi = {
  createIssue: async (data: CreateIssueRequest): Promise<MaintenanceIssue> => {
    const response = await apiClient.post('/maintenance/issues', data);
    return response.data;
  },

  getMyIssues: async (): Promise<MaintenanceIssue[]> => {
    const response = await apiClient.get('/maintenance/issues/my-issues');
    return response.data;
  },

  getLandlordIssues: async (): Promise<MaintenanceIssue[]> => {
    const response = await apiClient.get('/maintenance/issues/landlord-issues');
    return response.data;
  },

  getIssuesByProperty: async (propertyId: string): Promise<MaintenanceIssue[]> => {
    const response = await apiClient.get(`/maintenance/issues/property/${propertyId}`);
    return response.data;
  },

  getIssueStats: async (propertyId?: string): Promise<IssueStats> => {
    const params = propertyId ? { propertyId } : {};
    const response = await apiClient.get('/maintenance/issues/stats', { params });
    return response.data;
  },

  getById: async (id: string): Promise<MaintenanceIssue> => {
    const response = await apiClient.get(`/maintenance/issues/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateIssueRequest): Promise<MaintenanceIssue> => {
    const response = await apiClient.patch(`/maintenance/issues/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/maintenance/issues/${id}`);
    return response.data;
  },
};
