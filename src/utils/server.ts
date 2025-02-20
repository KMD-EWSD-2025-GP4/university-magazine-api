import fastify from 'fastify';
import fastifyRawBody from 'fastify-raw-body';
import cors from '@fastify/cors';
import { pinoLogger } from './logger';
import { userRoutes } from '../modules/user/user.routes';
import { adminRoutes } from '../modules/admin/admin.routes';
import { academicRoutes } from '../modules/academic/academic.routes';

export async function createServer() {
  const server = fastify({
    logger: pinoLogger,
  });
  // register plugins
  server.register(fastifyRawBody);
  server.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  // register routes
  server.register(userRoutes, { prefix: '/api/user' });
  server.register(adminRoutes, { prefix: '/api/admin' });
  server.register(academicRoutes, { prefix: '/api/academic' });
  return server;
}
