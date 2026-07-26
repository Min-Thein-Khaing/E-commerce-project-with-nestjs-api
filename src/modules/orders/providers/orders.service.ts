import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from '../dtos/order-create.dto';
import {
  OrderApiResponseDto,
  OrderResponseDto,
} from '../dtos/order-response.dto';
import { OrderStatus } from 'src/generated/prisma/enums';
import { Order, OrderItem, Product, User } from 'src/generated/prisma/client';
import { GetOrderQueryDto } from '../dtos/order-query.dto';
import { PaginationProviderService } from 'src/common/providers/pagination.provider.service';
import { OrderWhereInput } from 'src/generated/prisma/models';
import { UpdateOrderDto } from '../dtos/order-update.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationProviderService: PaginationProviderService,
  ) {}

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
    });

    const orderNo = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const order = await this.prisma.$transaction(async (tx) => {
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
          user: true,
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
        });
      }

      return newOrder;
    });

    return this.wrap(order);
  }

  //get all order
  async getAllOrder(getOrderQueryDto: GetOrderQueryDto): Promise<{
    data: OrderResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
    };
  }> {
    const where: OrderWhereInput = {};

    if (getOrderQueryDto.status) {
      where.status = getOrderQueryDto.status;
    }
    const result = await this.paginationProviderService.paginationQuery(
      getOrderQueryDto,
      this.prisma.order,
      {
        searchFields: ['id', 'userId', 'status', 'orderNo'],
        where,
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      },
    );

    return {
      ...result,
      data: result.data.map(
        (order) =>
          this.wrap(
            order as Order & {
              orderItems: (OrderItem & { product: Product })[];
              user: User;
            },
            'Orders retrieved successfully',
          ).data,
      ),
    };
  }

  async getOwnOrder(userId: string, getOrderQueryDto: GetOrderQueryDto) {
    const where: OrderWhereInput = { userId };

    if (getOrderQueryDto.status) {
      where.status = getOrderQueryDto.status;
    }
    const result = await this.paginationProviderService.paginationQuery(
      getOrderQueryDto,
      this.prisma.order,
      {
        searchFields: ['id', 'userId', 'status', 'orderNo'],
        where,
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      },
    );

    return {
      ...result,
      data: result.data.map(
        (order) =>
          this.wrap(
            order as Order & {
              orderItems: (OrderItem & { product: Product })[];
              user: User;
            },
          ).data,
      ),
    };
  }

  // get a single order, optionally limited to the current user
  async getOneOrder(id: string, userId?: string) {
    const result = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    if (!result) {
      throw new NotFoundException('Order not found');
    }

    if (userId && result.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return this.wrap(result).data;
  }

  // update for admin or user
  async updateOrder(
    id: string,
    updateOrderDto: UpdateOrderDto,
    userId?: string,
  ) {
    const where: OrderWhereInput = { id };
    if (userId) {
      where.userId = userId;
    }

    const existingOrder = await this.prisma.order.findFirst({ where });
    if (!existingOrder) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    return this.wrap(updatedOrder).data;
  }

  //delete admin or user own
  async deleteOrder(id: string, userId?: string) {
    const where: OrderWhereInput = { id };
    if (userId) {
      where.userId = userId;
    }

    const existingOrder = await this.prisma.order.findFirst({
      where,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });
    if (!existingOrder) {
      throw new NotFoundException('Order not found');
    }

    if (existingOrder.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Cannot delete order that is not PENDING');
    }

    const cancelled = await this.prisma.$transaction(async (tx) => {
      for (const orderItem of existingOrder.orderItems) {
        await tx.product.update({
          where: {
            id: orderItem.productId,
          },
          data: {
            stock: { increment: orderItem.quantity },
          },
        });
      }

      return await tx.order.delete({
        where: { id },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      });
    });
    return this.wrap(cancelled).data;
  }

  private wrap(
    order: Order & {
      orderItems: (OrderItem & { product: Product })[];
      user: User;
    },
    message?: string,
  ): OrderApiResponseDto<OrderResponseDto> {
    return {
      success: true,
      ...(message && { message }),
      data: {
        id: order.id,
        status: order.status,
        total: Number(order.totalAmount),
        shippingAddress: order.shippingAddress ?? undefined,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        orderItems: (order.orderItems ?? []).map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.product?.name ?? 'Unknown product',
          price: Number(item.price),
          quantity: item.quantity,
          subTotal: Number(item.price) * item.quantity,
        })),
        ...(order.user && {
          userEmail: order.user.email ?? undefined,
          userName:
            [order.user.firstName, order.user.lastName]
              .filter(Boolean)
              .join(' ')
              .trim() || undefined,
        }),
      },
    };
  }
}
