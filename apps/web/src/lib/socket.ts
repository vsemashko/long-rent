import { io, Socket } from 'socket.io-client';
import { Message } from '@/types/conversation';

class SocketClient {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.token = token;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    this.socket = io(`${apiUrl}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(conversationId: string) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('join:conversation', conversationId, (response: any) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  sendMessage(conversationId: string, content: string, attachments?: any[]) {
    return new Promise<Message>((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit(
        'send:message',
        {
          conversationId,
          message: { content, attachments },
        },
        (response: any) => {
          if (response.success) {
            resolve(response.message);
          } else {
            reject(new Error(response.error));
          }
        }
      );
    });
  }

  onNewMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('message:new', callback);
    }
  }

  offNewMessage(callback?: (message: Message) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off('message:new', callback);
      } else {
        this.socket.off('message:new');
      }
    }
  }

  startTyping(conversationId: string) {
    if (this.socket) {
      this.socket.emit('typing:start', conversationId);
    }
  }

  stopTyping(conversationId: string) {
    if (this.socket) {
      this.socket.emit('typing:stop', conversationId);
    }
  }

  onUserTyping(callback: (data: { userId: string; conversationId: string }) => void) {
    if (this.socket) {
      this.socket.on('user:typing', callback);
    }
  }

  onUserStopTyping(callback: (data: { userId: string; conversationId: string }) => void) {
    if (this.socket) {
      this.socket.on('user:stop-typing', callback);
    }
  }

  markAsRead(conversationId: string) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('mark:read', conversationId, (response: any) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  onMessagesRead(callback: (data: { userId: string; conversationId: string }) => void) {
    if (this.socket) {
      this.socket.on('messages:read', callback);
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketClient = new SocketClient();
