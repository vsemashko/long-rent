import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateViewingDto, UpdateViewingDto } from './dto/viewing.dto';

@Injectable()
export class ViewingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateViewingDto) {
    // Verify property exists
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Check if viewing time is in the future
    const scheduledDate = new Date(dto.scheduledAt);
    if (scheduledDate < new Date()) {
      throw new BadRequestException('Viewing must be scheduled for a future date');
    }

    return this.prisma.viewing.create({
      data: {
        propertyId: dto.propertyId,
        tenantId: userId,
        scheduledAt: scheduledDate,
        notes: dto.notes,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            landlordId: true,
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
              },
            },
          },
        },
      },
    });
  }

  async getUserViewings(userId: string) {
    return this.prisma.viewing.findMany({
      where: { tenantId: userId },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            photos: {
              take: 1,
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getPropertyViewings(propertyId: string, userId: string) {
    // Verify user owns the property
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.landlordId !== userId) {
      throw new ForbiddenException('You do not have permission to view these viewings');
    }

    return this.prisma.viewing.findMany({
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
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getLandlordViewings(userId: string) {
    return this.prisma.viewing.findMany({
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
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async update(viewingId: string, userId: string, dto: UpdateViewingDto) {
    const viewing = await this.prisma.viewing.findUnique({
      where: { id: viewingId },
      include: { property: true },
    });

    if (!viewing) {
      throw new NotFoundException('Viewing not found');
    }

    // Check permission (tenant or landlord)
    const isOwner = viewing.property.landlordId === userId;
    const isTenant = viewing.tenantId === userId;

    if (!isOwner && !isTenant) {
      throw new ForbiddenException('You do not have permission to update this viewing');
    }

    // Validate scheduled date if provided
    if (dto.scheduledAt) {
      const scheduledDate = new Date(dto.scheduledAt);
      if (scheduledDate < new Date()) {
        throw new BadRequestException('Viewing must be scheduled for a future date');
      }
    }

    return this.prisma.viewing.update({
      where: { id: viewingId },
      data: {
        ...(dto.scheduledAt && { scheduledAt: new Date(dto.scheduledAt) }),
        ...(dto.status && { status: dto.status as any }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
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
              },
            },
          },
        },
      },
    });
  }

  async cancel(viewingId: string, userId: string) {
    const viewing = await this.prisma.viewing.findUnique({
      where: { id: viewingId },
      include: { property: true },
    });

    if (!viewing) {
      throw new NotFoundException('Viewing not found');
    }

    // Check permission
    const isOwner = viewing.property.landlordId === userId;
    const isTenant = viewing.tenantId === userId;

    if (!isOwner && !isTenant) {
      throw new ForbiddenException('You do not have permission to cancel this viewing');
    }

    return this.prisma.viewing.update({
      where: { id: viewingId },
      data: { status: 'CANCELLED' },
    });
  }
}
