import fastify from 'fastify';
import fastifyRawBody from 'fastify-raw-body';
import cors from '@fastify/cors';
import { pinoLogger } from './logger';
import { userRoutes } from '../modules/users/user.routes';
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
  return server;
}
