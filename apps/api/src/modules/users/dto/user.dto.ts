import { IsString, IsOptional, IsDateString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Jan', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Kowalski', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: '+48123456789', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiProperty({ example: 'Professional landlord with 10 years of experience', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ example: 'pl', required: false })
  @IsOptional()
  @IsString()
  languagePreference?: string;
}

export class UpdateNotificationSettingsDto {
  @ApiProperty({ example: { email: true, sms: false, push: true }, required: false })
  @IsOptional()
  notificationSettings?: Record<string, any>;
}
