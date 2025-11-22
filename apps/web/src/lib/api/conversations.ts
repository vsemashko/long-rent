import { apiClient } from '../api-client';
import {
  Conversation,
  CreateConversationRequest,
  SendMessageRequest,
  Message,
} from '@/types/conversation';

export const conversationsApi = {
  // Create or get existing conversation
  create: async (data: CreateConversationRequest): Promise<Conversation> => {
    const response = await apiClient.post<Conversation>('/conversations', data);
    return response.data;
  },

  // Get all user conversations
  list: async (): Promise<Conversation[]> => {
    const response = await apiClient.get<Conversation[]>('/conversations');
    return response.data;
  },

  // Get specific conversation with messages
  getById: async (id: string): Promise<Conversation> => {
    const response = await apiClient.get<Conversation>(`/conversations/${id}`);
    return response.data;
  },

  // Send message via REST (fallback)
  sendMessage: async (conversationId: string, data: SendMessageRequest): Promise<Message> => {
    const response = await apiClient.post<Message>(
      `/conversations/${conversationId}/messages`,
      data
    );
    return response.data;
  },

  // Mark conversation as read
  markAsRead: async (conversationId: string): Promise<void> => {
    await apiClient.post(`/conversations/${conversationId}/mark-read`);
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get<{ count: number }>('/conversations/unread-count');
    return response.data;
  },
};
