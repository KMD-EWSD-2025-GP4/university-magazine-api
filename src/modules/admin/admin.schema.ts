import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const resetUserPasswordBodySchema = z.object({
  userId: z.string(),
  newPassword: z.string(),
});

export type resetUserPasswordBodySchema = z.infer<
  typeof resetUserPasswordBodySchema
>;

export const resetUserPasswordJSONSchema = {
  body: zodToJsonSchema(
    resetUserPasswordBodySchema,
    'resetUserPasswordBodySchema',
  ),
};

const changeUserRoleBodySchema = z.object({
  userId: z.string(),
  newRole: z.enum([
    'guest',
    'student',
    'marketing_coordinator',
    'marketing_manager',
    'admin',
  ]),
});

export type changeUserRoleBodySchema = z.infer<typeof changeUserRoleBodySchema>;

export const changeUserRoleJSONSchema = {
  body: zodToJsonSchema(changeUserRoleBodySchema, 'changeUserRoleBodySchema'),
};

const createFacultyBodySchema = z.object({
  name: z.string(),
});

export type createFacultyBodySchema = z.infer<typeof createFacultyBodySchema>;

export const createFacultyJSONSchema = {
  body: zodToJsonSchema(createFacultyBodySchema, 'createFacultyBodySchema'),
};

const deleteFacultyBodySchema = z.object({
  id: z.string(),
});

export type deleteFacultyBodySchema = z.infer<typeof deleteFacultyBodySchema>;

export const deleteFacultyJSONSchema = {
  body: zodToJsonSchema(deleteFacultyBodySchema, 'deleteFacultyBodySchema'),
};

const updateFacultyBodySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type updateFacultyBodySchema = z.infer<typeof updateFacultyBodySchema>;

export const updateFacultyJSONSchema = {
  body: zodToJsonSchema(updateFacultyBodySchema, 'updateFacultyBodySchema'),
};

const createAcademicYearBodySchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  newClosureDate: z.date(),
  finalClosureDate: z.date(),
});

export type createAcademicYearBodySchema = z.infer<
  typeof createAcademicYearBodySchema
>;

export const createAcademicYearJSONSchema = {
  body: zodToJsonSchema(
    createAcademicYearBodySchema,
    'createAcademicYearBodySchema',
  ),
};

const updateAcademicYearBodySchema = z.object({
  id: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  newClosureDate: z.date(),
  finalClosureDate: z.date(),
});

export type updateAcademicYearBodySchema = z.infer<
  typeof updateAcademicYearBodySchema
>;

export const updateAcademicYearJSONSchema = {
  body: zodToJsonSchema(
    updateAcademicYearBodySchema,
    'updateAcademicYearBodySchema',
  ),
};

const deleteAcademicYearBodySchema = z.object({
  id: z.string(),
});

export type deleteAcademicYearBodySchema = z.infer<
  typeof deleteAcademicYearBodySchema
>;

export const deleteAcademicYearJSONSchema = {
  body: zodToJsonSchema(
    deleteAcademicYearBodySchema,
    'deleteAcademicYearBodySchema',
  ),
};

const createTermBodySchema = z.object({
  name: z.string(),
  content: z.string(),
});

export type createTermBodySchema = z.infer<typeof createTermBodySchema>;

export const createTermJSONSchema = {
  body: zodToJsonSchema(createTermBodySchema, 'createTermBodySchema'),
};

const deleteTermBodySchema = z.object({
  id: z.string(),
});

export type deleteTermBodySchema = z.infer<typeof deleteTermBodySchema>;

export const deleteTermJSONSchema = {
  body: zodToJsonSchema(deleteTermBodySchema, 'deleteTermBodySchema'),
};

const updateTermBodySchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
});

export type updateTermBodySchema = z.infer<typeof updateTermBodySchema>;

export const updateTermJSONSchema = {
  body: zodToJsonSchema(updateTermBodySchema, 'updateTermBodySchema'),
};
