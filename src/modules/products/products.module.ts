import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductService } from './providers/product.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductService],
})
export class ProductsModule {}
