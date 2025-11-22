import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsObject,
  IsArray,
  IsBoolean,
  IsDateString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType } from '@prisma/client';

export class PropertyAddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  district?: string;
}

export class PropertyLocationDto {
  @IsNumber()
  @Min(-90)
  lat: number;

  @IsNumber()
  @Min(-180)
  lng: number;
}

export class PropertyFeaturesDto {
  @IsOptional()
  @IsBoolean()
  furnished?: boolean;

  @IsOptional()
  @IsBoolean()
  parking?: boolean;

  @IsOptional()
  @IsBoolean()
  balcony?: boolean;

  @IsOptional()
  @IsBoolean()
  garden?: boolean;

  @IsOptional()
  @IsBoolean()
  elevator?: boolean;

  @IsOptional()
  @IsBoolean()
  airConditioning?: boolean;

  @IsOptional()
  @IsBoolean()
  heating?: boolean;

  @IsOptional()
  @IsBoolean()
  internetIncluded?: boolean;

  @IsOptional()
  @IsBoolean()
  petFriendly?: boolean;

  @IsOptional()
  @IsBoolean()
  accessible?: boolean;
}

export class PropertyRulesDto {
  @IsOptional()
  @IsBoolean()
  smokingAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  petsAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  childrenAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  partiesAllowed?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxOccupants?: number;
}

export class CreatePropertyDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @IsObject()
  @ValidateNested()
  @Type(() => PropertyAddressDto)
  address: PropertyAddressDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PropertyLocationDto)
  location?: PropertyLocationDto;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deposit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  utilities?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  area?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  rooms?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  floor?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  totalFloors?: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PropertyFeaturesDto)
  features?: PropertyFeaturesDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PropertyRulesDto)
  rules?: PropertyRulesDto;

  @IsOptional()
  @IsDateString()
  availableFrom?: string;
}
