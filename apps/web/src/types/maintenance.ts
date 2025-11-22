export enum IssueStatus {
  REPORTED = 'REPORTED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum IssuePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface MaintenanceIssue {
  id: string;
  propertyId: string;
  reportedBy: string;
  title: string;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;
  photos: string[];
  resolvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    address: any;
    landlord?: {
      id: string;
      email: string;
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  };
  reporter?: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface CreateIssueRequest {
  propertyId: string;
  title: string;
  description: string;
  priority?: IssuePriority;
  photos?: string[];
}

export interface UpdateIssueRequest {
  title?: string;
  description?: string;
  priority?: IssuePriority;
  status?: IssueStatus;
  notes?: string;
  photos?: string[];
}

export interface IssueStats {
  total: number;
  byStatus: {
    reported: number;
    acknowledged: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
  active: number;
}
