import { SQL, sql } from 'drizzle-orm';

import { logger } from './logger';

export interface PaginationParams {
  cursor?: string | null;
  limit?: number;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
}

export function createPaginationQuery(
  column: SQL,
  params: PaginationParams,
): SQL {
  const { cursor, order = 'desc' } = params;

  if (!cursor) {
    return sql`true`;
  }

  if (order === 'desc') {
    return sql`${column} < ${cursor}`;
  }

  return sql`${column} > ${cursor}`;
}

export function getPaginationParams(params: PaginationParams): {
  limit: number;
  order: 'asc' | 'desc';
  cursor: string | null;
} {
  return {
    limit: Math.min(params.limit || 10, 100),
    order: params.order || 'desc',
    cursor: decodeToken(params.cursor),
  };
}

export function encodeToken(value: string): string {
  if (value === null) return '';

  const token = Buffer.from(`${value}@${Date.now()}`).toString('base64');
  return token;
}

export function decodeToken(token?: string | null): string | null {
  if (!token) return null;

  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [value] = decoded.split('@');
    return value;
  } catch (error) {
    logger.error('Error decoding next token:', error);
    return null;
  }
}
