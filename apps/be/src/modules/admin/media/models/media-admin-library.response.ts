import { Expose, Type } from 'class-transformer';
import { IsInt, IsNumber, IsString, ValidateNested } from 'class-validator';

import type { INamedIMediaConstraints } from '~common/media';

export class MediaAdminLibraryTypeResponse implements INamedIMediaConstraints {
  @Expose()
  @IsString()
  readonly label!: string;

  @Expose()
  @IsString()
  readonly name!: string;

  @Expose()
  @IsInt()
  readonly fileSize?: number;

  @Expose()
  @IsString({ each: true })
  readonly mimeTypes?: string[];

  @Expose()
  @IsNumber()
  readonly count?: number;

  constructor(data: Partial<MediaAdminLibraryTypeResponse>) {
    Object.assign(this, data);
  }

  static fromDomain(data: INamedIMediaConstraints): MediaAdminLibraryTypeResponse {
    return new MediaAdminLibraryTypeResponse(data);
  }
}

export class MediaAdminLibraryResponse {
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => MediaAdminLibraryTypeResponse)
  readonly types?: MediaAdminLibraryTypeResponse[];

  constructor(data: Partial<IMediaAdminLibraryResponse>) {
    Object.assign(this, data);
  }

  static fromDomain(settings: IMediaAdminLibraryResponse): MediaAdminLibraryResponse {
    return new MediaAdminLibraryResponse({
      ...settings,
      types: settings.types?.map((x) => MediaAdminLibraryTypeResponse.fromDomain(x)),
    });
  }
}

export interface IMediaAdminLibraryResponse extends MediaAdminLibraryResponse {}
