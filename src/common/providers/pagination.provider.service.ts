import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { RequestWithUser } from '../interfaces/request-with-user.interface';
import { BaseQueryDto } from '../dtos/base-query.dto';
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
  constructor(
    @Inject(REQUEST)
    private readonly request: RequestWithUser,
  ) {}

  public async paginationQuery<T>(
    paginationQuery: BaseQueryDto & { sortBy?: string },
    delegate: PrismaDelegate<T>,
    searchFields: string[] = [],
    rangeFilters: RangeFilter[] = [],
  ) {
    try {
      const {
        page = 1,
        search,
        limit = 10,
        isActive,
        sortBy,
        sortDirection,
      } = paginationQuery;

      const where: Record<string, any> = {};
      //take isActive from query if true all
      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      //take search query
      if (search && searchFields.length > 0) {
        where['OR'] = searchFields.map((field) => ({
          [field]: { contains: search.trim(), mode: 'insensitive' },
        }));
      }
      //filter
      if (rangeFilters.length > 0) {
        rangeFilters.forEach((filter) => {
          if (filter.min !== undefined || filter.max !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            where[filter.field] = { ...where[filter.field] };
          }
          if (filter.min !== undefined) {
            where[filter.field] = { gte: filter.min };
          }
          if (filter.max !== undefined) {
            where[filter.field] = { lte: filter.max };
          }
        });
      }
      //sort direction
      const orderBy = sortBy
        ? { [sortBy]: sortDirection.toLowerCase() }
        : { createdAt: sortDirection.toLowerCase() };

      //Count and findMany
      const [data, count] = await Promise.all([
        delegate.findMany({
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
    } catch (error) {
      throw new ConflictException((error as Error).message);
    }
  }
}
