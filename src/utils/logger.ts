import { pino } from 'pino';
import { env } from '../config/env';

export const pinoLogger = {
  redact: [
    'DB_URL',
    'JWT_SECRET',
    'RESEND_API_KEY',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
  ],
  level: env.LOG_LEVEL,
  transport: {
    target: 'pino-pretty',
  },
};

export const logger = pino(pinoLogger);
