import { FastifyInstance } from 'fastify';
import {
  getUserByIdJSONSchema,
  loginUserJSONSchema,
  registerUserJSONSchema,
} from './user.schema';
import {
  loginUserHandler,
  registerUserHandler,
  getCurrentUserHandler,
  getUsersHandler,
  getMostActiveUsersHandler,
  getUserByIdHandler,
  getBrowserUsageStatsHandler,
} from './user.controllers';
import { authenticateRequest, checkRole } from '../../middleware/auth';

export async function userRoutes(app: FastifyInstance) {
  app.get(
    '/me',
    {
      onRequest: [authenticateRequest],
    },
    getCurrentUserHandler,
  );

  app.post(
    '/register',
    {
      schema: registerUserJSONSchema,
    },
    registerUserHandler,
  );

  app.post(
    '/login',
    {
      schema: loginUserJSONSchema,
    },
    loginUserHandler,
  );

  app.get(
    '/',
    {
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['admin'])],
    },
    getUsersHandler,
  );

  app.get(
    '/:id',
    {
      onRequest: [authenticateRequest],
      schema: getUserByIdJSONSchema,
    },
    getUserByIdHandler,
  );

  app.get(
    '/most-active',
    {
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['admin'])],
    },
    getMostActiveUsersHandler,
  );

  app.get(
    '/browser-usage',
    {
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['admin'])],
    },
    getBrowserUsageStatsHandler,
  );
}
