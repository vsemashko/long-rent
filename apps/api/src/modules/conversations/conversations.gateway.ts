import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConversationsService } from './conversations.service';
import { JwtService } from '@nestjs/jwt';
import { SendMessageDto } from './dto/conversation.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ConversationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor(
    private conversationsService: ConversationsService,
    private jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      this.userSockets.set(userId, client.id);
      client.data.userId = userId;

      // Join user's conversation rooms
      const conversations = await this.conversationsService.getUserConversations(userId);
      conversations.forEach((conv) => {
        client.join(`conversation:${conv.id}`);
      });

      console.log(`User ${userId} connected with socket ${client.id}`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSockets.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('join:conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string
  ) {
    const userId = client.data.userId;
    try {
      // Verify user is participant
      await this.conversationsService.getConversation(conversationId, userId);
      client.join(`conversation:${conversationId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('send:message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; message: SendMessageDto }
  ) {
    const userId = client.data.userId;
    try {
      const message = await this.conversationsService.sendMessage(
        data.conversationId,
        userId,
        data.message
      );

      // Broadcast to all participants in the conversation
      this.server.to(`conversation:${data.conversationId}`).emit('message:new', message);

      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string
  ) {
    const userId = client.data.userId;
    client.to(`conversation:${conversationId}`).emit('user:typing', { userId, conversationId });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string
  ) {
    const userId = client.data.userId;
    client.to(`conversation:${conversationId}`).emit('user:stop-typing', { userId, conversationId });
  }

  @SubscribeMessage('mark:read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string
  ) {
    const userId = client.data.userId;
    try {
      await this.conversationsService.markAsRead(conversationId, userId);
      this.server.to(`conversation:${conversationId}`).emit('messages:read', { userId, conversationId });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
