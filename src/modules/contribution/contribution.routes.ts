import { FastifyInstance } from 'fastify';

import {
  createCommentHandler,
  getContributionHandler,
  updateContributionHandler,
  createContributionHandler,
  listMyContributionsHandler,
  listFacultySelectedContributionsHandler,
  updateContributionStatusHandler,
} from './contribution.controllers';

import {
  listContributionsJSONSchema,
  createContributionJSONSchema,
  updateContributionJSONSchema,
  createCommentSchemaJSONSchema,
  updateContributionStatusJSONSchema,
} from './contribution.schema';

import { checkRole } from '../../middleware/auth';
import { authenticateRequest } from '../../middleware/auth';

export async function contributionRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/',
    {
      schema: createContributionJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['student'])],
    },
    createContributionHandler,
  );

  app.get(
    '/:id',
    {
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['student', 'guest', 'marketing_coordinator'])],
    },
    getContributionHandler,
  );

  app.put(
    '/:id',
    {
      schema: updateContributionJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['student'])],
    },
    updateContributionHandler,
  );

  app.post(
    '/:id/comment',
    {
      schema: createCommentSchemaJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['marketing_coordinator'])],
    },
    createCommentHandler,
  );

  app.get(
    '/my',
    {
      schema: listContributionsJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['student'])],
    },
    listMyContributionsHandler,
  );

  app.get(
    '/faculty/selected',
    {
      schema: listContributionsJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['student', 'guest'])],
    },
    listFacultySelectedContributionsHandler,
  );

  app.put(
    '/:id/status',
    {
      schema: updateContributionStatusJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['marketing_coordinator'])],
    },
    updateContributionStatusHandler,
  );
}
