export enum ApplicationStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface EmploymentInfo {
  jobTitle?: string;
  employer?: string;
  monthlyIncome?: number;
  employmentDuration?: string;
}

export interface ReferencesInfo {
  previousLandlord?: string;
  landlordContact?: string;
  yearsRented?: number;
}

export interface AdditionalInfo {
  hasPets?: boolean;
  petDetails?: string;
  isSmoker?: boolean;
  numberOfOccupants?: number;
}

export interface Application {
  id: string;
  propertyId: string;
  tenantId: string;
  status: ApplicationStatus;
  message?: string;
  moveInDate?: string;
  employmentInfo?: EmploymentInfo;
  referencesInfo?: ReferencesInfo;
  additionalInfo?: AdditionalInfo;
  landlordNotes?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    address: any;
    price?: number;
    currency?: string;
    photos?: any[];
  };
  tenant?: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      bio?: string;
    };
  };
}

export interface CreateApplicationRequest {
  propertyId: string;
  message?: string;
  moveInDate?: string;
  employmentInfo?: EmploymentInfo;
  referencesInfo?: ReferencesInfo;
  additionalInfo?: AdditionalInfo;
}

export interface UpdateApplicationRequest {
  status?: ApplicationStatus;
  landlordNotes?: string;
  moveInDate?: string;
  employmentInfo?: EmploymentInfo;
  referencesInfo?: ReferencesInfo;
  additionalInfo?: AdditionalInfo;
}
