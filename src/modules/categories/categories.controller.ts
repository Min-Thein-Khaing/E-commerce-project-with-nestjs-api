import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CategoriesService } from './providers/categories.service';
import { CreateCategoryDto } from './dtos/category-create.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/generated/prisma/enums';
import { CategoriesResponseDto } from './dtos/category-response.dto';
import { GetCategoryQueryDto } from './dtos/category-get.dto';
import { UpdateCategoryDto } from './dtos/category-update.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  //Protected Route
  //Create Category
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoriesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoriesResponseDto> {
    return await this.categoriesService.create(createCategoryDto);
  }

  //getAll Category
  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories fetched successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/CategoriesResponseDto',
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
            },
            page: {
              type: 'number',
            },
            limit: {
              type: 'number',
            },
            totalPages: {
              type: 'number',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getAllCategories(@Query() getCategoryQueryDto: GetCategoryQueryDto) {
    return await this.categoriesService.getAllCategories(getCategoryQueryDto);
  }

  //get category id
  @Get(':id')
  @ApiOperation({ summary: 'Get category by id' })
  @ApiResponse({
    status: 200,
    description: 'Category fetched successfully',
    type: CategoriesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getCategoryById(
    @Param('id') id: string,
  ): Promise<CategoriesResponseDto> {
    return await this.categoriesService.getCategoryById(id);
  }

  //get slug
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiResponse({
    status: 200,
    description: 'Category fetched successfully',
    type: CategoriesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getCategoryBySlug(@Param('slug') slug: string) {
    return await this.categoriesService.getCategoryBySlug(slug);
  }

  //update category
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update category by id' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CategoriesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoriesResponseDto> {
    return await this.categoriesService.updateCategory(id, updateCategoryDto);
  }

  //delete category
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete category by id' })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async deleteCategory(@Param('id') id: string): Promise<{ message: string }> {
    return await this.categoriesService.deleteCategory(id);
  }
}
