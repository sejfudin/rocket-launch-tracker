import { Expose, Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

import { ConfigDecorator } from '~common/config';

@ConfigDecorator('rocket')
export class RocketConfig {
  @Expose()
  @IsNumber()
  @Type(() => Number)
  readonly speedFactor = 1;
}
