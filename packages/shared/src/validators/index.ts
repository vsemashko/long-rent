import { z } from 'zod';

// Common validators
export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const uuidSchema = z.string().uuid('Invalid UUID format');

// Pagination validators
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Auth validators
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: phoneSchema.optional(),
  role: z.enum(['TENANT', 'LANDLORD', 'BOTH']).default('TENANT'),
});

// Property validators
export const propertyAddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  district: z.string().optional(),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

export const createPropertySchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  propertyType: z.enum(['APARTMENT', 'HOUSE', 'STUDIO', 'ROOM', 'OTHER']),
  address: propertyAddressSchema,
  price: z.number().positive('Price must be positive'),
  deposit: z.number().positive('Deposit must be positive').optional(),
  utilities: z.number().positive('Utilities must be positive').optional(),
  area: z.number().positive('Area must be positive').optional(),
  rooms: z.number().int().positive().optional(),
  bedrooms: z.number().int().positive().optional(),
  bathrooms: z.number().int().positive().optional(),
  floor: z.number().int().optional(),
  totalFloors: z.number().int().optional(),
  features: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  rules: z.record(z.boolean()).optional(),
  availableFrom: z.string().datetime().optional(),
});

export const propertySearchSchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  propertyType: z.array(z.enum(['APARTMENT', 'HOUSE', 'STUDIO', 'ROOM', 'OTHER'])).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  minArea: z.coerce.number().positive().optional(),
  maxArea: z.coerce.number().positive().optional(),
  rooms: z.array(z.coerce.number().int()).optional(),
  bedrooms: z.array(z.coerce.number().int()).optional(),
  features: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  pets: z.coerce.boolean().optional(),
});

// Export types inferred from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type PropertySearchInput = z.infer<typeof propertySearchSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
