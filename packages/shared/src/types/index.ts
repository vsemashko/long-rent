// Common API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User types
export type UserRole = 'TENANT' | 'LANDLORD' | 'BOTH' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  verificationStatus: VerificationStatus;
}

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

// Property types
export type PropertyType = 'APARTMENT' | 'HOUSE' | 'STUDIO' | 'ROOM' | 'OTHER';
export type PropertyStatus = 'DRAFT' | 'ACTIVE' | 'RENTED' | 'ARCHIVED';

export interface PropertyAddress {
  street: string;
  city: string;
  district?: string;
  postalCode: string;
  country: string;
}

export interface PropertyLocation {
  lat: number;
  lng: number;
}

// Search & Filters
export interface PropertySearchFilters {
  city?: string;
  district?: string;
  propertyType?: PropertyType[];
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  rooms?: number[];
  bedrooms?: number[];
  features?: string[];
  amenities?: string[];
  availableFrom?: string;
  pets?: boolean;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface DecodedToken {
  sub: string; // user id
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Error codes
export enum ErrorCode {
  // Auth errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Rate limiting
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
}
