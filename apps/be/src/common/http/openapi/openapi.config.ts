import { Expose, Transform } from 'class-transformer';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

import { ConfigDecorator } from '~common/config';

export class OpenApiConfigServe {
  @Expose()
  @IsString()
  @IsOptional()
  path = 'docs';

  @Expose()
  @IsString()
  @IsOptional()
  json?: string;

  @Expose()
  @IsString()
  @IsOptional()
  yaml?: string;

  @Expose()
  @IsString()
  @IsOptional()
  exclude?: string;

  @Expose()
  @IsString()
  @IsOptional()
  include?: string;

  @Expose()
  @IsString()
  @IsOptional()
  dump?: string;

  constructor(config: IOpenApiConfigServe) {
    Object.assign(this, config);
  }
}

export interface IOpenApiConfigServe extends OpenApiConfigServe {}

@ConfigDecorator('http.openapi')
export class OpenApiConfig {
  @Expose()
  @IsObject()
  @IsOptional()
  @Transform(({ obj }: { obj: OpenApiConfig }) => {
    if (typeof obj !== 'object' || obj === null) {
      return {};
    }
    const serve: Record<string, OpenApiConfigServe> = {};
    if (obj.serve) {
      for (const key of Object.keys(obj.serve)) {
        serve[key] = new OpenApiConfigServe(obj.serve[key]);
      }
    }
    return serve;
  })
  serve?: Record<string, OpenApiConfigServe>;

  @Expose()
  @IsString()
  @IsOptional()
  title = 'API Docs';

  @Expose()
  @IsString()
  @IsOptional()
  description = 'Documentation';

  @Expose()
  @IsBoolean()
  @IsOptional()
  dump?: boolean;
}
