import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './../dtos/product-create.dto';
import { ConflictException, Injectable } from '@nestjs/common';
import { ProductResponseDto } from '../dtos/product-response.dto';
import { Prisma, Product } from 'src/generated/prisma/client';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}
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
    });

    return this.formatProduct(product);
  }

  private formatProduct(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toNumber(),
      stock: product.stock,
      sku: product.sku,
      isActive: product.isActive,
      categoryId: product.categoryId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
