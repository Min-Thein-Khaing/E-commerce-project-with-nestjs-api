import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/generated/prisma/enums';
import { OrdersService } from './providers/orders.service';
import {
  ModerateThrottle,
  RelaxedThrottle,
} from 'src/common/decorators/custom-throttle.decorator';
import { CreateOrderDto } from './dtos/order-create.dto';
import {
  OrderApiResponseDto,
  OrderResponseDto,
} from './dtos/order-response.dto';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { GetOrderQueryDto } from './dtos/order-query.dto';
import { UpdateOrderDto } from './dtos/order-update.dto';

@ApiTags('orders')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth('JWT-auth')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Post()
  @ModerateThrottle()
  @ApiBody({
    type: CreateOrderDto,
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: OrderApiResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too Many Requests - rate limit',
  })
  async createOrder(
    @GetUser('id') userId: string,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    return await this.orderService.createOrder(userId, createOrderDto);
  }

  //admin get all Order (admin only)
  @Roles(Role.ADMIN)
  @Get('admin/all')
  @RelaxedThrottle()
  @ApiOperation({
    summary: 'Admin get all orders',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Success Response',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            orders: {
              type: 'array',
              items: {
                $ref: getSchemaPath(OrderResponseDto),
              },
            },
            meta: {
              type: 'object',
              properties: {
                total: {
                  type: 'number',
                },
                page: {
                  type: 'number',
                },
                limit: {
                  type: 'number',
                },
                totalPages: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
    },
  })
  async getAllOrder(@Query() getOrderQueryDto: GetOrderQueryDto) {
    return await this.orderService.getAllOrder(getOrderQueryDto);
  }

  //get own order
  @Get()
  @RelaxedThrottle()
  @ApiOperation({
    summary: 'Get own orders',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Success Response',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            orders: {
              type: 'array',
              items: {
                $ref: getSchemaPath(OrderResponseDto),
              },
            },
            meta: {
              type: 'object',
              properties: {
                total: {
                  type: 'number',
                },
                page: {
                  type: 'number',
                },
                limit: {
                  type: 'number',
                },
                totalPages: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
    },
  })
  async getOwnOrder(
    @GetUser('id') userId: string,
    @Query() getOrderQueryDto: GetOrderQueryDto,
  ) {
    return await this.orderService.getOwnOrder(userId, getOrderQueryDto);
  }

  //get order (admin:id) (admin only)
  @Roles(Role.ADMIN)
  @Get('admin/:id')
  @RelaxedThrottle()
  @ApiOperation({
    summary: 'Admin get order by id',
  })
  @ApiParam({
    name: 'id',
  })
  @ApiResponse({
    status: 200,
    description: 'Success Response',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit',
  })
  async getAdminOrder(@Param('id') id: string) {
    return await this.orderService.getOneOrder(id);
  }

  //get order public
  @Get(':id')
  @RelaxedThrottle()
  @ApiOperation({
    summary: 'Get order by id',
  })
  @ApiParam({
    name: 'id',
  })
  @ApiResponse({
    status: 200,
    description: 'Success Response',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit',
  })
  async getOrderId(@Param('id') id: string, @GetUser('id') userId: string) {
    return await this.orderService.getOneOrder(id, userId);
  }

  //update for admin
  @Patch('admin/:id')
  @Roles(Role.ADMIN)
  @ModerateThrottle()
  @ApiOperation({
    summary: 'Admin update order by id',
  })
  @ApiParam({
    name: 'id',
  })
  @ApiBody({
    type: UpdateOrderDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Success Response',
    type: OrderResponseDto,
  })
  async updateOrderAdmin(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return await this.orderService.updateOrder(id, updateOrderDto);
  }

  //update for user
  @Patch(':id')
  @ModerateThrottle()
  @ApiOperation({
    summary: 'Update order by id',
  })
  @ApiParam({
    name: 'id',
  })
  @ApiBody({
    type: UpdateOrderDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Success Response',
    type: OrderResponseDto,
  })
  async updateOrderUser(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @GetUser('id') userId: string,
  ) {
    return await this.orderService.updateOrder(id, updateOrderDto, userId);
  }

  //admin delete
  @Delete('admin/:id')
  @Roles(Role.ADMIN)
  @ModerateThrottle()
  @ApiOperation({
    summary: 'Admin delete order by id',
  })
  @ApiParam({
    name: 'id',
  })
  @ApiResponse({
    status: 200,
    description: 'Success Response',
  })
  async deleteOrderAdmin(@Param('id') id: string) {
    return await this.orderService.deleteOrder(id);
  }

  //Delete(':id')
  @Delete(':id')
  @ModerateThrottle()
  @ApiOperation({
    summary: 'Delete order by id',
  })
  @ApiParam({
    name: 'id',
  })
  @ApiResponse({
    status: 200,
    description: 'Success Response',
  })
  async deleteOrderUser(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    return await this.orderService.deleteOrder(id, userId);
  }

  //own delete order
  @Delete(':id')
  @ModerateThrottle()
  @ApiOperation({
    summary: 'Delete order by id',
  })
  @ApiParam({
    name: 'id',
  })
  @ApiResponse({
    status: 200,
    description: 'Success Response',
  })
  async deleteOwnOrder(@Param('id') id: string, @GetUser('id') userId: string) {
    return await this.orderService.deleteOrder(id, userId);
  }
}
