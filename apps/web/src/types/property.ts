export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  STUDIO = 'STUDIO',
  ROOM = 'ROOM',
  OTHER = 'OTHER',
}

export enum PropertyStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  RENTED = 'RENTED',
  ARCHIVED = 'ARCHIVED',
}

export interface PropertyAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  district?: string;
}

export interface PropertyFeatures {
  furnished?: boolean;
  parking?: boolean;
  balcony?: boolean;
  garden?: boolean;
  elevator?: boolean;
  airConditioning?: boolean;
  heating?: boolean;
  internetIncluded?: boolean;
  petFriendly?: boolean;
  accessible?: boolean;
}

export interface PropertyRules {
  smokingAllowed?: boolean;
  petsAllowed?: boolean;
  childrenAllowed?: boolean;
  partiesAllowed?: boolean;
  maxOccupants?: number;
}

export interface PropertyPhoto {
  id: string;
  propertyId: string;
  url: string;
  order: number;
  caption?: string;
  createdAt: string;
}

export interface Property {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  address: PropertyAddress;
  location?: {
    lat: number;
    lng: number;
  };
  price: number;
  currency: string;
  deposit?: number;
  utilities?: number;
  area?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  features?: PropertyFeatures;
  amenities?: string[];
  rules?: PropertyRules;
  viewCount: number;
  availableFrom?: string;
  createdAt: string;
  updatedAt: string;
  photos?: PropertyPhoto[];
  isFavorite?: boolean;
}

export interface CreatePropertyRequest {
  title: string;
  description: string;
  propertyType: PropertyType;
  address: PropertyAddress;
  location?: {
    lat: number;
    lng: number;
  };
  price: number;
  deposit?: number;
  utilities?: number;
  area?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  features?: PropertyFeatures;
  amenities?: string[];
  rules?: PropertyRules;
  availableFrom?: string;
}

export interface UpdatePropertyRequest extends Partial<CreatePropertyRequest> {
  status?: PropertyStatus;
}

export interface PropertySearchFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType[];
  minRooms?: number;
  maxRooms?: number;
  minArea?: number;
  maxArea?: number;
  features?: Partial<PropertyFeatures>;
  availableFrom?: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PropertySearchResponse {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UploadPhotoRequest {
  propertyId: string;
  file: File;
  caption?: string;
}

export interface ReorderPhotosRequest {
  photos: {
    id: string;
    order: number;
  }[];
}
