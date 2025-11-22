'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { ChatInterface } from '@/components/chat/chat-interface';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { conversationsApi } from '@/lib/api/conversations';
import { socketClient } from '@/lib/socket';
import { Conversation } from '@/types/conversation';
import { Loader2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    searchParams.get('conversation')
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/messages');
      return;
    }

    loadConversations();
    setupSocket();

    return () => {
      socketClient.disconnect();
    };
  }, [isAuthenticated]);

  const loadConversations = async () => {
    try {
      const data = await conversationsApi.list();
      setConversations(data);

      // Auto-select first conversation if none selected
      if (!selectedConversationId && data.length > 0) {
        setSelectedConversationId(data[0].id);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocket = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      socketClient.connect(accessToken);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.id !== user?.id);
  };

  const getLastMessage = (conversation: Conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return 'No messages yet';
    }
    const lastMsg = conversation.messages[0];
    const prefix = lastMsg.senderId === user?.id ? 'You: ' : '';
    return prefix + lastMsg.content.substring(0, 50) + (lastMsg.content.length > 50 ? '...' : '');
  };

  if (!isAuthenticated || !user) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Messages</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1 p-4">
            <h2 className="font-semibold mb-4">Conversations</h2>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation);
                  const isSelected = conversation.id === selectedConversationId;

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-primary-foreground/20' : 'bg-primary/10'
                        }`}>
                          <span className={`text-sm font-semibold ${
                            isSelected ? 'text-primary-foreground' : 'text-primary'
                          }`}>
                            {otherParticipant?.profile.firstName?.[0]}
                            {otherParticipant?.profile.lastName?.[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`text-sm font-medium truncate ${
                              isSelected ? 'text-primary-foreground' : ''
                            }`}>
                              {otherParticipant?.profile.firstName}{' '}
                              {otherParticipant?.profile.lastName}
                            </p>
                            <span className={`text-xs ${
                              isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {formatDistanceToNow(new Date(conversation.updatedAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <p className={`text-xs truncate ${
                            isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {getLastMessage(conversation)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Chat Interface */}
          <Card className="lg:col-span-2 p-0 overflow-hidden">
            {selectedConversationId ? (
              <ChatInterface key={selectedConversationId} conversationId={selectedConversationId} />
            ) : (
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Select a conversation to start messaging
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
