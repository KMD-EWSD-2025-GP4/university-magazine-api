import cors from '@fastify/cors';
import fastifyRawBody from 'fastify-raw-body';
import fastify, { FastifyInstance } from 'fastify';

import { userRoutes } from '../modules/user/user.routes';
import { adminRoutes } from '../modules/admin/admin.routes';
import { uploadRoutes } from '../modules/upload/upload.routes';
import { studentRoutes } from '../modules/student/student.routes';
import { academicRoutes } from '../modules/academic/academic.routes';

import { pinoLogger } from './logger';

export async function createServer(): Promise<FastifyInstance> {
  const server = fastify({ logger: pinoLogger });

  // register plugins
  server.register(fastifyRawBody);
  server.register(cors, {
    credentials: true,
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  });

  // register routes
  server.register(userRoutes, { prefix: '/api/user' });
  server.register(adminRoutes, { prefix: '/api/admin' });
  server.register(uploadRoutes, { prefix: '/api/upload' });
  server.register(studentRoutes, { prefix: '/api/student' });
  server.register(academicRoutes, { prefix: '/api/academic' });

  return server;
}
