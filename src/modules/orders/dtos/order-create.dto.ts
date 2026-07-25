import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class OrderItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: 'sdfdfds-ewrewrw343dd-w43432ff',
  })
  @IsNotEmpty()
  @IsString()
  productId!: string;

  @ApiProperty({
    description: 'Product price in USD',
    example: 99.99,
  })
  @IsNotEmpty()
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'Price must be a number with 2 decimal places',
    },
  )
  price!: number;

  @ApiProperty({
    description: 'Product quantity',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Order items',
    example: [
      {
        productId: 'sdfdfds-ewrewrw343dd-w43432ff',
        price: 99.99,
        quantity: 1,
      },
    ],
    type: [OrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems!: OrderItemDto[];

  @ApiProperty({
    description: 'Shipping address',
    example: '123 Main St, Anytown, USA',
  })
  @IsOptional()
  @IsString()
  shippingAddress?: string;
}
