import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { SearchPropertyDto } from './dto/search-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(req.user.sub, createPropertyDto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Query() searchDto: SearchPropertyDto) {
    return this.propertiesService.findAll(searchDto);
  }

  @Get('my-properties')
  @UseGuards(JwtAuthGuard)
  getUserProperties(@Request() req) {
    return this.propertiesService.getUserProperties(req.user.sub);
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  getFavorites(@Request() req) {
    return this.propertiesService.getUserFavorites(req.user.sub);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.sub;
    return this.propertiesService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updatePropertyDto: UpdatePropertyDto
  ) {
    return this.propertiesService.update(id, req.user.sub, updatePropertyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.propertiesService.remove(id, req.user.sub);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  toggleFavorite(@Param('id') id: string, @Request() req) {
    return this.propertiesService.toggleFavorite(id, req.user.sub);
  }
}
