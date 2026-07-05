import { Module } from '@nestjs/common';
import { PaginationProviderService } from './providers/pagination.provider.service';

@Module({
  providers: [PaginationProviderService],
  exports: [PaginationProviderService],
})
export class PaginationModule {}
