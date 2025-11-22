export enum ContractStatus {
  DRAFT = 'DRAFT',
  PENDING_SIGNATURE = 'PENDING_SIGNATURE',
  SIGNED = 'SIGNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  TERMINATED = 'TERMINATED',
}

export interface ContractSignature {
  userId: string;
  signedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ContractSignatures {
  landlord?: ContractSignature;
  tenant?: ContractSignature;
}

export interface Contract {
  id: string;
  propertyId: string;
  landlordId: string;
  tenantId: string;
  startDate: string;
  endDate?: string;
  rentAmount: number;
  depositAmount: number;
  utilitiesAmount?: number;
  contractUrl?: string;
  status: ContractStatus;
  signatureData?: ContractSignatures;
  terms?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    address: any;
    photos?: any[];
  };
  landlord?: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      phone?: string;
    };
  };
  tenant?: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      phone?: string;
    };
  };
  payments?: any[];
}

export interface CreateContractRequest {
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate?: string;
  rentAmount: number;
  depositAmount: number;
  utilitiesAmount?: number;
  terms?: Record<string, any>;
}

export interface UpdateContractRequest {
  startDate?: string;
  endDate?: string;
  rentAmount?: number;
  depositAmount?: number;
  utilitiesAmount?: number;
  status?: ContractStatus;
  contractUrl?: string;
  signatureData?: ContractSignatures;
  terms?: Record<string, any>;
}
