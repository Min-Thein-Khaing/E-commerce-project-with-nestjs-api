import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoriesResponseDto {
  @ApiProperty({
    description: 'Category ID',
    example: 'sdfdfds-ewrewrw343dd-w43432ff',
  })
  id!: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
    required: true,
  })
  name!: string;
  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Electronics category',
  })
  description?: string | null;
  @ApiProperty({
    description: 'Category slug',
    example: 'electronics',
  })
  slug!: string;
  @ApiProperty({
    description: 'Category image URL',
    example: 'https://example.com/image.jpg',
  })
  imageUrl?: string | null;
  @ApiPropertyOptional({
    description: 'Indicates if the category is active',
    example: true,
  })
  isActive?: boolean;

  @ApiProperty({
    description: 'Product count in the category',
    example: 5,
  })
  productCount!: number;
  @ApiProperty({
    description: 'Category creation date',
    example: new Date(),
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Category last updated date',
    example: new Date(),
  })
  updatedAt!: Date;
}
