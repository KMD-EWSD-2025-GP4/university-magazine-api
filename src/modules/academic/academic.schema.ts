import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const getAcademicYearByIdParamsSchema = z.object({
  id: z.string(),
});

export type getAcademicYearByIdParamsSchema = z.infer<
  typeof getAcademicYearByIdParamsSchema
>;

export const getAcademicYearByIdJSONSchema = {
  params: zodToJsonSchema(
    getAcademicYearByIdParamsSchema,
    'getAcademicYearByIdParamsSchema',
  ),
};

const getFacultyByIdParamsSchema = z.object({
  id: z.string(),
});

export type getFacultyByIdParamsSchema = z.infer<
  typeof getFacultyByIdParamsSchema
>;

export const getFacultyByIdJSONSchema = {
  params: zodToJsonSchema(
    getFacultyByIdParamsSchema,
    'getFacultyByIdParamsSchema',
  ),
};

const getAcademicYearByDateParamsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type getAcademicYearByDateParamsSchema = z.infer<
  typeof getAcademicYearByDateParamsSchema
>;

export const getAcademicYearByDateJSONSchema = {
  querystring: zodToJsonSchema(
    getAcademicYearByDateParamsSchema,
    'getAcademicYearByDateParamsSchema',
  ),
};

const getTermByIdParamsSchema = z.object({
  id: z.string(),
});

export type getTermByIdParamsSchema = z.infer<typeof getTermByIdParamsSchema>;

export const getTermByIdJSONSchema = {
  params: zodToJsonSchema(getTermByIdParamsSchema, 'getTermByIdParamsSchema'),
};
