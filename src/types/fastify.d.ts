import { FastifyRequest } from 'fastify';
import { user } from '../db/schema';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string;
      email: string;
      role: Role;
    };
  }
}
