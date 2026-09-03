import { Expose, Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class RocketLaunchRequest {
  /**
   * Launch After
   */
  @Expose()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  readonly launchAfter?: Date;
}
