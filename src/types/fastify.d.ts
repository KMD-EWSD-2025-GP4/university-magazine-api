import { Role } from 'roles';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      facultyId: string | null | undefined;
    };
  }
}
