import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './product-create.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
