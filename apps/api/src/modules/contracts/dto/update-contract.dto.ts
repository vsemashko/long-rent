import { IsDate, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ContractStatus } from '@prisma/client';

export class UpdateContractDto {
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsNumber()
  @IsOptional()
  @Min(0)
  rentAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  depositAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  utilitiesAmount?: number;

  @IsEnum(ContractStatus)
  @IsOptional()
  status?: ContractStatus;

  @IsString()
  @IsOptional()
  contractUrl?: string;

  @IsOptional()
  signatureData?: Record<string, any>;

  @IsOptional()
  terms?: Record<string, any>;
}
