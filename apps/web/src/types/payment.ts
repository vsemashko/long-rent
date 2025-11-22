export enum PaymentType {
  RENT = 'RENT',
  DEPOSIT = 'DEPOSIT',
  UTILITIES = 'UTILITIES',
  OTHER = 'OTHER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface Payment {
  id: string;
  contractId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  currency: string;
  type: PaymentType;
  status: PaymentStatus;
  paymentIntentId?: string;
  paymentMethodId?: string;
  metadata?: Record<string, any>;
  failureReason?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  contract?: {
    id: string;
    property: {
      id: string;
      title: string;
      address: any;
    };
  };
  payer?: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  payee?: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface CreatePaymentRequest {
  contractId: string;
  amount: number;
  currency?: string;
  type: PaymentType;
  paymentMethodId?: string;
  metadata?: Record<string, any>;
}
