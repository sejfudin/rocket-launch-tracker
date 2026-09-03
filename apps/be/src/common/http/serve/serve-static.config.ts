import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

import { ConfigDecorator } from '~common/config';
import { TransformInputToArray, TransformInputToBoolean } from '~common/validate';

class ServeStaticPath {
  /**
   * System path to the files
   */
  @Expose()
  @IsString()
  readonly rootPath!: string;

  /**
   * Url on the server to serve the files at
   *  - use express format "{*path}"
   */
  @Expose()
  @IsString()
  readonly serveRoot: string = '/';

  /**
   * List of excluded prefixes
   */
  @Expose()
  @IsString({ each: true })
  @TransformInputToArray()
  @IsOptional()
  readonly exclude?: string[];

  /**
   * File to serve, if requested file/folder not found
   * profile/me => index.html
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly fallbackIndex: string | null = 'null';

  @Expose()
  @IsObject()
  @IsOptional()
  readonly serveStaticOptions?: object;
}

@ConfigDecorator('static')
export class ServeStaticConfig {
  @Expose()
  @IsBoolean()
  @TransformInputToBoolean()
  readonly enabled = false;

  @Expose()
  @IsBoolean()
  @TransformInputToBoolean()
  readonly log = false;

  @Expose()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ServeStaticPath)
  readonly paths?: ServeStaticPath[];
}
