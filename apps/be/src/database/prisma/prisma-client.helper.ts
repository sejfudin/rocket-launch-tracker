import { PrismaPg } from '@prisma/adapter-pg';

import type { BaseLogLevel, LoggerService } from '~common/logger';

import { type Prisma, PrismaClient } from './client';
import { type PrismaConfig } from './prisma.config';

type IPrismaClient = PrismaClient<'info' | 'query' | 'warn' | 'error'>;

export function getPrismaClient(prismaConfig: PrismaConfig, logger?: LoggerService): IPrismaClient {
  const adapter = new PrismaPg({
    /**
     * Trust the database connection string from schema.prisma
     *  Defaults to DATABASE_URL, and it set at `prisma:bootstrap`
     *  and it should equal to `prismaConfig.databaseUrl`
     */
    connectionString: prismaConfig.url,
  });
  const client = new PrismaClient({
    adapter,

    transactionOptions: {
      //maxWait: 2000,
      //timeout: 5000,
      /**
       * The isolation level of the transaction, Serializable is most strict
       *  @see https://www.prisma.io/docs/orm/prisma-client/queries/transactions#transaction-isolation-level
       */
      isolationLevel: 'Serializable',
    },

    /**
     * Log Prisma Client queries as events to the logger
     */
    log: prismaConfig.log?.map((level) => ({ emit: 'event', level })),
  }) as IPrismaClient;

  /**
   * enhancement: add runtime logs of events linked to requests
   *    $extends(
   *       Prisma.defineExtension({
   *         query: {
   *           $allOperations(params) {
   *             console.log(loggerStore.getStore());
   *             return;
   *           },
   *         },
   *       }),
   *     );
   */

  if (logger) {
    for (const [a, b] of [
      ['info', 'debug'],
      ['warn', 'warn'],
      ['error', 'error'],
    ] as [Prisma.LogLevel, BaseLogLevel & keyof LoggerService][]) {
      if (prismaConfig.log?.includes(a) && logger.isLevelEnabled(b)) {
        client.$on(a, (event) => {
          if ('message' in event) {
            const { message, ...rest } = event;
            if (b === 'error' && message.includes('E57P01')) {
              // ADMIN_SHUTDOWN - database closed the (idle) connection
              logger.send({
                message,
                level: 'debug',
                data: { ...rest, connection: prismaConfig.connectionName },
              });
            } else {
              logger.send({
                message,
                level: b,
                data: { ...rest, connection: prismaConfig.connectionName },
              });
            }
          } else {
            logger.send({
              data: { ...event, connection: prismaConfig.connectionName },
              type: 'query',
              level: b,
            });
          }
        });
      }
    }

    if (prismaConfig.log?.includes('query') && logger.isLevelEnabled('debug')) {
      client.$on('query', (event) => {
        const params = event.params.replace(/(^\[)|(]$)/g, '').split(',');
        logger.send({
          data: { ...event, params, connection: prismaConfig.connectionName },
          type: 'query',
          message: 'Query',
          level: 'debug',
        });
      });
    }
  }
  return client;
}
