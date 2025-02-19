import { pino } from 'pino';
import { env } from '../config/env';

export const pinoLogger = {
  redact: ['DB_URL', 'JWT_SECRET'],
  level: env.LOG_LEVEL,
  transport: {
    target: 'pino-pretty',
  },
};

export const logger = pino(pinoLogger);
