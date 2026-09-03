import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { LoggerService } from '~common/logger';
import { makeId } from '~common/utils/short-uuid';

import { PrismaClient } from '~database/prisma/client';

import { PrismaConfig } from './prisma.config';
import { getPrismaClient } from './prisma-client.helper';

/**
 * Provide a temporary database
 *  - clone the current state of the input database
 */
@Injectable()
export class PrismaEphemeralService implements OnModuleInit, OnModuleDestroy {
  public client!: PrismaClient;

  private readonly sourceDatabaseUrl: string;
  private readonly sourceDatabaseName: string;
  private readonly sourceDatabaseQuery: string;
  private readonly sourceDatabaseSchema = 'public';

  private readonly schemaName?: string;
  private readonly databaseName?: string;
  public readonly databaseUrl: string;
  private readonly prefix = 'ephemeral';

  public destroyOnExit: boolean;
  public mode: 'schema' | 'database';

  constructor(
    private readonly config: PrismaConfig,
    private readonly logger: LoggerService,
  ) {
    process.env.CHECKPOINT_DISABLE = '1';

    this.destroyOnExit = config.ephemeralDestroyOnExit;
    this.mode = config.ephemeralMode;

    const match = config.url.match(/postgres(ql)?:\/\/(?<url>[^/]+)\/(?<name>[^/?]+)(?<query>\?[^#]*)?/);
    if (!match || !match.groups) {
      throw new Error('Invalid database url');
    }
    const { url, name, query } = match.groups;

    this.sourceDatabaseName = name;
    this.sourceDatabaseUrl = `postgresql://${url}`;
    this.sourceDatabaseQuery = query || '';

    if (this.mode === 'schema') {
      this.schemaName = `${this.prefix}-${makeId()}`;
      this.databaseUrl = `postgresql://${url}/${name}${query ? `${query}&` : '?'}schema=${this.schemaName}`;
    } else {
      this.databaseName = `${this.prefix}-${makeId()}`;
      this.databaseUrl = `postgresql://${url}/${this.databaseName}${query ? `${query}&` : '?'}connection_limit=1`;
    }
  }

  /**
   * Destroy all ephemeral databases
   */
  async destroyAllEphemeral() {
    if (this.mode === 'schema') {
      const client = PrismaEphemeralService.getClient(
        `${this.sourceDatabaseUrl}/${this.sourceDatabaseName}${this.sourceDatabaseQuery}`,
        this.config,
      );

      // language=SQL
      await client.$executeRawUnsafe(`
DO $$DECLARE
    schemata RECORD;
BEGIN
  FOR schemata IN (SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE '${this.prefix}%' )
    LOOP
      EXECUTE 'DROP SCHEMA IF EXISTS "' || schemata.schema_name || '" CASCADE';
    END LOOP;
END$$;`);
    } else {
      const client = PrismaEphemeralService.getClient(this.sourceDatabaseUrl, this.config);

      // language=SQL
      await client.$executeRawUnsafe(`
DO $$DECLARE
    databases RECORD;
BEGIN
  FOR databases IN (SELECT datname FROM pg_database WHERE datname LIKE '${this.prefix}%' )
    LOOP
      EXECUTE 'DROP DATABASE IF EXISTS "' || databases.datname || '"';
    END LOOP;
END$$;`);
    }
  }

  async destroyEphemeral() {
    if (this.mode === 'schema') {
      const client = PrismaEphemeralService.getClient(
        `${this.sourceDatabaseUrl}/${this.sourceDatabaseName}${this.sourceDatabaseQuery}`,
        this.config,
      );
      if (!this.schemaName) {
        throw new Error('Schema name is not defined');
      }
      await client.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${this.schemaName}" CASCADE;`);
    } else {
      const client = PrismaEphemeralService.getClient(this.sourceDatabaseUrl, this.config);
      if (!this.databaseName) {
        throw new Error('Database name is not defined');
      }
      await client.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${this.databaseName}";`);
    }
  }

  async createEphemeral() {
    if (this.mode === 'schema') {
      const client = PrismaEphemeralService.getClient(
        `${this.sourceDatabaseUrl}/${this.sourceDatabaseName}${this.sourceDatabaseQuery}`,
        this.config,
      );
      if (!this.schemaName) {
        throw new Error('Schema name is not defined');
      }
      await client.$executeRawUnsafe(`CREATE SCHEMA "${this.schemaName}";`);

      /**
       * Create the ephemeral database schema from the ${sourceDatabaseSchema} schema and copy over data
       *  - we expect the ${sourceDatabaseSchema} schema to exist and to be fully migrated
       *  - no indexes, constraints, types, or triggers are copied over
       */

      // language=SQL
      await client.$executeRawUnsafe(`
DO $$DECLARE
    tbl_record RECORD;
BEGIN
    FOR tbl_record IN (SELECT tablename FROM pg_tables WHERE schemaname = '${this.sourceDatabaseSchema}') LOOP
        EXECUTE 'CREATE TABLE "${this.schemaName}".' || quote_ident(tbl_record.tablename) || ' (LIKE ${this.sourceDatabaseSchema}.' || quote_ident(tbl_record.tablename) || ' INCLUDING ALL)';
    END LOOP;
END$$;`);

      // language=SQL
      await client.$executeRawUnsafe(`
DO $$DECLARE
    tbl_record RECORD;
BEGIN
    FOR tbl_record IN (SELECT tablename FROM pg_tables WHERE schemaname = '${this.sourceDatabaseSchema}') LOOP
        EXECUTE 'INSERT INTO "${this.schemaName}".' || quote_ident(tbl_record.tablename) || ' SELECT * FROM ${this.sourceDatabaseSchema}.' || quote_ident(tbl_record.tablename);
    END LOOP;
END$$;`);
    } else {
      const client = PrismaEphemeralService.getClient(this.sourceDatabaseUrl, this.config);

      if (!this.databaseName) {
        throw new Error('Database name is not defined');
      }

      /**
       * Copy the entire database into the ephemeral database
       */

      await client.$executeRawUnsafe(`SELECT pg_try_advisory_lock(hashtext('template-database-lock'));`);
      await client.$executeRawUnsafe(
        `CREATE DATABASE "${this.databaseName}" WITH TEMPLATE "${this.sourceDatabaseName}";`,
      );
      await client.$executeRawUnsafe(`SELECT pg_advisory_unlock(hashtext('template-database-lock'));`);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.$disconnect();
    }
    if (this.destroyOnExit) {
      await this.destroyEphemeral();
    }
  }

  async onModuleInit() {
    // await this.destroyAllEphemeralSchemas();
    await this.createEphemeral();

    this.client = getPrismaClient(
      {
        ...this.config,
        url: this.databaseUrl,
        connectionName: this.mode === 'schema' ? this.schemaName : this.databaseName,
      },
      this.logger,
    );
  }

  private static clients: Record<string, PrismaClient> = {};
  private static getClient(url: string, config: PrismaConfig) {
    if (!this.clients[url]) {
      this.clients[url] = getPrismaClient({
        ...config,
        url: url.includes('?') ? `${url}&connection_limit=1` : `${url}?connection_limit=1`,
      });
    }
    return this.clients[url];
  }
}
