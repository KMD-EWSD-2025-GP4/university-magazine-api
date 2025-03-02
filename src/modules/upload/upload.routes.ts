import { FastifyInstance } from 'fastify';

import { getUploadUrlHandler } from './upload.controllers';
import { authenticateRequest } from '../../middleware/auth';

import { getUploadUrlJSONSchema } from './upload.schema';

export async function uploadRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/presigned-url',
    {
      schema: getUploadUrlJSONSchema,
      onRequest: [authenticateRequest],
    },
    getUploadUrlHandler,
  );
}
