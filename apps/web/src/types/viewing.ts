export enum ViewingStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export interface Viewing {
  id: string;
  propertyId: string;
  tenantId: string;
  scheduledAt: string;
  status: ViewingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    address: any;
    photos?: any[];
  };
  tenant?: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      phoneNumber?: string;
    };
  };
}

export interface CreateViewingRequest {
  propertyId: string;
  scheduledAt: string;
  notes?: string;
}

export interface UpdateViewingRequest {
  scheduledAt?: string;
  status?: ViewingStatus;
  notes?: string;
}
