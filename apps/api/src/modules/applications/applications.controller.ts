import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationDto } from './dto/application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@Request() req: any, @Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create(req.user.sub, createApplicationDto);
  }

  @Get('my-applications')
  getMyApplications(@Request() req: any) {
    return this.applicationsService.getMyApplications(req.user.sub);
  }

  @Get('landlord-applications')
  getLandlordApplications(@Request() req: any) {
    return this.applicationsService.getLandlordApplications(req.user.sub);
  }

  @Get('property/:propertyId')
  getPropertyApplications(@Param('propertyId') propertyId: string, @Request() req: any) {
    return this.applicationsService.getPropertyApplications(propertyId, req.user.sub);
  }

  @Get('property/:propertyId/count')
  getApplicationCount(@Param('propertyId') propertyId: string) {
    return this.applicationsService.getApplicationCount(propertyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return this.applicationsService.update(id, req.user.sub, updateApplicationDto);
  }

  @Post(':id/withdraw')
  @HttpCode(HttpStatus.OK)
  withdraw(@Param('id') id: string, @Request() req: any) {
    return this.applicationsService.withdraw(id, req.user.sub);
  }
}
