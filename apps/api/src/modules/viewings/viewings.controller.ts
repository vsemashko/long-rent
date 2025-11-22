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
import { ViewingsService } from './viewings.service';
import { CreateViewingDto, UpdateViewingDto } from './dto/viewing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('viewings')
@UseGuards(JwtAuthGuard)
export class ViewingsController {
  constructor(private readonly viewingsService: ViewingsService) {}

  @Post()
  create(@Request() req: any, @Body() createViewingDto: CreateViewingDto) {
    return this.viewingsService.create(req.user.sub, createViewingDto);
  }

  @Get('my-viewings')
  getUserViewings(@Request() req: any) {
    return this.viewingsService.getUserViewings(req.user.sub);
  }

  @Get('landlord-viewings')
  getLandlordViewings(@Request() req: any) {
    return this.viewingsService.getLandlordViewings(req.user.sub);
  }

  @Get('property/:propertyId')
  getPropertyViewings(@Param('propertyId') propertyId: string, @Request() req: any) {
    return this.viewingsService.getPropertyViewings(propertyId, req.user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() updateViewingDto: UpdateViewingDto) {
    return this.viewingsService.update(id, req.user.sub, updateViewingDto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.viewingsService.cancel(id, req.user.sub);
  }
}
