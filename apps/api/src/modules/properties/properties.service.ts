import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { SearchPropertyDto } from './dto/search-property.dto';
import { Property, PropertyStatus, Prisma } from '@prisma/client';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPropertyDto: CreatePropertyDto): Promise<Property> {
    const { location, ...rest } = createPropertyDto;

    const data: Prisma.PropertyCreateInput = {
      ...rest,
      landlord: {
        connect: { id: userId },
      },
      currency: 'PLN',
      status: PropertyStatus.DRAFT,
    };

    // Add location as PostGIS point if provided
    if (location) {
      // PostGIS expects SRID 4326 format: POINT(longitude latitude)
      data.location = `SRID=4326;POINT(${location.lng} ${location.lat})` as any;
    }

    return this.prisma.property.create({
      data,
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findAll(searchDto: SearchPropertyDto) {
    const {
      city,
      minPrice,
      maxPrice,
      propertyType,
      minRooms,
      maxRooms,
      minArea,
      maxArea,
      availableFrom,
      bounds,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = searchDto;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PropertyWhereInput = {
      status: PropertyStatus.ACTIVE,
    };

    if (city) {
      where.address = {
        path: ['city'],
        string_contains: city,
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    if (propertyType && propertyType.length > 0) {
      where.propertyType = { in: propertyType };
    }

    if (minRooms !== undefined || maxRooms !== undefined) {
      where.rooms = {};
      if (minRooms !== undefined) {
        where.rooms.gte = minRooms;
      }
      if (maxRooms !== undefined) {
        where.rooms.lte = maxRooms;
      }
    }

    if (minArea !== undefined || maxArea !== undefined) {
      where.area = {};
      if (minArea !== undefined) {
        where.area.gte = minArea;
      }
      if (maxArea !== undefined) {
        where.area.lte = maxArea;
      }
    }

    if (availableFrom) {
      where.availableFrom = {
        lte: new Date(availableFrom),
      };
    }

    // Count total matching properties
    const total = await this.prisma.property.count({ where });

    // Fetch properties
    const properties = await this.prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        photos: {
          orderBy: { order: 'asc' },
          take: 5,
        },
        landlord: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return {
      properties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId?: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
        landlord: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
                bio: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: {
              where: { status: 'PENDING' },
            },
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    // Increment view count if not the landlord viewing
    if (userId && userId !== property.landlordId) {
      await this.prisma.property.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
    }

    // Check if property is favorited by current user
    let isFavorite = false;
    if (userId) {
      const favorite = await this.prisma.propertyFavorite.findUnique({
        where: {
          userId_propertyId: {
            userId,
            propertyId: id,
          },
        },
      });
      isFavorite = !!favorite;
    }

    return {
      ...property,
      isFavorite,
      applicantCount: property._count.applications,
    };
  }

  async update(id: string, userId: string, updatePropertyDto: UpdatePropertyDto) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    if (property.landlordId !== userId) {
      throw new ForbiddenException('You do not have permission to update this property');
    }

    const { location, ...rest } = updatePropertyDto;

    const data: Prisma.PropertyUpdateInput = { ...rest };

    // Update location if provided
    if (location) {
      data.location = `SRID=4326;POINT(${location.lng} ${location.lat})` as any;
    }

    return this.prisma.property.update({
      where: { id },
      data,
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    if (property.landlordId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this property');
    }

    // Check if property has active contracts
    const activeContracts = await this.prisma.rentalContract.count({
      where: {
        propertyId: id,
        status: { in: ['ACTIVE', 'SIGNED', 'PENDING_SIGNATURE'] },
      },
    });

    if (activeContracts > 0) {
      throw new BadRequestException(
        'Cannot delete property with active contracts. Archive it instead.'
      );
    }

    return this.prisma.property.delete({
      where: { id },
    });
  }

  async getUserProperties(userId: string) {
    return this.prisma.property.findMany({
      where: { landlordId: userId },
      include: {
        photos: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        _count: {
          select: {
            applications: {
              where: { status: 'PENDING' },
            },
            viewings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleFavorite(propertyId: string, userId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    const existingFavorite = await this.prisma.propertyFavorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    if (existingFavorite) {
      // Remove from favorites
      await this.prisma.propertyFavorite.delete({
        where: { id: existingFavorite.id },
      });
      return { isFavorite: false };
    } else {
      // Add to favorites
      await this.prisma.propertyFavorite.create({
        data: {
          userId,
          propertyId,
        },
      });
      return { isFavorite: true };
    }
  }

  async getUserFavorites(userId: string) {
    const favorites = await this.prisma.propertyFavorite.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            photos: {
              orderBy: { order: 'asc' },
              take: 1,
            },
            landlord: {
              select: {
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((fav) => ({
      ...fav.property,
      isFavorite: true,
    }));
  }
}
