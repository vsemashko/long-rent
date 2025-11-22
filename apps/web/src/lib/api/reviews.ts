import { apiClient } from '../api-client';
import {
  Review,
  CreateReviewRequest,
  UpdateReviewRequest,
  UserRatingStats,
  PendingReview,
} from '@/types/review';

export const reviewsApi = {
  create: async (data: CreateReviewRequest): Promise<Review> => {
    const response = await apiClient.post('/reviews', data);
    return response.data;
  },

  getMyReviews: async (): Promise<Review[]> => {
    const response = await apiClient.get('/reviews/my-reviews');
    return response.data;
  },

  getReviewsAboutMe: async (): Promise<Review[]> => {
    const response = await apiClient.get('/reviews/about-me');
    return response.data;
  },

  getPendingReviews: async (): Promise<PendingReview[]> => {
    const response = await apiClient.get('/reviews/pending');
    return response.data;
  },

  getReviewsByUser: async (userId: string): Promise<Review[]> => {
    const response = await apiClient.get(`/reviews/user/${userId}`);
    return response.data;
  },

  getUserRatingStats: async (userId: string): Promise<UserRatingStats> => {
    const response = await apiClient.get(`/reviews/user/${userId}/stats`);
    return response.data;
  },

  getById: async (id: string): Promise<Review> => {
    const response = await apiClient.get(`/reviews/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateReviewRequest): Promise<Review> => {
    const response = await apiClient.patch(`/reviews/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/reviews/${id}`);
    return response.data;
  },
};
