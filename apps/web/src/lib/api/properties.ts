import { apiClient } from '../api-client';
import type {
  Property,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  PropertySearchFilters,
  PropertySearchResponse,
} from '@/types/property';

export const propertiesApi = {
  // Create property
  create: async (data: CreatePropertyRequest): Promise<Property> => {
    const response = await apiClient.post<Property>('/properties', data);
    return response.data;
  },

  // Get all properties (with search/filters)
  search: async (filters: PropertySearchFilters = {}): Promise<PropertySearchResponse> => {
    const response = await apiClient.get<PropertySearchResponse>('/properties', {
      params: filters,
    });
    return response.data;
  },

  // Get property by ID
  getById: async (id: string): Promise<Property> => {
    const response = await apiClient.get<Property>(`/properties/${id}`);
    return response.data;
  },

  // Update property
  update: async (id: string, data: UpdatePropertyRequest): Promise<Property> => {
    const response = await apiClient.patch<Property>(`/properties/${id}`, data);
    return response.data;
  },

  // Delete property
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/properties/${id}`);
  },

  // Get user's properties (landlord)
  getMyProperties: async (): Promise<Property[]> => {
    const response = await apiClient.get<Property[]>('/properties/my-properties');
    return response.data;
  },

  // Toggle favorite
  toggleFavorite: async (id: string): Promise<{ isFavorite: boolean }> => {
    const response = await apiClient.post<{ isFavorite: boolean }>(`/properties/${id}/favorite`);
    return response.data;
  },

  // Get user favorites
  getFavorites: async (): Promise<Property[]> => {
    const response = await apiClient.get<Property[]>('/properties/favorites');
    return response.data;
  },

  // Upload property photo
  uploadPhoto: async (propertyId: string, file: File, caption?: string): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) {
      formData.append('caption', caption);
    }

    await apiClient.post(`/properties/${propertyId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete property photo
  deletePhoto: async (propertyId: string, photoId: string): Promise<void> => {
    await apiClient.delete(`/properties/${propertyId}/photos/${photoId}`);
  },

  // Reorder photos
  reorderPhotos: async (
    propertyId: string,
    photos: { id: string; order: number }[]
  ): Promise<void> => {
    await apiClient.patch(`/properties/${propertyId}/photos/reorder`, { photos });
  },

  // Update property status
  updateStatus: async (propertyId: string, status: string): Promise<Property> => {
    const response = await apiClient.patch<Property>(`/properties/${propertyId}/status`, {
      status,
    });
    return response.data;
  },
};
