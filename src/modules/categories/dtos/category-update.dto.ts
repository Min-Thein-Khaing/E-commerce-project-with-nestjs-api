import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './category-create.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
