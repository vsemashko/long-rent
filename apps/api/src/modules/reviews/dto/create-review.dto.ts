import { IsString, IsInt, Min, Max, IsOptional, IsBoolean } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  contractId: string;

  @IsString()
  revieweeId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
