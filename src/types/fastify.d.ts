import { FastifyRequest } from 'fastify';
import { user } from '../db/schema';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      facultyId: string;
    };
  }
}
