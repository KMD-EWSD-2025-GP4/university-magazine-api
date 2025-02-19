import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { db } from '../db';
import { user } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string;
      email: string;
      role: typeof user.$inferSelect.role;
      firstName: string;
      lastName: string;
      facultyId: string | null;
    };
  }
}

export async function authenticateRequest(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };
    logger.info(`Authenticating user: ${decoded.email}`);

    const userResult = await db
      .select({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        facultyId: user.facultyId,
      })
      .from(user)
      .where(eq(user.email, decoded.email))
      .limit(1);

    if (!userResult.length) {
      throw new UnauthorizedError('User not found');
    }

    request.user = userResult[0];
  } catch (error) {
    logger.error(`Authentication error: ${error}`);
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Authentication failed');
  }
}

export function checkRole(roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      if (!roles.includes(request.user.role)) {
        throw new ForbiddenError('Insufficient permissions');
      }
    } catch (error) {
      logger.error(`Role check error: ${error}`);
      if (
        error.name === 'UnauthorizedError' ||
        error.name === 'ForbiddenError'
      ) {
        throw error;
      }
      throw new ForbiddenError('Permission check failed');
    }
  };
}
