export {};

interface PaginationOptions {
  page: number;
  limit: number;
}

interface PaginationResult {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

function getPaginationParams(ctx: any, defaultLimit = 20): PaginationOptions {
  const page = Math.max(1, parseInt(ctx.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(ctx.query.limit) || defaultLimit));
  return { page, limit };
}

function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

async function paginate(
  query: any,
  totalCount: number,
  page: number,
  limit: number
): Promise<PaginationResult> {
  const data = await query.limit(limit).skip(calculateSkip(page, limit));
  const pages = Math.ceil(totalCount / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total: totalCount,
      pages
    }
  };
}

module.exports = { getPaginationParams, paginate, calculateSkip };
