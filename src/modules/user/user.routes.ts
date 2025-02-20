import { FastifyInstance } from 'fastify';
import { loginUserJSONSchema, registerUserJSONSchema } from './user.schema';
import {
  loginUserHandler,
  registerUserHandler,
  getCurrentUserHandler,
} from './user.controllers';
import { authenticateRequest } from '../../middleware/auth';

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
}
