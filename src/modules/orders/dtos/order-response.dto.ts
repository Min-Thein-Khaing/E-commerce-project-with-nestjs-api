import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderApiResponseDto<T> {
  @ApiProperty({
    description: 'Success status of the request',
  })
  success!: boolean;

  @ApiProperty({
    description: 'Object Data returned by the request',
    type: Object,
  })
  data!: T;

  @ApiPropertyOptional({
    description: 'Optional Message',
    required: false,
    nullable: true,
  })
  message?: string;
}

export class orderItemResponseDto {
  @ApiProperty({
    description: 'Order item ID',
  })
  id!: string;

  @ApiProperty({
    description: 'Product ID',
  })
  productId!: string;

  @ApiProperty({
    description: 'Product name',
  })
  productName!: string;

  @ApiProperty({
    description: 'Product price in USD',
  })
  price!: number;

  @ApiProperty({
    description: 'Product quantity',
  })
  quantity!: number;

  @ApiProperty({
    description: 'Product sub total',
  })
  subTotal!: number;
}

export class OrderResponseDto {
  @ApiProperty({
    description: 'Order ID',
  })
  id!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  shippingAddress?: string;

  @ApiPropertyOptional({
    description: 'User email',
    required: false,
    nullable: true,
  })
  userEmail?: string;

  @ApiPropertyOptional({
    description: 'User full name',
    required: false,
    nullable: true,
  })
  userName?: string;

  @ApiProperty()
  orderItems!: orderItemResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
