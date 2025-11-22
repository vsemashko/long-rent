import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateContractDto, UpdateContractDto } from './dto';
import { ContractStatus } from '@prisma/client';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async createContract(userId: string, createContractDto: CreateContractDto) {
    // Verify property exists and user is the landlord
    const property = await this.prisma.property.findUnique({
      where: { id: createContractDto.propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.landlordId !== userId) {
      throw new ForbiddenException('Only the property owner can create contracts');
    }

    // Verify tenant exists
    const tenant = await this.prisma.user.findUnique({
      where: { id: createContractDto.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Create contract
    const contract = await this.prisma.rentalContract.create({
      data: {
        propertyId: createContractDto.propertyId,
        landlordId: userId,
        tenantId: createContractDto.tenantId,
        startDate: createContractDto.startDate,
        endDate: createContractDto.endDate,
        rentAmount: createContractDto.rentAmount,
        depositAmount: createContractDto.depositAmount,
        utilitiesAmount: createContractDto.utilitiesAmount,
        terms: createContractDto.terms,
        status: ContractStatus.DRAFT,
      },
      include: {
        property: {
          include: {
            photos: true,
          },
        },
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
      },
    });

    return contract;
  }

  async getContractById(userId: string, contractId: string) {
    const contract = await this.prisma.rentalContract.findUnique({
      where: { id: contractId },
      include: {
        property: {
          include: {
            photos: true,
          },
        },
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
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Verify user has access
    if (contract.landlordId !== userId && contract.tenantId !== userId) {
      throw new ForbiddenException('You do not have access to this contract');
    }

    return contract;
  }

  async getMyContracts(userId: string) {
    return this.prisma.rentalContract.findMany({
      where: {
        OR: [
          { landlordId: userId },
          { tenantId: userId },
        ],
      },
      include: {
        property: {
          include: {
            photos: true,
          },
        },
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
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getLandlordContracts(userId: string) {
    return this.prisma.rentalContract.findMany({
      where: { landlordId: userId },
      include: {
        property: {
          include: {
            photos: true,
          },
        },
        tenant: {
          include: {
            profile: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getTenantContracts(userId: string) {
    return this.prisma.rentalContract.findMany({
      where: { tenantId: userId },
      include: {
        property: {
          include: {
            photos: true,
          },
        },
        landlord: {
          include: {
            profile: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateContract(userId: string, contractId: string, updateContractDto: UpdateContractDto) {
    const contract = await this.prisma.rentalContract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Only landlord can update contract before it's signed
    if (contract.landlordId !== userId) {
      throw new ForbiddenException('Only the landlord can update this contract');
    }

    // Don't allow updates to signed or active contracts (except status)
    if ([ContractStatus.SIGNED, ContractStatus.ACTIVE].includes(contract.status) &&
        Object.keys(updateContractDto).some(key => key !== 'status')) {
      throw new BadRequestException('Cannot modify signed or active contracts');
    }

    return this.prisma.rentalContract.update({
      where: { id: contractId },
      data: updateContractDto,
      include: {
        property: {
          include: {
            photos: true,
          },
        },
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
      },
    });
  }

  async signContract(userId: string, contractId: string, signatureData: any) {
    const contract = await this.prisma.rentalContract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Verify user is either landlord or tenant
    if (contract.landlordId !== userId && contract.tenantId !== userId) {
      throw new ForbiddenException('You do not have permission to sign this contract');
    }

    // Contract must be in PENDING_SIGNATURE status
    if (contract.status !== ContractStatus.PENDING_SIGNATURE && contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('Contract is not ready for signature');
    }

    // Store signature data
    const existingSignatures = (contract.signatureData as any) || {};
    const role = contract.landlordId === userId ? 'landlord' : 'tenant';

    const updatedSignatures = {
      ...existingSignatures,
      [role]: {
        userId,
        signedAt: new Date(),
        ...signatureData,
      },
    };

    // Check if both parties have signed
    const bothSigned = updatedSignatures.landlord && updatedSignatures.tenant;
    const newStatus = bothSigned ? ContractStatus.SIGNED : ContractStatus.PENDING_SIGNATURE;

    return this.prisma.rentalContract.update({
      where: { id: contractId },
      data: {
        signatureData: updatedSignatures,
        status: newStatus,
      },
      include: {
        property: {
          include: {
            photos: true,
          },
        },
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
      },
    });
  }

  async activateContract(userId: string, contractId: string) {
    const contract = await this.prisma.rentalContract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Only landlord can activate
    if (contract.landlordId !== userId) {
      throw new ForbiddenException('Only the landlord can activate this contract');
    }

    // Contract must be signed
    if (contract.status !== ContractStatus.SIGNED) {
      throw new BadRequestException('Contract must be signed by both parties before activation');
    }

    return this.prisma.rentalContract.update({
      where: { id: contractId },
      data: {
        status: ContractStatus.ACTIVE,
      },
      include: {
        property: {
          include: {
            photos: true,
          },
        },
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
      },
    });
  }

  async terminateContract(userId: string, contractId: string, reason?: string) {
    const contract = await this.prisma.rentalContract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Only landlord or tenant can terminate
    if (contract.landlordId !== userId && contract.tenantId !== userId) {
      throw new ForbiddenException('You do not have permission to terminate this contract');
    }

    // Update contract status
    return this.prisma.rentalContract.update({
      where: { id: contractId },
      data: {
        status: ContractStatus.TERMINATED,
        terms: {
          ...(contract.terms as object),
          terminatedBy: userId,
          terminatedAt: new Date(),
          terminationReason: reason,
        },
      },
      include: {
        property: {
          include: {
            photos: true,
          },
        },
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
      },
    });
  }

  async deleteContract(userId: string, contractId: string) {
    const contract = await this.prisma.rentalContract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Only landlord can delete draft contracts
    if (contract.landlordId !== userId) {
      throw new ForbiddenException('Only the landlord can delete this contract');
    }

    // Can only delete draft contracts
    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft contracts');
    }

    await this.prisma.rentalContract.delete({
      where: { id: contractId },
    });

    return { message: 'Contract deleted successfully' };
  }
}
