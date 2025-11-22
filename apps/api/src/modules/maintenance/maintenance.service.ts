import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateIssueDto, UpdateIssueDto } from './dto';
import { IssueStatus } from '@prisma/client';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async createIssue(userId: string, createIssueDto: CreateIssueDto) {
    // Verify property exists
    const property = await this.prisma.property.findUnique({
      where: { id: createIssueDto.propertyId },
      include: {
        landlord: true,
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Check if user has active contract for this property or is the landlord
    const hasAccess = property.landlordId === userId;

    if (!hasAccess) {
      // Check if user has active contract as tenant
      const activeContract = await this.prisma.rentalContract.findFirst({
        where: {
          propertyId: createIssueDto.propertyId,
          tenantId: userId,
          status: {
            in: ['SIGNED', 'ACTIVE'],
          },
        },
      });

      if (!activeContract) {
        throw new ForbiddenException('You must have an active contract for this property to report issues');
      }
    }

    // Create issue
    const issue = await this.prisma.maintenanceIssue.create({
      data: {
        propertyId: createIssueDto.propertyId,
        reportedBy: userId,
        title: createIssueDto.title,
        description: createIssueDto.description,
        priority: createIssueDto.priority,
        photos: createIssueDto.photos || [],
      },
      include: {
        property: {
          include: {
            landlord: {
              include: {
                profile: true,
              },
            },
          },
        },
        reporter: {
          include: {
            profile: true,
          },
        },
      },
    });

    return issue;
  }

  async getIssuesByProperty(userId: string, propertyId: string) {
    // Verify user has access to property
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Check if user is landlord or tenant with contract
    const isLandlord = property.landlordId === userId;

    if (!isLandlord) {
      const contract = await this.prisma.rentalContract.findFirst({
        where: {
          propertyId,
          tenantId: userId,
        },
      });

      if (!contract) {
        throw new ForbiddenException('You do not have access to this property');
      }
    }

    return this.prisma.maintenanceIssue.findMany({
      where: { propertyId },
      include: {
        property: true,
        reporter: {
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

  async getMyIssues(userId: string) {
    // Get issues reported by user
    return this.prisma.maintenanceIssue.findMany({
      where: {
        reportedBy: userId,
      },
      include: {
        property: {
          include: {
            landlord: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getLandlordIssues(userId: string) {
    // Get issues for landlord's properties
    return this.prisma.maintenanceIssue.findMany({
      where: {
        property: {
          landlordId: userId,
        },
      },
      include: {
        property: true,
        reporter: {
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

  async getIssueById(userId: string, issueId: string) {
    const issue = await this.prisma.maintenanceIssue.findUnique({
      where: { id: issueId },
      include: {
        property: {
          include: {
            landlord: {
              include: {
                profile: true,
              },
            },
          },
        },
        reporter: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    // Verify user has access (reporter, landlord, or tenant with contract)
    const isReporter = issue.reportedBy === userId;
    const isLandlord = issue.property.landlordId === userId;

    if (!isReporter && !isLandlord) {
      // Check if user has contract for property
      const contract = await this.prisma.rentalContract.findFirst({
        where: {
          propertyId: issue.propertyId,
          tenantId: userId,
        },
      });

      if (!contract) {
        throw new ForbiddenException('You do not have access to this issue');
      }
    }

    return issue;
  }

  async updateIssue(userId: string, issueId: string, updateIssueDto: UpdateIssueDto) {
    const issue = await this.prisma.maintenanceIssue.findUnique({
      where: { id: issueId },
      include: {
        property: true,
      },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    // Verify user has permission to update
    const isReporter = issue.reportedBy === userId;
    const isLandlord = issue.property.landlordId === userId;

    if (!isReporter && !isLandlord) {
      throw new ForbiddenException('You do not have permission to update this issue');
    }

    // Tenants can only update certain fields
    if (isReporter && !isLandlord) {
      const allowedFields = ['title', 'description', 'priority', 'photos'];
      const hasRestrictedUpdates = Object.keys(updateIssueDto).some(
        (key) => !allowedFields.includes(key)
      );

      if (hasRestrictedUpdates) {
        throw new ForbiddenException('Tenants can only update title, description, priority, and photos');
      }
    }

    // Auto-set resolvedAt when status changes to RESOLVED or CLOSED
    const updateData: any = { ...updateIssueDto };
    if (updateIssueDto.status === IssueStatus.RESOLVED || updateIssueDto.status === IssueStatus.CLOSED) {
      if (!issue.resolvedAt) {
        updateData.resolvedAt = new Date();
      }
    }

    return this.prisma.maintenanceIssue.update({
      where: { id: issueId },
      data: updateData,
      include: {
        property: {
          include: {
            landlord: {
              include: {
                profile: true,
              },
            },
          },
        },
        reporter: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async deleteIssue(userId: string, issueId: string) {
    const issue = await this.prisma.maintenanceIssue.findUnique({
      where: { id: issueId },
      include: {
        property: true,
      },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    // Only reporter or landlord can delete
    const isReporter = issue.reportedBy === userId;
    const isLandlord = issue.property.landlordId === userId;

    if (!isReporter && !isLandlord) {
      throw new ForbiddenException('You do not have permission to delete this issue');
    }

    // Cannot delete resolved or closed issues
    if (issue.status === IssueStatus.RESOLVED || issue.status === IssueStatus.CLOSED) {
      throw new BadRequestException('Cannot delete resolved or closed issues');
    }

    await this.prisma.maintenanceIssue.delete({
      where: { id: issueId },
    });

    return { message: 'Issue deleted successfully' };
  }

  async getIssueStats(userId: string, propertyId?: string) {
    const where: any = {};

    if (propertyId) {
      // Verify access to property
      const property = await this.prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!property || property.landlordId !== userId) {
        throw new ForbiddenException('You do not have access to this property');
      }

      where.propertyId = propertyId;
    } else {
      // Get stats for all landlord's properties
      where.property = {
        landlordId: userId,
      };
    }

    const [total, reported, acknowledged, inProgress, resolved, closed] = await Promise.all([
      this.prisma.maintenanceIssue.count({ where }),
      this.prisma.maintenanceIssue.count({ where: { ...where, status: IssueStatus.REPORTED } }),
      this.prisma.maintenanceIssue.count({ where: { ...where, status: IssueStatus.ACKNOWLEDGED } }),
      this.prisma.maintenanceIssue.count({ where: { ...where, status: IssueStatus.IN_PROGRESS } }),
      this.prisma.maintenanceIssue.count({ where: { ...where, status: IssueStatus.RESOLVED } }),
      this.prisma.maintenanceIssue.count({ where: { ...where, status: IssueStatus.CLOSED } }),
    ]);

    return {
      total,
      byStatus: {
        reported,
        acknowledged,
        inProgress,
        resolved,
        closed,
      },
      active: reported + acknowledged + inProgress,
    };
  }
}
