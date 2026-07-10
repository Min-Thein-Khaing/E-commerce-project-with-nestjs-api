import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from '../dtos/category-create.dto';
import { CategoriesResponseDto } from '../dtos/category-response.dto';
import { Category } from 'src/generated/prisma/client';
import { GetCategoryQueryDto } from '../dtos/category-get.dto';
import { PaginationProviderService } from 'src/common/providers/pagination.provider.service';
import { UpdateCategoryDto } from '../dtos/category-update.dto';

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

    if (!nameToChgSlug) {
      throw new BadRequestException(
        'A slug is required when the category name has no Latin letters or numbers',
      );
    }

    const categoryExists = await this.prisma.category.findUnique({
      where: { slug: nameToChgSlug },
    });
    if (categoryExists)
      throw new ConflictException('Category slug already exists');

    let category: Category;
    try {
      category = await this.prisma.category.create({
        data: {
          name,
          slug: nameToChgSlug,
          ...rest,
        },
      });
    } catch (error) {
      const prismaError = error as { code?: unknown };
      if (prismaError.code === 'P2002') {
        throw new ConflictException('Category slug already exists');
      }
      throw error;
    }

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
    const result = await this.paginationProviderService.paginationQuery(
      getCategoryQueryDto,
      this.prisma.category,
      ['name', 'slug'],
      [],
      {
        include: {
          _count: { select: { products: true } },
        },
      },
    );

    return {
      ...result,
      data: result.data.map((category) => {
        const categoryWithCount = category as Category & {
          _count: { products: number };
        };
        return this.formatCategory(
          categoryWithCount,
          categoryWithCount._count.products,
        );
      }),
    };
  }

  //get id
  async getCategoryById(id: string): Promise<CategoriesResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.formatCategory(category, +category._count.products);
  }

  //get slug
  async getCategoryBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: { select: { products: true } },
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.formatCategory(category, +category._count.products);
  }

  //update category
  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    if (updateCategoryDto.slug !== category.slug && updateCategoryDto.slug) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { slug: updateCategoryDto.slug },
      });
      if (categoryExists)
        throw new ConflictException(
          `Category slug already exists ${updateCategoryDto.slug}`,
        );
    }

    let updatedCategory: Category & { _count: { products: number } };
    try {
      updatedCategory = await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
        include: {
          _count: { select: { products: true } },
        },
      });
    } catch (error) {
      const prismaError = error as { code?: unknown };
      if (prismaError.code === 'P2002') {
        throw new ConflictException('Category slug already exists');
      }
      throw error;
    }

    return this.formatCategory(
      updatedCategory,
      +updatedCategory._count.products,
    );
  }

  //delete categeory
  async deleteCategory(id: string): Promise<{ message: string }> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (+category._count.products > 0) {
      throw new BadRequestException(
        `Cannot delete Category with ${category._count.products} products.Remove or resign first `,
      );
    }
    await this.prisma.category.delete({
      where: { id },
    });
    return { message: 'Category deleted successfully' };
  }
}
