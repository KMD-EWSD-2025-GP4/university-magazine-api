import { FastifyInstance } from 'fastify';

import {
  getContributionHandler,
  updateContributionHandler,
  createContributionHandler,
  listMyContributionsHandler,
  listFacultySelectedContributionsHandler,
} from './student.controllers';

import {
  listContributionsJSONSchema,
  createContributionJSONSchema,
  updateContributionJSONSchema,
} from './student.schema';

import { checkRole } from '../../middleware/auth';
import { authenticateRequest } from '../../middleware/auth';

export async function studentRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/contributions',
    {
      schema: createContributionJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['student'])],
    },
    createContributionHandler,
  );

  app.get(
    '/contributions/:id',
    {
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['student'])],
    },
    getContributionHandler,
  );

  app.put(
    '/contributions/:id',
    {
      schema: updateContributionJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['student'])],
    },
    updateContributionHandler,
  );

  app.get(
    '/contributions/my',
    {
      schema: listContributionsJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['student'])],
    },
    listMyContributionsHandler,
  );

  app.get(
    '/contributions/faculty/selected',
    {
      schema: listContributionsJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['student'])],
    },
    listFacultySelectedContributionsHandler,
  );
}
