import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const getUploadUrlSchema = z.object({
  fileName: z.string().min(1, 'Filename is required'),
});

export type GetUploadUrlSchema = z.infer<typeof getUploadUrlSchema>;

export const getUploadUrlJSONSchema = {
  querystring: zodToJsonSchema(getUploadUrlSchema, 'getUploadUrlSchema'),
};
