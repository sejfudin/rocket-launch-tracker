import { type IPaginationOrder, type IPaginationQuery } from '~common/http/pagination';

import type { Prisma } from '~database/prisma/client';

/**
 * Generate Prisma Pagination Ordering
 */
export function paginationOrderToPrismaOrderBy<T extends string | symbol>(
  orders?: IPaginationOrder<T>[],
): Record<T, Prisma.SortOrder>[] | undefined {
  if (!orders) {
    return undefined;
  }
  if (!Array.isArray(orders)) {
    throw new Error('Invalid order fields');
  }
  const orderBy: Record<T, Prisma.SortOrder>[] = [];
  for (const order of orders) {
    if (order.property && order.direction) {
      if (order.direction === 'asc' || order.direction === 'desc') {
        orderBy.push({ [order.property]: order.direction } as Record<T, Prisma.SortOrder>);
      } else {
        throw new Error(`Invalid prisma order direction: ${order.direction as string}`);
      }
    }
  }
  return orderBy;
}

/**
 * Generate Prisma Pagination Query
 */
export function paginationToPrismaQuery<F, T extends string | symbol>(
  query: IPaginationQuery<F, T>,
): {
  skip?: number;
  take: number;
  orderBy?: Record<T, Prisma.SortOrder>[];
  cursor?: Record<string, string>;
} {
  const { page, limit, order } = query;
  if (query.cursor) {
    const cursorStr = typeof query.cursor === 'string' ? query.cursor : String(query.cursor);
    const [key, cursor] = cursorStr.split(':');
    return {
      ...(cursor
        ? {
            cursor: { [key]: cursor },
            // skip the cursor item
            skip: 1,
          }
        : {}),
      take: limit,
      orderBy: paginationOrderToPrismaOrderBy(order),
    };
  }
  const offset = ((page || 1) - 1) * limit;
  return {
    skip: offset,
    take: limit,
    orderBy: paginationOrderToPrismaOrderBy(order),
  };
}

/**
 * Generate Pagination from Prisma Result
 */
export function prismaResultToPagination<F, O>(
  query: IPaginationQuery<F, O>,
  data: {
    totalItems?: number;
    items?: Array<Record<string, unknown>>;
    // supply custom next cursor or false to disable
    nextCursor?: string | number;
    // custom cursor property
    cursorProperty?: string;
  },
): {
  totalItems?: number;
  limit: number;
  nextCursor?: string | number | undefined;
} & ({ page: number } | { cursor: string | number }) {
  if (query.cursor || data.nextCursor) {
    if (data.nextCursor) {
      return {
        totalItems: data.totalItems,
        limit: query.limit,
        cursor: query.cursor || '',
        nextCursor: data.nextCursor,
      };
    }
    const cursorStr = typeof query.cursor === 'string' ? query.cursor : String(query.cursor);
    const [key] = cursorStr.split(':');
    const lastItem = data.items?.[data.items.length - 1];
    return {
      totalItems: data.totalItems,
      limit: query.limit,
      cursor: query.cursor || '',
      nextCursor: lastItem && key in lastItem ? `${key}:${String(lastItem[key])}` : undefined,
    };
  }
  return {
    totalItems: data.totalItems,
    limit: query.limit,
    page: query.page || 1,
  };
}
