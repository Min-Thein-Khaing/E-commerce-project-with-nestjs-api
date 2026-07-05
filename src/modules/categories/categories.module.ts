import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './providers/categories.service';
import { PaginationModule } from 'src/common/pagination.module';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  imports: [PaginationModule],
})
export class CategoriesModule {}
