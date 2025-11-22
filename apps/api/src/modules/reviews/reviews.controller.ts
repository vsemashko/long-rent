import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.createReview(req.user.id, createReviewDto);
  }

  @Get('my-reviews')
  getMyReviews(@Request() req) {
    return this.reviewsService.getMyReviews(req.user.id);
  }

  @Get('about-me')
  getReviewsAboutMe(@Request() req) {
    return this.reviewsService.getReviewsAboutMe(req.user.id);
  }

  @Get('pending')
  getPendingReviews(@Request() req) {
    return this.reviewsService.getPendingReviews(req.user.id);
  }

  @Get('user/:userId')
  getReviewsByUser(@Request() req, @Param('userId') userId: string) {
    return this.reviewsService.getReviewsByUser(req.user.id, userId);
  }

  @Get('user/:userId/stats')
  getUserRatingStats(@Param('userId') userId: string) {
    return this.reviewsService.getUserRatingStats(userId);
  }

  @Get(':id')
  getReviewById(@Request() req, @Param('id') id: string) {
    return this.reviewsService.getReviewById(req.user.id, id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.updateReview(req.user.id, id, updateReviewDto);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.reviewsService.deleteReview(req.user.id, id);
  }
}
