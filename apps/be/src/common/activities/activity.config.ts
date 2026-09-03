import { Expose } from 'class-transformer';
import { IsEnum } from 'class-validator';

import { ConfigDecorator } from '~common/config';
import { TransformInputToBoolean } from '~common/validate';

export enum ActivityMode {
  ENABLED = 'enabled',
  DEFFERED = 'deferred',
  DISABLED = 'disabled',
}

@ConfigDecorator('activities')
export class ActivityConfig {
  @Expose()
  @IsEnum(ActivityMode)
  @TransformInputToBoolean()
  mode: ActivityMode = ActivityMode.ENABLED;
}
