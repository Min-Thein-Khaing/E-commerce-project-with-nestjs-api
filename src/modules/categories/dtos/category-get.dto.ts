import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { BaseQueryDto } from 'src/common/dtos/base-query.dto';

export enum CategorySortBy {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class GetCategoryQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: CategorySortBy,
    default: CategorySortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(CategorySortBy)
  sortBy: CategorySortBy = CategorySortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Created date from',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startCreatedAt?: string;

  @ApiPropertyOptional({
    description: 'Created date to',
    example: '2026-01-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endCreatedAt?: string;

  @ApiPropertyOptional({
    description: 'Updated date from',
    example: '2026-02-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startUpdatedAt?: string;

  @ApiPropertyOptional({
    description: 'Updated date to',
    example: '2026-02-28T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endUpdatedAt?: string;
}
