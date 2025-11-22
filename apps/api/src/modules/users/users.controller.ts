import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { UpdateProfileDto, UpdateNotificationSettingsDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user profile
   */
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  /**
   * Update current user profile
   */
  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  /**
   * Update notification settings
   */
  @Patch('me/settings')
  @ApiOperation({ summary: 'Update notification settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateNotificationSettings(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    return this.usersService.updateNotificationSettings(userId, dto);
  }

  /**
   * Export user data (GDPR data portability)
   */
  @Get('me/export')
  @ApiOperation({ summary: 'Export user data (GDPR data portability)' })
  @ApiResponse({ status: 200, description: 'Data exported successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async exportData(@CurrentUser('id') userId: string) {
    return this.usersService.exportData(userId);
  }

  /**
   * Delete user account (GDPR right to erasure)
   */
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user account (GDPR right to erasure)' })
  @ApiResponse({ status: 200, description: 'Account marked for deletion' })
  @ApiResponse({ status: 400, description: 'Cannot delete account with active contracts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteAccount(@CurrentUser('id') userId: string) {
    return this.usersService.deleteAccount(userId);
  }
}
