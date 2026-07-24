import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './../dtos/product-create.dto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductResponseDto } from '../dtos/product-response.dto';
import { Category, Prisma, Product } from 'src/generated/prisma/client';
import { GetProductDto } from '../dtos/product-get.dto';
import { PaginationProviderService } from 'src/common/providers/pagination.provider.service';
import { UpdateProductDto } from '../dtos/product-update.dto';

type ProductWithCategory = Product & {
  category: Category;
};

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationProviderService: PaginationProviderService,
  ) {}
  async createProduct(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const existSku = await this.prisma.product.findUnique({
      where: {
        sku: createProductDto.sku,
      },
    });

    if (existSku) {
      throw new ConflictException('Product with this sku already exists');
    }

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        price: new Prisma.Decimal(createProductDto.price),
      },
      include: {
        category: true,
      },
    });

    return this.formatProduct(product);
  }

  private formatProduct(product: ProductWithCategory): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toNumber(),
      stock: product.stock,
      sku: product.sku,
      isActive: product.isActive,
      categoryId: product.categoryId,
      categoryName: product.category.name,
      imageUrl: product.imageUrl,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async getAllProducts(getProductDto: GetProductDto) {
    const result = await this.paginationProviderService.paginationQuery(
      getProductDto,
      this.prisma.product,
      {
        searchFields: ['name', 'sku', 'description'],
        include: {
          category: true,
        },
      },
    );
    return {
      ...result,
      data: result.data.map((product) =>
        this.formatProduct(product as ProductWithCategory),
      ),
    };
  }

  //id
  async getProductById(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.formatProduct(product);
  }

  //update/id
  async updateProductById(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existSku = await this.prisma.product.findUnique({
        where: {
          sku: updateProductDto.sku,
        },
      });

      if (existSku) {
        throw new ConflictException('Product with this sku already exists');
      }
    }

    const data: Prisma.ProductUpdateInput = {
      ...updateProductDto,
    };

    if (updateProductDto.price !== undefined) {
      data.price = new Prisma.Decimal(updateProductDto.price);
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });

    return this.formatProduct(updatedProduct);
  }

  //update stock
  async updateStockById(
    id: string,
    quantity: number,
  ): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const newStock = product.stock + quantity;
    if (newStock < 0) {
      throw new ConflictException('Product stock cannot be negative');
    }
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: { stock: newStock },
      include: {
        category: true,
      },
    });
    return this.formatProduct(updatedProduct);
  }

  //delete
  async deleteProductById(id: string): Promise<{ message: string }> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          orderItems: true,
          cartItems: true,
        },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (product.orderItems.length > 0) {
        throw new ConflictException('Product is used in an order');
      }

      await this.prisma.product.delete({
        where: { id },
      });
      return { message: 'Product deleted successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new NotFoundException(
        (error as Error).message || 'Product not found',
      );
    }
  }
}
