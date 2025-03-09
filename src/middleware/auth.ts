import { FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { db } from '../db';
import { faculty, user } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

export async function authenticateRequest(
  request: FastifyRequest,
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
    // join user with faculty as a alias facultyName
    const userResult = await db
      .select({
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        facultyId: user.facultyId,
        name: user.name,
        facultyName: faculty.name,
      })
      .from(user)
      .leftJoin(faculty, eq(user.facultyId, faculty.id))
      .where(eq(user.email, decoded.email))
      .limit(1);

    if (!userResult.length) {
      throw new UnauthorizedError('User not found');
    }

    if (userResult[0].status === 'inactive') {
      throw new UnauthorizedError(
        'Your account is inactive, please contact your administrator',
      );
    }

    request.user = userResult[0];
  } catch (error) {
    logger.error(`Authentication error: ${error}`);
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw error;
  }
}

export function checkRole(roles: string[]) {
  return async (request: FastifyRequest): Promise<void> => {
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
