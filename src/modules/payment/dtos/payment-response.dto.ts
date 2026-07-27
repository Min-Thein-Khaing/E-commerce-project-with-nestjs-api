import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentResponse {
  @ApiProperty({
    description: 'stripe client secret key',
    example: 'sdfdfds-ewrewrw343dd-w43432ff',
  })
  clientSecret!: string;

  @ApiProperty({
    example: '4905-sdfdfds-ewrewrw343dd-w43432ff',
    description: 'Payment id in database',
  })
  paymentId!: string;
}
export class PaymentResponseDto {
  @ApiProperty({
    description: 'Success status of the request',
    example: 'sdfdfds-ewrewrw343dd-w43432ff',
  })
  id!: string;

  @ApiProperty({
    description: 'Success status of the request',
    example: 'sdfdfds-ewrewrw343dd-w43432ff',
  })
  orderId!: string;

  @ApiProperty({
    description: 'must be number',
    example: 99.99,
  })
  amount!: number;

  @ApiProperty({
    description: 'need userId',
    example: 'sdfdfds-ewrewrw343dd-w43432ff',
  })
  userId!: string;

  @ApiProperty({
    description: 'Success status of the request',
    example: 'USD',
  })
  currency!: string;

  @ApiProperty({
    description: 'Success status of the request',
    example: ['PENDING', 'COMPLETED', 'FAILED', 'REFUND'],
  })
  status!: string;

  @ApiProperty({
    description: 'Method of payment',
    example: 'card',
  })
  paymentMethod?: string | null;

  @ApiProperty({
    description: 'Transaction ID',
    example: 'sdfdfds-ewrewrw343dd-w43432ff',
  })
  transactionId?: string | null;

  @ApiProperty({
    description: 'Success status of the request',
    example: new Date(),
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Success status of the request',
    example: new Date(),
  })
  updatedAt!: Date;
}

export class PaymentApiResponseDto {
  @ApiProperty({
    description: 'Success status of the request',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Success status of the request',
    type: PaymentResponseDto,
  })
  data!: PaymentResponseDto;

  @ApiProperty({
    description: 'payment success full',
  })
  message?: string;
}

export class CreatePaymentApiResponseDto {
  @ApiProperty({
    description: 'Success status of the request',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Success status of the request',
    type: CreatePaymentIntentResponse,
  })
  data!: CreatePaymentIntentResponse;

  @ApiProperty({
    description: 'payment create successfully ',
  })
  message?: string;
}
