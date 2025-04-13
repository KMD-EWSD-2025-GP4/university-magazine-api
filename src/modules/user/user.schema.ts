import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Role } from '../../types/roles';

const registerUserBodySchema = z.object({
  email: z.string({
    required_error: 'Email is required',
  }),
  password: z.string({
    required_error: 'Password is required',
  }),
  name: z.string({
    required_error: 'Name is required',
  }),
  facultyId: z.string({
    required_error: 'Faculty is required',
  }),
});

export type registerUserBodySchema = z.infer<typeof registerUserBodySchema>;

export const registerUserJSONSchema = {
  body: zodToJsonSchema(registerUserBodySchema, 'createUserBodySchema'),
};

export const loginUserBodySchema = z.object({
  email: z.string({
    required_error: 'Email is required',
  }),
  password: z.string({
    required_error: 'Password is required',
  }),
  browser: z
    .enum(['chrome', 'firefox', 'safari', 'brave', 'opera', 'other'])
    .default('other'),
});

export type loginUserBodySchema = z.infer<typeof loginUserBodySchema>;

export const loginUserJSONSchema = {
  body: zodToJsonSchema(loginUserBodySchema, 'loginUserBodySchema'),
};

const getUserByIdParamsSchema = z.object({
  id: z.string({
    required_error: 'Id is required',
  }),
});

export type getUserByIdParamsSchema = z.infer<typeof getUserByIdParamsSchema>;

export const getUserByIdJSONSchema = {
  params: zodToJsonSchema(getUserByIdParamsSchema, 'getUserByIdParamsSchema'),
};

const getMostActiveUsersQuerySchema = z.object({
  role: z
    .enum([
      'admin',
      'student',
      'guest',
      'marketing_coordinator',
      'marketing_manager',
    ])
    .optional(),
});

export type getMostActiveUsersQuerySchema = z.infer<
  typeof getMostActiveUsersQuerySchema
>;

export const getMostActiveUsersJSONSchema = {
  querystring: zodToJsonSchema(
    getMostActiveUsersQuerySchema,
    'getMostActiveUsersQuerySchema',
  ),
};
