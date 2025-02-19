import { env } from './config/env';
import { db } from './db';
import { logger } from './utils/logger';
import { createServer } from './utils/server';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { generateFaculties } from './utils/seed';
async function gracefulShutdown({
  app,
  signal,
}: {
  app: Awaited<ReturnType<typeof createServer>>;
  signal: string;
}) {
  logger.info(`${signal} signal received. Starting graceful shutdown...`);

  try {
    await app.close();
    logger.info('Server closed');

    // Close database connection
    await db.$client.end();
    logger.info('Database connection closed');

    process.exit(0);
  } catch (err) {
    logger.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
}

async function main() {
  let app: Awaited<ReturnType<typeof createServer>> | undefined;
  try {
    app = await createServer();
    const SIGNALS = ['SIGINT', 'SIGTERM'];

    // Register signal handlers before starting the server
    SIGNALS.forEach((signal) => {
      process.on(signal, () => gracefulShutdown({ app: app!, signal }));
    });

    await migrate(db, {
      migrationsFolder: './drizzle/migrations',
    });
    await generateFaculties();
    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    logger.debug(env, 'Environment variables');
    app.ready().then(() => {
      logger.info(`Server successfully started and ready to accept requests.`);
    });
  } catch (err) {
    console.error('Startup error:', err); // Log to console for immediate visibility
    logger.error('Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause,
    });

    if (app) {
      await gracefulShutdown({ app, signal: 'STARTUP_ERROR' });
    }
    process.exit(1);
  }
}

main().catch((err) => {
  logger.error('Fatal error:', err);
  process.exit(1);
});
