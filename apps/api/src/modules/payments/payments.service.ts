import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePaymentDto } from './dto';
import { PaymentStatus } from '@prisma/client';
// Stripe will be installed later: import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  // private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    // Initialize Stripe (uncomment when Stripe is installed)
    // const stripeKey = process.env.STRIPE_SECRET_KEY;
    // if (!stripeKey) {
    //   throw new Error('STRIPE_SECRET_KEY is not set');
    // }
    // this.stripe = new Stripe(stripeKey, {
    //   apiVersion: '2023-10-16',
    // });
  }

  async createPayment(userId: string, createPaymentDto: CreatePaymentDto) {
    // Verify contract exists and user is authorized
    const contract = await this.prisma.rentalContract.findUnique({
      where: { id: createPaymentDto.contractId },
      include: {
        landlord: true,
        tenant: true,
      },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Verify user is the tenant
    if (contract.tenantId !== userId) {
      throw new BadRequestException('You are not authorized to make payments for this contract');
    }

    // Create payment intent with Stripe (placeholder for now)
    // const paymentIntent = await this.stripe.paymentIntents.create({
    //   amount: Math.round(createPaymentDto.amount * 100), // Convert to cents
    //   currency: createPaymentDto.currency || 'pln',
    //   payment_method: createPaymentDto.paymentMethodId,
    //   metadata: {
    //     contractId: createPaymentDto.contractId,
    //     paymentType: createPaymentDto.type,
    //     ...createPaymentDto.metadata,
    //   },
    //   confirm: false,
    // });

    // Create payment record in database
    const payment = await this.prisma.payment.create({
      data: {
        contractId: createPaymentDto.contractId,
        payerId: userId,
        payeeId: contract.landlordId,
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency || 'PLN',
        type: createPaymentDto.type,
        status: PaymentStatus.PENDING,
        // paymentIntentId: paymentIntent.id,
        paymentMethodId: createPaymentDto.paymentMethodId,
        metadata: createPaymentDto.metadata,
      },
      include: {
        contract: {
          include: {
            property: true,
          },
        },
        payer: {
          include: {
            profile: true,
          },
        },
        payee: {
          include: {
            profile: true,
          },
        },
      },
    });

    return {
      ...payment,
      // clientSecret: paymentIntent.client_secret,
    };
  }

  async getPaymentsByContract(userId: string, contractId: string) {
    // Verify user has access to this contract
    const contract = await this.prisma.rentalContract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.landlordId !== userId && contract.tenantId !== userId) {
      throw new BadRequestException('You are not authorized to view payments for this contract');
    }

    return this.prisma.payment.findMany({
      where: { contractId },
      include: {
        payer: {
          include: {
            profile: true,
          },
        },
        payee: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getMyPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: {
        OR: [
          { payerId: userId },
          { payeeId: userId },
        ],
      },
      include: {
        contract: {
          include: {
            property: true,
          },
        },
        payer: {
          include: {
            profile: true,
          },
        },
        payee: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getPaymentById(userId: string, paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        contract: {
          include: {
            property: true,
          },
        },
        payer: {
          include: {
            profile: true,
          },
        },
        payee: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.payerId !== userId && payment.payeeId !== userId) {
      throw new BadRequestException('You are not authorized to view this payment');
    }

    return payment;
  }

  async confirmPayment(paymentId: string) {
    // This would be called by Stripe webhook
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.COMPLETED,
        processedAt: new Date(),
      },
      include: {
        contract: {
          include: {
            property: true,
          },
        },
        payer: {
          include: {
            profile: true,
          },
        },
        payee: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async failPayment(paymentId: string, failureReason: string) {
    // This would be called by Stripe webhook
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.FAILED,
        failureReason,
      },
    });
  }

  // Stripe webhook handler (placeholder)
  async handleStripeWebhook(signature: string, rawBody: Buffer) {
    // const event = this.stripe.webhooks.constructEvent(
    //   rawBody,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET!
    // );

    // switch (event.type) {
    //   case 'payment_intent.succeeded':
    //     const paymentIntent = event.data.object;
    //     await this.confirmPayment(paymentIntent.metadata.paymentId);
    //     break;
    //   case 'payment_intent.payment_failed':
    //     const failedIntent = event.data.object;
    //     await this.failPayment(
    //       failedIntent.metadata.paymentId,
    //       failedIntent.last_payment_error?.message || 'Payment failed'
    //     );
    //     break;
    // }

    return { received: true };
  }
}
