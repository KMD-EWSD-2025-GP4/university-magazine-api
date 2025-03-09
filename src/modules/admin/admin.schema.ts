import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const createUserBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
  role: z.enum([
    'guest',
    'student',
    'marketing_coordinator',
    'marketing_manager',
    'admin',
  ]),
  name: z.string(),
  facultyId: z.string(),
});

export type createUserBodySchema = z.infer<typeof createUserBodySchema>;

export const createUserJSONSchema = {
  body: zodToJsonSchema(createUserBodySchema, 'createUserBodySchema'),
};

const updateUserBodySchema = z.object({
  userId: z.string(),
  password: z.string().optional(),
  role: z.enum([
    'guest',
    'student',
    'marketing_coordinator',
    'marketing_manager',
    'admin',
  ]),
  facultyId: z.string(),
  status: z.enum(['active', 'inactive']),
});

export type updateUserBodySchema = z.infer<typeof updateUserBodySchema>;

export const updateUserJSONSchema = {
  body: zodToJsonSchema(updateUserBodySchema, 'updateUserBodySchema'),
};

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

const changeUserStatusBodySchema = z.object({
  userId: z.string(),
  status: z.enum(['active', 'inactive']),
});

export type changeUserStatusBodySchema = z.infer<
  typeof changeUserStatusBodySchema
>;

export const changeUserStatusJSONSchema = {
  body: zodToJsonSchema(
    changeUserStatusBodySchema,
    'changeUserStatusBodySchema',
  ),
};

export type changeUserRoleBodySchema = z.infer<typeof changeUserRoleBodySchema>;
export const changeUserRoleJSONSchema = {
  body: zodToJsonSchema(changeUserRoleBodySchema, 'changeUserRoleBodySchema'),
};

const changeUserFacultyBodySchema = z.object({
  userId: z.string(),
  newFacultyId: z.string(),
});

export type changeUserFacultyBodySchema = z.infer<
  typeof changeUserFacultyBodySchema
>;

export const changeUserFacultyJSONSchema = {
  body: zodToJsonSchema(
    changeUserFacultyBodySchema,
    'changeUserFacultyBodySchema',
  ),
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
  status: z.enum(['active', 'inactive']),
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
  status: z.enum(['active', 'inactive']),
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
