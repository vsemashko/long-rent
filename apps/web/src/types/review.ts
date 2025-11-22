export interface Review {
  id: string;
  contractId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  isPublic: boolean;
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
  reviewer?: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
  reviewee?: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
}

export interface CreateReviewRequest {
  contractId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  isPublic?: boolean;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
  isPublic?: boolean;
}

export interface UserRatingStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface PendingReview {
  contractId: string;
  property: {
    id: string;
    title: string;
    address: any;
  };
  otherParty: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  contractEndDate: string;
  contractStatus: string;
}
