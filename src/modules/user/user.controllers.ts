import { FastifyReply, FastifyRequest } from 'fastify';
import { loginUser, registerUser } from './user.services';
import { loginUserBodySchema, registerUserBodySchema } from './user.schema';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';

export async function getCurrentUserHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    logger.info(`Getting current user: ${request.user.email}`);
    return reply.code(200).send(request.user);
  } catch (error) {
    if (error instanceof AppError) {
      logger.error(`Error getting current user: ${error}`);
      throw error;
    }
    throw new AppError(500, 'Failed to get current user');
  }
}

export async function registerUserHandler(
  request: FastifyRequest<{
    Body: registerUserBodySchema;
  }>,
  reply: FastifyReply,
) {
  try {
    const result = await registerUser(request.body);
    return reply.code(201).send(result);
  } catch (error) {
    if (error instanceof AppError) {
      logger.error(`Error registering user: ${error}`);
      throw error;
    }
    throw new AppError(500, 'Failed to register user');
  }
}

export async function loginUserHandler(
  request: FastifyRequest<{
    Body: loginUserBodySchema;
  }>,
  reply: FastifyReply,
) {
  try {
    const result = await loginUser(request.body);
    return reply.code(200).send(result);
  } catch (error) {
    logger.error(`Error logging in user: ${error}`);
    if (error instanceof AppError) {
      logger.error(`Error logging in user: ${error}`);
      throw error;
    }
    throw new AppError(500, 'Failed to login user');
  }
}
