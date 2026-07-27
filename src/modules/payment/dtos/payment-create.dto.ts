import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: '4905-sdfdfds-ewrewrw343dd-w43432ff' })
  @IsNotEmpty()
  @IsString()
  orderId!: string;

  @ApiProperty({ example: 99.99 })
  @IsNotEmpty()
  @IsString()
  amount!: number;

  @ApiProperty({ example: 'sdfdfds-ewrewrw343dd-w43432ff' })
  @IsOptional()
  @IsNumber()
  userId!: string;

  @ApiProperty({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string = 'usd';

  @ApiProperty({
    description: 'Payment description',
    example: 'Payment for order 123',
  })
  @IsOptional()
  description?: string;
}
