import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { ContractStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(userId: string, createReviewDto: CreateReviewDto) {
    // Verify contract exists and is completed or terminated
    const contract = await this.prisma.rentalContract.findUnique({
      where: { id: createReviewDto.contractId },
      include: {
        landlord: true,
        tenant: true,
      },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Verify user is part of the contract
    if (contract.landlordId !== userId && contract.tenantId !== userId) {
      throw new ForbiddenException('You are not authorized to review this contract');
    }

    // Contract must be completed or terminated to leave reviews
    if (![ContractStatus.COMPLETED, ContractStatus.TERMINATED].includes(contract.status)) {
      throw new BadRequestException('Can only review completed or terminated contracts');
    }

    // Verify reviewee is the other party
    const isLandlord = contract.landlordId === userId;
    const expectedRevieweeId = isLandlord ? contract.tenantId : contract.landlordId;

    if (createReviewDto.revieweeId !== expectedRevieweeId) {
      throw new BadRequestException('Invalid reviewee - must be the other party in the contract');
    }

    // Check if review already exists
    const existingReview = await this.prisma.review.findUnique({
      where: {
        contractId_reviewerId_revieweeId: {
          contractId: createReviewDto.contractId,
          reviewerId: userId,
          revieweeId: createReviewDto.revieweeId,
        },
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this contract');
    }

    // Create review
    const review = await this.prisma.review.create({
      data: {
        contractId: createReviewDto.contractId,
        reviewerId: userId,
        revieweeId: createReviewDto.revieweeId,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
        isPublic: createReviewDto.isPublic ?? true,
      },
      include: {
        contract: {
          include: {
            property: true,
          },
        },
        reviewer: {
          include: {
            profile: true,
          },
        },
        reviewee: {
          include: {
            profile: true,
          },
        },
      },
    });

    return review;
  }

  async getReviewsByUser(userId: string, targetUserId: string) {
    // Get all public reviews for a specific user
    return this.prisma.review.findMany({
      where: {
        revieweeId: targetUserId,
        isPublic: true,
      },
      include: {
        contract: {
          include: {
            property: true,
          },
        },
        reviewer: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getMyReviews(userId: string) {
    // Get reviews written by the user
    return this.prisma.review.findMany({
      where: {
        reviewerId: userId,
      },
      include: {
        contract: {
          include: {
            property: true,
          },
        },
        reviewee: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getReviewsAboutMe(userId: string) {
    // Get reviews about the user
    return this.prisma.review.findMany({
      where: {
        revieweeId: userId,
      },
      include: {
        contract: {
          include: {
            property: true,
          },
        },
        reviewer: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUserRatingStats(userId: string) {
    // Calculate average rating and count
    const reviews = await this.prisma.review.findMany({
      where: {
        revieweeId: userId,
        isPublic: true,
      },
      select: {
        rating: true,
      },
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = reviews.reduce(
      (dist, review) => {
        dist[review.rating] = (dist[review.rating] || 0) + 1;
        return dist;
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>,
    );

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
    };
  }

  async getReviewById(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        contract: {
          include: {
            property: true,
          },
        },
        reviewer: {
          include: {
            profile: true,
          },
        },
        reviewee: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Only reviewer, reviewee, or public reviews can be viewed
    if (
      !review.isPublic &&
      review.reviewerId !== userId &&
      review.revieweeId !== userId
    ) {
      throw new ForbiddenException('You do not have access to this review');
    }

    return review;
  }

  async updateReview(userId: string, reviewId: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Only the reviewer can update
    if (review.reviewerId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: updateReviewDto,
      include: {
        contract: {
          include: {
            property: true,
          },
        },
        reviewer: {
          include: {
            profile: true,
          },
        },
        reviewee: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Only the reviewer can delete
    if (review.reviewerId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    return { message: 'Review deleted successfully' };
  }

  async getPendingReviews(userId: string) {
    // Get contracts where user can leave a review
    const contracts = await this.prisma.rentalContract.findMany({
      where: {
        OR: [
          { landlordId: userId },
          { tenantId: userId },
        ],
        status: {
          in: [ContractStatus.COMPLETED, ContractStatus.TERMINATED],
        },
      },
      include: {
        landlord: {
          include: {
            profile: true,
          },
        },
        tenant: {
          include: {
            profile: true,
          },
        },
        property: true,
        reviews: {
          where: {
            reviewerId: userId,
          },
        },
      },
    });

    // Filter contracts where user hasn't left a review yet
    const pendingReviews = contracts
      .filter(contract => contract.reviews.length === 0)
      .map(contract => ({
        contractId: contract.id,
        property: contract.property,
        otherParty: contract.landlordId === userId ? contract.tenant : contract.landlord,
        contractEndDate: contract.endDate || contract.updatedAt,
        contractStatus: contract.status,
      }));

    return pendingReviews;
  }
}
