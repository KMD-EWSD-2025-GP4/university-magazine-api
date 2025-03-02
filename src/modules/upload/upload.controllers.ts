import { FastifyRequest, FastifyReply } from 'fastify';

import { getUploadUrl } from './upload.services';
import { handleError } from '../../utils/errors';
import { GetUploadUrlSchema } from './upload.schema';

export async function getUploadUrlHandler(
  req: FastifyRequest,
  res: FastifyReply,
): Promise<void> {
  try {
    const { fileName } = req.query as GetUploadUrlSchema;
    const result = await getUploadUrl(fileName, req.user.id);

    res.send(result);
  } catch (error) {
    handleError(error, req, res);
  }
}
