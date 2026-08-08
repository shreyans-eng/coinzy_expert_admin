export const DEFAULT_PAGE_SIZE = 20;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function paginateSlice<T>(
  items: T[],
  page: number,
  pageSize = DEFAULT_PAGE_SIZE,
): { items: T[]; pagination: PaginationMeta } {
  const total = items.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const safePage =
    totalPages === 0 ? 1 : Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    pagination: {
      page: safePage,
      limit: pageSize,
      total,
      totalPages,
    },
  };
}
