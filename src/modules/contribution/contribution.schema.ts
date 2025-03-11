import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const createContributionSchema = z.object({
  title: z.string(),
  description: z.string(),
  article: z.object({
    path: z.string(),
  }),
  images: z
    .array(
      z.object({
        path: z.string(),
      }),
    )
    .optional(),
});

export type CreateContributionSchema = z.infer<typeof createContributionSchema>;

export const createContributionJSONSchema = {
  body: zodToJsonSchema(createContributionSchema, 'createContributionSchema'),
};

const updateContributionSchema = z.object({
  title: z.string(),
  description: z.string(),
  article: z.object({
    path: z.string(),
  }),
  images: z
    .array(
      z.object({
        path: z.string(),
      }),
    )
    .optional(),
});

export type UpdateContributionSchema = z.infer<typeof updateContributionSchema>;

export const updateContributionJSONSchema = {
  params: zodToJsonSchema(z.object({ id: z.string().uuid() })),
  body: zodToJsonSchema(updateContributionSchema, 'updateContributionSchema'),
};

const paginationSchema = z.object({
  cursor: z.string().or(z.null()).or(z.undefined()).optional(),
  limit: z.number().min(1).max(100).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type PaginationSchema = z.infer<typeof paginationSchema>;

export const listContributionsJSONSchema = {
  querystring: zodToJsonSchema(paginationSchema, 'paginationSchema'),
};

const createCommentSchema = z.object({ comment: z.string() });

export type CreateCommentSchema = z.infer<typeof createCommentSchema>;

export const createCommentSchemaJSONSchema = {
  params: zodToJsonSchema(z.object({ id: z.string().uuid() })),
  body: zodToJsonSchema(createCommentSchema, 'createCommentSchema'),
};

const updateContributionStatusSchema = z.object({
  status: z.enum(['selected', 'rejected']),
});

export type UpdateContributionStatusSchema = z.infer<
  typeof updateContributionStatusSchema
>;

export const updateContributionStatusJSONSchema = {
  params: zodToJsonSchema(
    z.object({ id: z.string().uuid() }),
    'updateContributionStatusSchema',
  ),
  body: zodToJsonSchema(
    updateContributionStatusSchema,
    'updateContributionStatusSchema',
  ),
};

// Schema for downloading selected contributions with optional academic year filter
// If academicYearId is not provided, the current academic year is determined based on the current date
const downloadSelectedContributionsQuerySchema = z.object({
  academicYearId: z.string().uuid().optional(),
});

export type DownloadSelectedContributionsQuerySchema = z.infer<
  typeof downloadSelectedContributionsQuerySchema
>;

export const downloadSelectedContributionsJSONSchema = {
  querystring: zodToJsonSchema(
    downloadSelectedContributionsQuerySchema,
    'downloadSelectedContributionsQuerySchema',
  ),
};
