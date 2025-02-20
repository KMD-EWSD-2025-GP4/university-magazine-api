import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const registerUserBodySchema = z.object({
  email: z.string({
    required_error: 'Email is required',
  }),
  password: z.string({
    required_error: 'Password is required',
  }),
  firstName: z.string({
    required_error: 'First name is required',
  }),
  lastName: z.string({
    required_error: 'Last name is required',
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
});

export type loginUserBodySchema = z.infer<typeof loginUserBodySchema>;

export const loginUserJSONSchema = {
  body: zodToJsonSchema(loginUserBodySchema, 'loginUserBodySchema'),
};
