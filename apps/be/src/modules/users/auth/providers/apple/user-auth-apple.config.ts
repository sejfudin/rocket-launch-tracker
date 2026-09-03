import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, ValidateIf } from 'class-validator';

import { ConfigDecorator } from '~common/config';

@ConfigDecorator('user.auth.apple')
export class UserAuthAppleConfig {
  @Expose()
  @IsBoolean()
  readonly enabled = false;

  @Expose()
  @IsString()
  @ValidateIf((x: UserAuthAppleConfig) => x.enabled)
  readonly clientID!: string;

  @Expose()
  @IsString()
  @ValidateIf((x: UserAuthAppleConfig) => x.enabled)
  readonly teamID!: string;

  @Expose()
  @IsString()
  @ValidateIf((x: UserAuthAppleConfig) => x.enabled)
  readonly keyID!: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly callbackURL?: string;
}
