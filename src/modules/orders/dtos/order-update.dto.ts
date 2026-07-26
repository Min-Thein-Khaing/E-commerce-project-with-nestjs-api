import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from 'src/generated/prisma/enums';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
