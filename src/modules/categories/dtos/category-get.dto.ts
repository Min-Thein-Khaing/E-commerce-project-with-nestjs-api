import { BaseQueryDto } from 'src/common/dtos/base-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

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
}
