import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

import { ConfigDecorator } from '~common/config';
import { TransformInputToBoolean } from '~common/validate';

@ConfigDecorator('prisma')
export class PrismaConfig {
  /**
   * Log levels to be displayed
   *  - 'info' | 'query' | 'warn' | 'error'
   * @see https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging
   */
  @Expose()
  @IsOptional()
  @IsString({ each: true })
  log?: Array<'info' | 'query' | 'warn' | 'error'>;

  /**
   * Automatically connect to the database when the application starts
   */
  @Expose()
  @IsOptional()
  @IsBoolean()
  @TransformInputToBoolean()
  autoConnect = true;

  /**
   * Migrate the database when `./scripts/migrate.sh` is executed
   */
  @Expose()
  @IsBoolean()
  @TransformInputToBoolean()
  autoMigrate = false;

  /**
   * Database connection string
   *  - sslmode=no-verify : disable ssl verification
   */
  @Expose()
  @IsOptional()
  @IsString()
  url!: string;

  @Expose()
  @IsBoolean()
  ephemeralDestroyOnExit = true;

  @Expose()
  @IsString()
  ephemeralMode: 'schema' | 'database' = 'database';

  @Expose()
  @IsString()
  @IsOptional()
  connectionName?: string = 'default';
}
