import zennv from 'zennv';
import { z } from 'zod';

export const env = zennv({
  dotenv: true,
  schema: z.object({
    PORT: z.number().default(3000),
    HOST: z.string().default('localhost'),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
      .default('info'),
    DB_URL: z.string(),
    FRONTEND_URL: z.string().default('http://localhost:3000'),
    JWT_SECRET: z.string(),
    API_URL: z.string(),
  }),
});
