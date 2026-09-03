import { Expose } from 'class-transformer';
import { IsOptional, IsUUID } from 'class-validator';

import { RocketLaunchRequest } from '~modules/rocket/models';

export class RocketAdminLaunchRequest extends RocketLaunchRequest {
  /**
   * Launch Director ID
   */
  @Expose()
  @IsUUID()
  @IsOptional()
  readonly launchDirectorId?: string;
}
