import { FastifyReply, FastifyRequest } from 'fastify';
import {
  getBrowserUsageStats,
  getMostActiveUsers,
  getUserById,
  getUsers,
  loginUser,
  registerUser,
} from './user.services';
import {
  getUserByIdParamsSchema,
  loginUserBodySchema,
  registerUserBodySchema,
  getMostActiveUsersQuerySchema,
} from './user.schema';
import { logger } from '../../utils/logger';
import { handleError } from '../../utils/errors';
import { Role } from '../../types/roles';

export async function getCurrentUserHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    logger.info(`Getting current user: ${request.user.email}`);
    return reply.code(200).send(request.user);
  } catch (error) {
    handleError(error, request, reply);
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
    handleError(error, request, reply);
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
    handleError(error, request, reply);
  }
}

export async function getUsersHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const users = await getUsers();
    return reply.code(200).send(users);
  } catch (error) {
    handleError(error, request, reply);
  }
}

export async function getUserByIdHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params as getUserByIdParamsSchema;
    const user = await getUserById(id, request.user.id, request.user.role);
    return reply.code(200).send(user);
  } catch (error) {
    handleError(error, request, reply);
  }
}

export async function getMostActiveUsersHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { role } = request.query as getMostActiveUsersQuerySchema;
    const users = await getMostActiveUsers(role as Role | undefined);
    return reply.code(200).send(users);
  } catch (error) {
    handleError(error, request, reply);
  }
}

export async function getBrowserUsageStatsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const data = await getBrowserUsageStats();
    return reply.code(200).send(data);
  } catch (error) {
    handleError(error, request, reply);
  }
}
