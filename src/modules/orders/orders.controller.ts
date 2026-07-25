import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/generated/prisma/enums';
import { OrdersService } from './providers/orders.service';
import { ModerateThrottle } from 'src/common/decorators/custom-throttle.decorator';
import { CreateOrderDto } from './dtos/order-create.dto';
import {
  OrderApiResponseDto,
  OrderResponseDto,
} from './dtos/order-response.dto';
import { GetUser } from 'src/common/decorators/getUser.decorator';

@ApiTags('orders')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth('JWT-auth')
@Roles(Role.ADMIN)
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
}
