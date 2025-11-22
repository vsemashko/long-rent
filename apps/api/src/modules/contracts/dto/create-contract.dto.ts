import { IsDate, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContractDto {
  @IsUUID()
  propertyId: string;

  @IsUUID()
  tenantId: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsNumber()
  @Min(0)
  rentAmount: number;

  @IsNumber()
  @Min(0)
  depositAmount: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  utilitiesAmount?: number;

  @IsOptional()
  terms?: Record<string, any>;
}
