import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto, SendMessageDto } from './dto/conversation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  create(@Request() req: any, @Body() createConversationDto: CreateConversationDto) {
    return this.conversationsService.createConversation(req.user.sub, createConversationDto);
  }

  @Get()
  getUserConversations(@Request() req: any) {
    return this.conversationsService.getUserConversations(req.user.sub);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req: any) {
    return this.conversationsService.getUnreadCount(req.user.sub);
  }

  @Get(':id')
  getConversation(@Param('id') id: string, @Request() req: any) {
    return this.conversationsService.getConversation(id, req.user.sub);
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') id: string,
    @Request() req: any,
    @Body() sendMessageDto: SendMessageDto
  ) {
    return this.conversationsService.sendMessage(id, req.user.sub, sendMessageDto);
  }

  @Post(':id/mark-read')
  @HttpCode(HttpStatus.OK)
  markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.conversationsService.markAsRead(id, req.user.sub);
  }
}
