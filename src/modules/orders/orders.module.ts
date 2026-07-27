import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './providers/orders.service';
import { PaginationModule } from 'src/common/pagination.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [PaginationModule],
})
export class OrdersModule {}
