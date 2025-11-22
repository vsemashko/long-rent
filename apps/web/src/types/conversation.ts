export interface ConversationParticipant {
  id: string;
  email: string;
  role: string;
  profile: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: any[];
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  sender: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
  };
}

export interface Conversation {
  id: string;
  propertyId?: string;
  participants: ConversationParticipant[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  propertyId?: string;
  participantIds: string[];
}

export interface SendMessageRequest {
  content: string;
  attachments?: any[];
}
