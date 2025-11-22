import { apiClient } from '../api-client';
import {
  Contract,
  CreateContractRequest,
  UpdateContractRequest,
} from '@/types/contract';

export const contractsApi = {
  create: async (data: CreateContractRequest): Promise<Contract> => {
    const response = await apiClient.post('/contracts', data);
    return response.data;
  },

  getMyContracts: async (): Promise<Contract[]> => {
    const response = await apiClient.get('/contracts/my-contracts');
    return response.data;
  },

  getLandlordContracts: async (): Promise<Contract[]> => {
    const response = await apiClient.get('/contracts/landlord-contracts');
    return response.data;
  },

  getTenantContracts: async (): Promise<Contract[]> => {
    const response = await apiClient.get('/contracts/tenant-contracts');
    return response.data;
  },

  getById: async (id: string): Promise<Contract> => {
    const response = await apiClient.get(`/contracts/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateContractRequest): Promise<Contract> => {
    const response = await apiClient.patch(`/contracts/${id}`, data);
    return response.data;
  },

  sign: async (id: string, signatureData: any): Promise<Contract> => {
    const response = await apiClient.post(`/contracts/${id}/sign`, signatureData);
    return response.data;
  },

  activate: async (id: string): Promise<Contract> => {
    const response = await apiClient.post(`/contracts/${id}/activate`);
    return response.data;
  },

  terminate: async (id: string, reason?: string): Promise<Contract> => {
    const response = await apiClient.post(`/contracts/${id}/terminate`, { reason });
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/contracts/${id}`);
    return response.data;
  },
};
