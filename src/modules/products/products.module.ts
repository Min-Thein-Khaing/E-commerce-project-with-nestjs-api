import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductService } from './providers/product.service';
import { PaginationModule } from 'src/common/pagination.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductService],
  imports: [PaginationModule],
})
export class ProductsModule {}
