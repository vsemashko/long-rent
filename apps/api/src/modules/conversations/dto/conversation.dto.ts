import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @IsUUID('4', { each: true })
  participantIds: string[];
}

export class SendMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  attachments?: any[];
}
