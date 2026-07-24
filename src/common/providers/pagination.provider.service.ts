import { Injectable } from '@nestjs/common';
import { BaseQueryDto } from '../dtos/base-query.dto';
// import { Prisma } from 'src/generated/prisma/client';
// Minimal Prisma delegate type to satisfy typing for various Prisma model delegates
interface PrismaDelegate<T> {
  findMany: (args?: any) => Promise<T[]>;
  count: (args?: any) => Promise<number>;
}
//filter knowlege not good for performace
//export interface RangeFilter {
//   field: string;
//   min?: number;
//   max?: number;
// }

export interface PaginationOptions {
  searchFields?: string[]; // Search လုပ်ချင်တဲ့ Field များ (ဥပမာ- ['name', 'sku'])
  where?: Record<string, any>; // မည်သည့် Filter မဆို (isActive, categoryId စသည်)
  include?: Record<string, any>; // Prisma Relations (ဥပမာ- { category: true })
  tieBreakerField?: string; // မည်သည့် Tie Breaker Field မဆို
  // rangeFilters?: RangeFilter[]; // မည်သည့် Range Filter မဆို
}

@Injectable()
export class PaginationProviderService {
  public async paginationQuery<T>(
    paginationQuery: BaseQueryDto & { sortBy?: string },
    delegate: PrismaDelegate<T>,
    options: PaginationOptions = {},
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
    const {
      searchFields = [],
      where: customWhere = {},
      include,
      tieBreakerField = 'id',
      // rangeFilters = [],
    } = options;

    const filters: Record<string, any>[] = [];

    if (Object.keys(customWhere).length > 0) {
      filters.push(customWhere);
    }

    if (isActive !== undefined) {
      filters.push({ isActive });
    }

    if (search?.trim() && searchFields.length > 0) {
      filters.push({
        OR: searchFields.map((field) => ({
          [field]: { contains: search.trim(), mode: 'insensitive' },
        })),
      });
    }

    //knowledge
    // rangeFilters.forEach((filter) => {
    //   if (filter.min !== undefined || filter.max !== undefined) {
    //     filters.push({
    //       [filter.field]: {
    //         ...(filter.min !== undefined && { gte: filter.min }),
    //         ...(filter.max !== undefined && { lte: filter.max }),
    //       },
    //     });
    //   }
    // });

    const where =
      filters.length === 0
        ? {}
        : filters.length === 1
          ? filters[0]
          : { AND: filters };

    const normalizedPage = Number.isInteger(page) && page > 0 ? page : 1;
    const normalizedLimit =
      Number.isInteger(limit) && limit > 0 && limit <= 100 ? limit : 10;
    const direction = sortDirection?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const sortField = sortBy ?? 'createdAt';
    const orderBy =
      tieBreakerField === sortField
        ? { [sortField]: direction }
        : [{ [sortField]: direction }, { [tieBreakerField]: 'asc' }];

    //Count and findMany
    const [data, count] = await Promise.all([
      delegate.findMany({
        ...findManyArgs,
        where,
        orderBy,
        skip: (normalizedPage - 1) * normalizedLimit,
        take: normalizedLimit,
        ...(include && { include }),
      }),
      delegate.count({ where }),
    ]);

    //
    const totalPages = Math.ceil(count / normalizedLimit);

    return {
      data,
      meta: {
        total: count,
        page: normalizedPage,
        limit: normalizedLimit,
        totalPages,
      },
    };
  }
}
