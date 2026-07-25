import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from '../dtos/order-create.dto';
import {
  OrderApiResponseDto,
  OrderResponseDto,
} from '../dtos/order-response.dto';
import { OrderStatus } from 'src/generated/prisma/enums';
import { Order, OrderItem, Product, User } from 'src/generated/prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) { }

  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    const { orderItems, shippingAddress } = createOrderDto;

    for (const orderItem of orderItems) {
      const product = await this.prisma.product.findUnique({
        where: { id: orderItem.productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (product.stock < orderItem.quantity) {
        throw new NotFoundException('Product out of stock');
      }
    }

    const total = orderItems.reduce((pv, cv) => pv + cv.price * cv.quantity, 0);

    const latestCart = await this.prisma.cart.findFirst({
      where: {
        userId,
        checkOut: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const order = (await this.prisma.$transaction(async (tx) => {
      const orderNo = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder = await tx.order.create({
        data: {
          orderNo,
          userId,
          status: OrderStatus.PENDING,
          totalAmount: total,
          shippingAddress,
          cartId: latestCart?.id,
          orderItems: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: true

        },
      });

      for (const orderItem of orderItems) {
        await tx.product.update({
          where: {
            id: orderItem.productId,
          },
          data: {
            stock: { decrement: orderItem.quantity },
          },
        })
      }


      return newOrder;
    })) as Order & { orderItems: (OrderItem & { product: Product })[], user: User };

    return this.wrap(order);
  }

  private wrap(order: Order & { orderItems: (OrderItem & { product: Product })[], user: User }): OrderApiResponseDto<OrderResponseDto> {
    return {
      success: true,
      message: 'Order created successfully',
      data: {
        id: order.id,
        status: order.status,
        total: Number(order.totalAmount),
        shippingAddress: order.shippingAddress ?? undefined,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        orderItems: order.orderItems.map((item) => ({
          item: item.id,
          productId: item.productId,
          productName: item.product.name,
          price: Number(item.price),
          quantity: item.quantity,
          subTotal: Number(item.price) * item.quantity,
        })),
        ...(order.user && {
          userEmail: order.user.email,
          userName: `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim(),
        })
      },
    }
  };
}



