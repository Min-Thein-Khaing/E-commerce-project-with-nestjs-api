import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from '../dtos/category-create.dto';
import { CategoriesResponseDto } from '../dtos/category-response.dto';
import { Category } from 'src/generated/prisma/client';
import { GetCategoryQueryDto } from '../dtos/category-get.dto';
import { PaginationProviderService } from 'src/common/providers/pagination.provider.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly paginationProviderService: PaginationProviderService,
    private readonly prisma: PrismaService,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoriesResponseDto> {
    const { name, slug, ...rest } = createCategoryDto;
    const nameToChgSlug =
      slug ??
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const categoryExists = await this.prisma.category.findUnique({
      where: { slug: nameToChgSlug },
    });
    if (categoryExists)
      throw new RequestTimeoutException('Category Slug already exists');

    const category = await this.prisma.category.create({
      data: {
        name,
        slug: nameToChgSlug,
        ...rest,
      },
    });

    return this.formatCategory(category, 0);
  }

  private formatCategory(
    category: Category,
    productCount: number,
  ): CategoriesResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      slug: category.slug,
      imageUrl: category.imageUrl,
      isActive: category.isActive,
      productCount,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  //get all categorise
  async getAllCategories(getCategoryQueryDto: GetCategoryQueryDto) {
    return await this.paginationProviderService.paginationQuery(
      getCategoryQueryDto,
      this.prisma.category,
      ['name', 'slug'],
    );
  }
}
