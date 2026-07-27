import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PaymentService } from './provider/payment.service';
import { CreatePaymentDto } from './dtos/payment-create.dto';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import {
  CreatePaymentIntentResponse,
  PaymentApiResponseDto,
} from './dtos/payment-response.dto';
import { ConfirmPaymentDto } from './dtos/payment-confirm.dto';
import { PaymentGetDto } from './dtos/payment-get.dto';
@ApiTags('payment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @Post('create-intent')
  @ApiOperation({
    summary: 'Create payment intent',
    description: 'Create payment intent for order',
  })
  @ApiCreatedResponse({
    description: 'Payment intent created',
    type: CreatePaymentIntentResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async createPaymentIntent(
    @GetUser('id') userId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return await this.paymentService.createPaymentIntent(
      userId,
      createPaymentDto,
    );
  }

  //confirm payment
  @Post('confirm')
  @ApiOperation({
    summary: 'Confirm payment',
    description: 'Confirm payment for order',
  })
  @ApiCreatedResponse({
    description: 'Payment intent created',
    type: PaymentApiResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async confirmPayment(
    @GetUser('id') userId: string,
    @Body() confirmPaymentDto: ConfirmPaymentDto,
  ) {
    return await this.paymentService.confirmPayment(userId, confirmPaymentDto);
  }

  //current user payment getAll
  @Post('getAll')
  @ApiOperation({
    summary: 'Get all payment',
    description: 'Get all payment for user',
  })
  @ApiCreatedResponse({
    description: 'Payment intent created',
    type: PaymentApiResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async getAllPayment(
    @GetUser('id') userId: string,
    @Query() paymentGetDto: PaymentGetDto,
  ) {
    return await this.paymentService.getAllPayment(userId, paymentGetDto);
  }

  //payment getid
  @Get(':id')
  @ApiOperation({
    summary: 'Get payment by id',
    description: 'Get payment by id',
  })
  @ApiOkResponse({
    description: 'Payment intent created',
    type: PaymentApiResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async getPaymentById(@Param('id') id: string, @GetUser('id') userId: string) {
    return await this.paymentService.getPaymentById(userId, id);
  }

  //get order id in payment
  @Get('order/:id')
  @ApiOperation({
    summary: 'Get payment by order id',
    description: 'Get payment by order id',
  })
  @ApiOkResponse({
    description: 'Payment intent created',
    type: PaymentApiResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async getPaymentByOrderId(
    @Param('id') orderId: string,
    @GetUser('id') userId: string,
  ) {
    return await this.paymentService.getPaymentByOrderId(orderId, userId);
  }
}
