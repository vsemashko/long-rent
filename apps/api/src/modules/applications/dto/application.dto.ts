import {
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  IsEnum,
  IsObject,
} from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  propertyId!: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsDateString()
  moveInDate?: string;

  @IsOptional()
  @IsObject()
  employmentInfo?: {
    jobTitle?: string;
    employer?: string;
    monthlyIncome?: number;
    employmentDuration?: string;
  };

  @IsOptional()
  @IsObject()
  referencesInfo?: {
    previousLandlord?: string;
    landlordContact?: string;
    yearsRented?: number;
  };

  @IsOptional()
  @IsObject()
  additionalInfo?: {
    hasPets?: boolean;
    petDetails?: string;
    isSmoker?: boolean;
    numberOfOccupants?: number;
  };
}

export class UpdateApplicationDto {
  @IsOptional()
  @IsEnum(['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'])
  status?: string;

  @IsOptional()
  @IsString()
  landlordNotes?: string;

  @IsOptional()
  @IsDateString()
  moveInDate?: string;

  @IsOptional()
  @IsObject()
  employmentInfo?: object;

  @IsOptional()
  @IsObject()
  referencesInfo?: object;

  @IsOptional()
  @IsObject()
  additionalInfo?: object;
}
