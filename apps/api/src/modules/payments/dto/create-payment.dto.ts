import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaymentType } from '@prisma/client';

export class CreatePaymentDto {
  @IsUUID()
  contractId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(PaymentType)
  type: PaymentType;

  @IsString()
  @IsOptional()
  paymentMethodId?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
