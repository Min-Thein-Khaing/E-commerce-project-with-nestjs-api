import { Injectable } from '@nestjs/common';
import { BaseQueryDto } from '../dtos/base-query.dto';
// import { Prisma } from 'src/generated/prisma/client';
// Minimal Prisma delegate type to satisfy typing for various Prisma model delegates
interface PrismaDelegate<T> {
  findMany: (args?: any) => Promise<T[]>;
  count: (args?: any) => Promise<number>;
}

interface RangeFilter {
  field: string;
  min?: number;
  max?: number;
}
@Injectable()
export class PaginationProviderService {
  public async paginationQuery<T>(
    paginationQuery: BaseQueryDto & { sortBy?: string },
    delegate: PrismaDelegate<T>,
    searchFields: string[] = [],
    rangeFilters: RangeFilter[] = [],
    findManyArgs: Record<string, unknown> = {},
  ) {
    const {
      page = 1,
      search,
      limit = 10,
      isActive,
      sortBy,
      sortDirection,
    } = paginationQuery;

    const where: Record<string, any> = {};
    // const where: Prisma.CategoryWhereInput = {};
    //take isActive from query if true all
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    //take search query
    if (search?.trim() && searchFields.length > 0) {
      where.OR = searchFields.map((field) => ({
        [field]: { contains: search.trim(), mode: 'insensitive' },
      }));
    }
    //filter
    rangeFilters.forEach((filter) => {
      if (filter.min !== undefined || filter.max !== undefined) {
        where[filter.field] = {
          ...(filter.min !== undefined && { gte: filter.min }),
          ...(filter.max !== undefined && { lte: filter.max }),
        };
      }
    });
    //sort direction
    const orderBy = sortBy
      ? { [sortBy]: sortDirection.toLowerCase() }
      : { createdAt: sortDirection.toLowerCase() };

    //Count and findMany
    const [data, count] = await Promise.all([
      delegate.findMany({
        ...findManyArgs,
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      delegate.count({ where }),
    ]);

    //
    const totalPages = Math.ceil(count / limit);

    return {
      data,
      meta: {
        total: count,
        page,
        limit,
        totalPages,
      },
    };
  }
}
