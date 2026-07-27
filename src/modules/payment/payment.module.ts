import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './provider/payment.service';
import { PaginationModule } from 'src/common/pagination.module';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  imports: [PaginationModule],
})
export class PaymentModule {}
