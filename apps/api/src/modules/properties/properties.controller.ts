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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { SearchPropertyDto } from './dto/search-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

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

  @Post(':id/photos')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/properties',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    })
  )
  uploadPhoto(
    @Param('id') id: string,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('caption') caption?: string
  ) {
    return this.propertiesService.uploadPhoto(id, req.user.sub, file, caption);
  }

  @Delete(':id/photos/:photoId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePhoto(
    @Param('id') id: string,
    @Param('photoId') photoId: string,
    @Request() req
  ) {
    return this.propertiesService.deletePhoto(id, photoId, req.user.sub);
  }

  @Patch(':id/photos/reorder')
  @UseGuards(JwtAuthGuard)
  reorderPhotos(
    @Param('id') id: string,
    @Request() req,
    @Body('photos') photos: { id: string; order: number }[]
  ) {
    return this.propertiesService.reorderPhotos(id, req.user.sub, photos);
  }
}
