import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, ValidateIf } from 'class-validator';

import { ConfigDecorator } from '~common/config';

@ConfigDecorator('user.auth.google')
export class UserAuthGoogleConfig {
  @Expose()
  @IsBoolean()
  readonly enabled = false;

  @Expose()
  @IsString()
  @ValidateIf((x: UserAuthGoogleConfig) => x.enabled)
  readonly clientID!: string;

  @Expose()
  @IsString()
  @ValidateIf((x: UserAuthGoogleConfig) => x.enabled)
  readonly clientSecret!: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly callbackURL?: string;
}
