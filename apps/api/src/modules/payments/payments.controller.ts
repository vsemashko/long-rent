import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createPayment(@Request() req, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createPayment(req.user.id, createPaymentDto);
  }

  @Get('my-payments')
  @UseGuards(JwtAuthGuard)
  getMyPayments(@Request() req) {
    return this.paymentsService.getMyPayments(req.user.id);
  }

  @Get('contract/:contractId')
  @UseGuards(JwtAuthGuard)
  getPaymentsByContract(@Request() req, @Param('contractId') contractId: string) {
    return this.paymentsService.getPaymentsByContract(req.user.id, contractId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getPaymentById(@Request() req, @Param('id') id: string) {
    return this.paymentsService.getPaymentById(req.user.id, id);
  }

  // Stripe webhook endpoint
  @Post('webhook')
  handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    const rawBody = request.rawBody;
    if (!rawBody) {
      throw new Error('Missing raw body');
    }
    return this.paymentsService.handleStripeWebhook(signature, rawBody);
  }
}
