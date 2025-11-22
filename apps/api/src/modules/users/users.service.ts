import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@homemore/database';
import { UpdateProfileDto, UpdateNotificationSettingsDto } from './dto/user.dto';
import { LoggerService } from '../../common/logger.service';
import { AuditLogService } from '../../common/audit-log.service';

@Injectable()
export class UsersService {
  private readonly logger = new LoggerService();

  constructor(private auditLogService: AuditLogService) {
    this.logger.setContext(UsersService.name);
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    this.logger.log(`Updating profile for user: ${userId}`);

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: dto,
      create: {
        userId,
        ...dto,
      },
    });

    // Log audit event
    await this.auditLogService.log({
      userId,
      action: 'profile_update',
      entity: 'profile',
      entityId: profile.id,
      changes: dto,
    });

    return profile;
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(userId: string, dto: UpdateNotificationSettingsDto) {
    this.logger.log(`Updating notification settings for user: ${userId}`);

    const profile = await prisma.profile.update({
      where: { userId },
      data: dto,
    });

    return profile;
  }

  /**
   * Delete user account (GDPR right to erasure)
   */
  async deleteAccount(userId: string) {
    this.logger.log(`Deleting account for user: ${userId}`);

    // Check if user has active contracts
    const activeContracts = await prisma.rentalContract.count({
      where: {
        OR: [{ landlordId: userId }, { tenantId: userId }],
        status: { in: ['ACTIVE', 'PENDING_SIGNATURE', 'SIGNED'] },
      },
    });

    if (activeContracts > 0) {
      throw new Error('Cannot delete account with active contracts. Please wait until contracts are completed.');
    }

    // Log GDPR action
    await this.auditLogService.logGDPRAction('data_deletion', userId);

    // Soft delete (mark as inactive)
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        email: `deleted_${userId}@homemore.pl`, // Anonymize email
      },
    });

    // TODO: Schedule hard delete after retention period
    this.logger.log(`Account marked for deletion: ${userId}`);

    return { message: 'Account will be deleted within 30 days' };
  }

  /**
   * Export user data (GDPR data portability)
   */
  async exportData(userId: string) {
    this.logger.log(`Exporting data for user: ${userId}`);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        ownedProperties: true,
        favorites: true,
        sentMessages: true,
        viewingBookings: true,
        applications: true,
        contractsAsLandlord: true,
        contractsAsTenant: true,
        paymentsAsPayer: true,
        paymentsAsPayee: true,
        reviewsGiven: true,
        reviewsReceived: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get audit logs
    const auditLogs = await this.auditLogService.getUserAuditLogs(userId);

    // Log GDPR action
    await this.auditLogService.logGDPRAction('data_export', userId);

    // Remove password hash from export
    const { passwordHash, ...userData } = user;

    return {
      user: userData,
      auditLogs,
      exportDate: new Date().toISOString(),
    };
  }
}
