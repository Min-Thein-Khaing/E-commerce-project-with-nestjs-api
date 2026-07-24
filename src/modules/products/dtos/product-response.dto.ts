import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({
    description: 'Product ID',
    example: 'sdfdfds-ewrewrw343dd-w43432ff',
  })
  id!: string;

  @ApiProperty({
    description: 'Product name',
    example: 'electronic',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'electronic description',
  })
  description?: string | null;

  @ApiProperty({
    description: 'Product price in USD',
    example: 99.99,
  })
  price!: number;

  @ApiProperty({
    description: 'Product stock',
    example: 10,
  })
  stock!: number;

  @ApiProperty({
    description: 'Product SKU',
    example: 'sk-1234',
  })
  sku!: string;

  @ApiProperty({
    description: 'Product category ID',
    example: 'sdfdfds-ewrewrw343dd-w43432ff',
  })
  categoryId!: string | null;

  @ApiProperty({
    description: 'Product category name',
    example: 'Electronics',
  })
  categoryName!: string;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/image.jpg',
  })
  imageUrl?: string | null;

  @ApiProperty({
    description: 'Indicates if the product is active',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Product creation date',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Product last updated date',
  })
  updatedAt!: Date;
}
