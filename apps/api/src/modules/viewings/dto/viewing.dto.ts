import { IsString, IsUUID, IsDateString, IsOptional, IsEnum } from 'class-validator';

export class CreateViewingDto {
  @IsUUID()
  propertyId!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateViewingDto {
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsEnum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
