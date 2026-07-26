import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BaseQueryDto } from 'src/common/dtos/base-query.dto';

export enum OrderSortBy {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class GetOrderQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: OrderSortBy,
    default: OrderSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(OrderSortBy)
  sortBy: OrderSortBy = OrderSortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Order status',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus = OrderStatus.PENDING;
}
