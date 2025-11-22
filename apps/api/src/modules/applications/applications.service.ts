import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateApplicationDto, UpdateApplicationDto } from './dto/application.dto';
import { RentalApplication, ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    createApplicationDto: CreateApplicationDto,
  ): Promise<RentalApplication> {
    const { propertyId, moveInDate, ...rest } = createApplicationDto;

    // Verify property exists
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, landlordId: true, status: true },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Don't allow landlords to apply to their own properties
    if (property.landlordId === userId) {
      throw new BadRequestException('Cannot apply to your own property');
    }

    // Check if user already applied
    const existingApplication = await this.prisma.rentalApplication.findFirst({
      where: {
        propertyId,
        tenantId: userId,
        status: {
          in: ['PENDING', 'UNDER_REVIEW'],
        },
      },
    });

    if (existingApplication) {
      throw new BadRequestException('You already have a pending application for this property');
    }

    return this.prisma.rentalApplication.create({
      data: {
        propertyId,
        tenantId: userId,
        moveInDate: moveInDate ? new Date(moveInDate) : null,
        ...rest,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            price: true,
            photos: {
              take: 1,
              orderBy: { order: 'asc' },
            },
          },
        },
        tenant: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                phoneNumber: true,
                bio: true,
              },
            },
          },
        },
      },
    });
  }

  async getMyApplications(userId: string): Promise<RentalApplication[]> {
    return this.prisma.rentalApplication.findMany({
      where: { tenantId: userId },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            price: true,
            currency: true,
            photos: {
              take: 1,
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLandlordApplications(userId: string): Promise<RentalApplication[]> {
    return this.prisma.rentalApplication.findMany({
      where: {
        property: {
          landlordId: userId,
        },
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
        tenant: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                phoneNumber: true,
                bio: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPropertyApplications(
    propertyId: string,
    userId: string,
  ): Promise<RentalApplication[]> {
    // Verify user owns the property
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { landlordId: true },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.landlordId !== userId) {
      throw new ForbiddenException('You do not have permission to view these applications');
    }

    return this.prisma.rentalApplication.findMany({
      where: { propertyId },
      include: {
        tenant: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                phoneNumber: true,
                bio: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' }, // Show oldest first for queue position
    });
  }

  async getApplicationCount(propertyId: string): Promise<{ count: number }> {
    const count = await this.prisma.rentalApplication.count({
      where: {
        propertyId,
        status: {
          in: ['PENDING', 'UNDER_REVIEW'],
        },
      },
    });

    return { count };
  }

  async update(
    applicationId: string,
    userId: string,
    updateApplicationDto: UpdateApplicationDto,
  ): Promise<RentalApplication> {
    const application = await this.prisma.rentalApplication.findUnique({
      where: { id: applicationId },
      include: {
        property: {
          select: { landlordId: true },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const isLandlord = application.property.landlordId === userId;
    const isTenant = application.tenantId === userId;

    if (!isLandlord && !isTenant) {
      throw new ForbiddenException('You do not have permission to update this application');
    }

    // Tenants can only withdraw
    if (isTenant && updateApplicationDto.status && updateApplicationDto.status !== 'WITHDRAWN') {
      throw new ForbiddenException('Tenants can only withdraw their applications');
    }

    // Landlords can update status and add notes
    const data: any = {};

    if (updateApplicationDto.status) {
      data.status = updateApplicationDto.status as ApplicationStatus;
      if (['ACCEPTED', 'REJECTED'].includes(updateApplicationDto.status)) {
        data.reviewedAt = new Date();
      }
    }

    if (isLandlord && updateApplicationDto.landlordNotes !== undefined) {
      data.landlordNotes = updateApplicationDto.landlordNotes;
    }

    // Tenants can update their application details before landlord reviews
    if (isTenant && application.status === 'PENDING') {
      if (updateApplicationDto.moveInDate) {
        data.moveInDate = new Date(updateApplicationDto.moveInDate);
      }
      if (updateApplicationDto.employmentInfo) {
        data.employmentInfo = updateApplicationDto.employmentInfo;
      }
      if (updateApplicationDto.referencesInfo) {
        data.referencesInfo = updateApplicationDto.referencesInfo;
      }
      if (updateApplicationDto.additionalInfo) {
        data.additionalInfo = updateApplicationDto.additionalInfo;
      }
    }

    return this.prisma.rentalApplication.update({
      where: { id: applicationId },
      data,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
        tenant: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async withdraw(applicationId: string, userId: string): Promise<RentalApplication> {
    const application = await this.prisma.rentalApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.tenantId !== userId) {
      throw new ForbiddenException('You can only withdraw your own applications');
    }

    if (application.status !== 'PENDING' && application.status !== 'UNDER_REVIEW') {
      throw new BadRequestException('Cannot withdraw an application that has been processed');
    }

    return this.prisma.rentalApplication.update({
      where: { id: applicationId },
      data: { status: 'WITHDRAWN' },
    });
  }
}
