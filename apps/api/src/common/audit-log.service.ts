import { Injectable } from '@nestjs/common';
import { prisma } from '@homemore/database';

export interface AuditLogData {
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  /**
   * Create an audit log entry
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          changes: data.changes,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      // Log error but don't fail the operation
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * Log user authentication events
   */
  async logAuth(
    action: 'login' | 'logout' | 'register' | 'password_reset',
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: `auth_${action}`,
      entity: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log GDPR-related actions
   */
  async logGDPRAction(
    action: 'data_export' | 'data_deletion' | 'consent_given' | 'consent_withdrawn',
    userId: string,
    details?: any
  ): Promise<void> {
    await this.log({
      userId,
      action: `gdpr_${action}`,
      entity: 'user',
      entityId: userId,
      changes: details,
    });
  }

  /**
   * Log property changes
   */
  async logPropertyChange(
    action: 'create' | 'update' | 'delete',
    propertyId: string,
    userId: string,
    changes?: any
  ): Promise<void> {
    await this.log({
      userId,
      action: `property_${action}`,
      entity: 'property',
      entityId: propertyId,
      changes,
    });
  }

  /**
   * Log payment transactions
   */
  async logPayment(
    action: 'initiated' | 'completed' | 'failed' | 'refunded',
    paymentId: string,
    userId: string,
    amount: number,
    currency: string
  ): Promise<void> {
    await this.log({
      userId,
      action: `payment_${action}`,
      entity: 'payment',
      entityId: paymentId,
      changes: { amount, currency },
    });
  }

  /**
   * Get audit logs for a user (GDPR data export)
   */
  async getUserAuditLogs(userId: string) {
    return await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get audit logs for an entity
   */
  async getEntityAuditLogs(entity: string, entityId: string) {
    return await prisma.auditLog.findMany({
      where: {
        entity,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
