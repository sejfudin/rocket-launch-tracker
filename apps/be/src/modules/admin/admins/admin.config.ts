import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { ConfigDecorator } from '~common/config';

@ConfigDecorator('admin')
export class AdminConfig {
  /**
   * Secret needed to create an admin user
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly createSecret?: string;
}
