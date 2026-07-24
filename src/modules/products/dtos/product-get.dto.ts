import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BaseQueryDto } from 'src/common/dtos/base-query.dto';

export enum ProductSortBy {
  NAME = 'name',
  PRICE = 'price',
  STOCK = 'stock',
  SKU = 'sku',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}
export class GetProductDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ProductSortBy,
    default: ProductSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy: ProductSortBy = ProductSortBy.CREATED_AT;
}
