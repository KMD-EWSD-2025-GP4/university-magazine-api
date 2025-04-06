import { FastifyInstance } from 'fastify';

import {
  createCommentHandler,
  getContributionHandler,
  updateContributionHandler,
  createContributionHandler,
  incrementViewCountHandler,
  listMyContributionsHandler,
  listAllContributionsHandler,
  updateContributionStatusHandler,
  downloadSelectedContributionsHandler,
  marketingCoordinatorGuestReportHandler,
  marketingCoordinatorYearlyStatsHandler,
  listFacultySelectedContributionsHandler,
  marketingManagerContributorsReportHandler,
  marketingManagerContributionsReportHandler,
  marketingCoordinatorUncommentedContributionsHandler,
  marketingCoordinatorContributorsAndContributionsHandler,
} from './contribution.controllers';

import {
  mcStatisticsJSONSchema,
  listContributionsJSONSchema,
  createContributionJSONSchema,
  updateContributionJSONSchema,
  createCommentSchemaJSONSchema,
  updateContributionStatusJSONSchema,
  downloadSelectedContributionsJSONSchema,
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
    '/all',
    {
      schema: listContributionsJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['marketing_manager'])],
    },
    listAllContributionsHandler,
  );

  app.get(
    '/:id',
    {
      onRequest: [authenticateRequest],
      preHandler: [
        checkRole([
          'student',
          'guest',
          'marketing_manager',
          'marketing_coordinator',
        ]),
      ],
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
      preHandler: [checkRole(['marketing_coordinator', 'student'])],
    },
    createCommentHandler,
  );

  app.post(
    '/:id/view',
    {
      onRequest: [authenticateRequest],
      preHandler: [
        checkRole([
          'student',
          'guest',
          'marketing_manager',
          'marketing_coordinator',
        ]),
      ],
    },
    incrementViewCountHandler,
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
      preHandler: [checkRole(['student', 'guest', 'marketing_coordinator'])],
    },
    listFacultySelectedContributionsHandler,
  );

  app.get(
    '/faculty/all',
    {
      schema: listContributionsJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['marketing_coordinator'])],
    },
    listAllContributionsHandler,
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

  // New route for downloading all selected contributions
  app.get(
    '/download-selected',
    {
      schema: downloadSelectedContributionsJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['marketing_manager'])],
    },
    downloadSelectedContributionsHandler,
  );

  // New route for contribution statistics report
  app.get(
    '/mm/contribution_report',
    {
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['marketing_manager'])],
    },
    marketingManagerContributionsReportHandler,
  );

  // New route for unique contributors report
  app.get(
    '/mm/contributor_report',
    {
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['marketing_manager'])],
    },
    marketingManagerContributorsReportHandler,
  );

  app.get(
    '/mc/guest_report',
    {
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['marketing_coordinator'])],
    },
    marketingCoordinatorGuestReportHandler,
  );

  app.get(
    '/mc/contributors_and_contributions',
    {
      schema: mcStatisticsJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['marketing_coordinator'])],
    },
    marketingCoordinatorContributorsAndContributionsHandler,
  );

  app.get(
    '/mc/yearly_stats',
    {
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['marketing_coordinator'])],
    },
    marketingCoordinatorYearlyStatsHandler,
  );

  app.get(
    '/mc/uncommented_contributions',
    {
      schema: mcStatisticsJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['marketing_coordinator'])],
    },
    marketingCoordinatorUncommentedContributionsHandler,
  );
}
