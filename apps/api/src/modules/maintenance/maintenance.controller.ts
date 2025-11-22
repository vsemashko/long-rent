import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateIssueDto, UpdateIssueDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('maintenance')
@UseGuards(JwtAuthGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post('issues')
  createIssue(@Request() req, @Body() createIssueDto: CreateIssueDto) {
    return this.maintenanceService.createIssue(req.user.id, createIssueDto);
  }

  @Get('issues/my-issues')
  getMyIssues(@Request() req) {
    return this.maintenanceService.getMyIssues(req.user.id);
  }

  @Get('issues/landlord-issues')
  getLandlordIssues(@Request() req) {
    return this.maintenanceService.getLandlordIssues(req.user.id);
  }

  @Get('issues/property/:propertyId')
  getIssuesByProperty(@Request() req, @Param('propertyId') propertyId: string) {
    return this.maintenanceService.getIssuesByProperty(req.user.id, propertyId);
  }

  @Get('issues/stats')
  getIssueStats(@Request() req, @Query('propertyId') propertyId?: string) {
    return this.maintenanceService.getIssueStats(req.user.id, propertyId);
  }

  @Get('issues/:id')
  getIssueById(@Request() req, @Param('id') id: string) {
    return this.maintenanceService.getIssueById(req.user.id, id);
  }

  @Patch('issues/:id')
  updateIssue(@Request() req, @Param('id') id: string, @Body() updateIssueDto: UpdateIssueDto) {
    return this.maintenanceService.updateIssue(req.user.id, id, updateIssueDto);
  }

  @Delete('issues/:id')
  deleteIssue(@Request() req, @Param('id') id: string) {
    return this.maintenanceService.deleteIssue(req.user.id, id);
  }
}
