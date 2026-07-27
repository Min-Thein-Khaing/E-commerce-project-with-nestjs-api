import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
import { CreatePaymentDto } from '../dtos/payment-create.dto';
import { OrderStatus, PaymentStatus } from 'src/generated/prisma/enums';
import { ConfirmPaymentDto } from '../dtos/payment-confirm.dto';
import { Prisma } from 'src/generated/prisma/client';
import { PaymentResponseDto } from '../dtos/payment-response.dto';
import { PaginationProviderService } from 'src/common/providers/pagination.provider.service';
import { PaymentGetDto } from '../dtos/payment-get.dto';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationProviderService: PaginationProviderService,
  ) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      throw new Error('Missing Stripe secret key');
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2026-06-24.dahlia',
    });
  }

  async createPaymentIntent(
    userId: string,
    createPaymentDto: CreatePaymentDto,
  ): Promise<{
    success: boolean;
    data: { clientSecret: string; paymentId: string };
    message?: string;
  }> {
    const { amount, currency = 'usd', orderId } = createPaymentDto;

    const order = await this.prisma.order.findFirst({ where: { id: orderId } });
    if (!order) {
      throw new Error('Order not found');
    }

    const existPayment = await this.prisma.payment.findFirst({
      where: { orderId: orderId },
    });
    if (existPayment && existPayment.status === 'COMPLETED') {
      throw new BadRequestException('Payment already completed');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { userId, orderId },
    });

    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        userId,
        currency,
        status: PaymentStatus.PENDING,
        paymentMethod: 'STRIPE',
        transactionId: paymentIntent.id,
      },
    });

    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret!,
        paymentId: payment.id,
      },
      message: 'Payment intent created successfully',
    };
  }
  //confirm service
  async confirmPayment(userId: string, confirmPaymentDto: ConfirmPaymentDto) {
    const { paymentIntentId, orderId } = confirmPaymentDto;

    const payment = await this.prisma.payment.findFirst({
      where: {
        orderId,
        userId,
        transactionId: paymentIntentId,
      },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (payment.status === 'COMPLETED') {
      throw new BadRequestException('Payment already completed');
    }

    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment failed');
    }

    const [updatePayment] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.COMPLETED },
        select: {
          id: true,
          orderId: true,
          userId: true,
          currency: true,
          status: true,
          paymentMethod: true,
          transactionId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PROCESSING },
      }),
    ]);

    const order = await this.prisma.order.findFirst({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });
    if (order?.cartId) {
      await this.prisma.cart.update({
        where: { id: order.cartId },
        data: {
          checkOut: true,
        },
      });
    }

    return {
      success: true,
      data: this.mapToPaymentResponse(updatePayment),
      message: 'Payment confirmed successfully',
    };
  }

  //get all payment
  async getAllPayment(
    userId: string,
    paymentGetDto: PaymentGetDto,
  ): Promise<{
    success: boolean;
    data: PaymentResponseDto[];
    message?: string;
  }> {
    const where: Prisma.PaymentWhereInput = {
      userId,
    };
    const payments = await this.paginationProviderService.paginationQuery(
      paymentGetDto,
      this.prisma.payment,
      {
        searchFields: ['userId', 'orderId', 'transactionId'],
        where,
      },
    );
    if (!payments || !payments.data) {
      throw new BadRequestException('Payment not found');
    }

    return {
      success: true,
      data: payments.data.map((payment) => this.mapToPaymentResponse(payment)),
      message: 'Payments fetched successfully',
    };
  }

  //get payment id
  async getPaymentById(id: string, userId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        userId,
      },
    });
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }
    return {
      success: true,
      data: this.mapToPaymentResponse(payment),
      message: 'Payment fetched successfully',
    };
  }
  //getorder in payment in id
  async getPaymentByOrderId(orderId: string, userId: string) {
    const getOrder = await this.prisma.payment.findFirst({
      where: {
        orderId,
        userId,
      },
    });
    if (!getOrder) {
      throw new BadRequestException('Payment not found');
    }

    return {
      success: true,
      data: this.mapToPaymentResponse(getOrder),
      message: 'Payment fetched successfully',
    };
  }
  private mapToPaymentResponse(payment: {
    id: string;
    orderId: string;
    userId: string;
    // amount may not exist in the schema in some projects, accept number | Prisma.Decimal | null | undefined
    amount?: Prisma.Decimal | number | null;
    currency: string;
    status: PaymentStatus;
    paymentMethod: string | null;
    transactionId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): PaymentResponseDto {
    const amountNumber =
      payment.amount == null
        ? 0
        : typeof payment.amount === 'number'
          ? payment.amount
          : payment.amount.toNumber();

    return {
      id: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      currency: payment.currency,
      amount: amountNumber,
      status: String(payment.status),
      paymentMethod: payment.paymentMethod ?? '',
      transactionId: payment.transactionId ?? '',
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
