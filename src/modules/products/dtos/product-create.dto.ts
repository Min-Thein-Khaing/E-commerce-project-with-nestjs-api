import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Product 1',
    required: true,
  })
  @MaxLength(50)
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Product 1 description',
    required: false,
  })
  @MaxLength(255)
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Product price in USD',
    example: 99.99,
    required: true,
    minimum: 0,
  })
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  @Type(() => Number)
  price!: number;

  @ApiProperty({
    description: 'Product stock',
    example: 0,
    required: true,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock!: number;

  @ApiProperty({
    description: 'Product SKU',
    example: 'sku-123',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    description: 'Product category ID',
    example: 'sdfdfds-ewrewrw343dd-w43432ff',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({
    description: 'Indicates if the product is active',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive!: boolean;
}
