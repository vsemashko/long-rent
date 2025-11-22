import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { IssuePriority } from '@prisma/client';

export class CreateIssueDto {
  @IsString()
  propertyId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(IssuePriority)
  priority?: IssuePriority;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];
}
