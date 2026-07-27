import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { BaseQueryDto } from 'src/common/dtos/base-query.dto';

export class PaymentGetDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Search by name or description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sortBy?: string;
}
