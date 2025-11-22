import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuditLogService } from '../../common/audit-log.service';
import { LoggerService } from '../../common/logger.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, AuditLogService, LoggerService],
  exports: [UsersService],
})
export class UsersModule {}
