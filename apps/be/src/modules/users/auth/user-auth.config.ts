import { Expose } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

import { ConfigDecorator } from '~common/config';

@ConfigDecorator('user.auth')
export class UserAuthConfig {
  @Expose()
  @IsString()
  readonly secret!: string;

  /**
   * What url to send users to for email single use codes ( magic, password reset )
   *  defaults to the api callback handler
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly callbackUrl?: string;

  /**
   * Where the backend redirects the user to after successful login
   * @example https://myapp.com/auth/callback
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly redirectUrl?: string;

  /**
   * Time (in seconds) that magic-links and passwords resets are valid for
   */
  @Expose()
  @IsNumber()
  readonly nonceExpiration = 60 * 30;

  /**
   * Time (in seconds) to cache the user's permissions
   *  keep this short as users retain the access for the duration
   */
  @Expose()
  @IsNumber()
  readonly accessTokenExpiration = 5 * 60;

  /**
   * Enable refresh token support
   *  - alternative to sessions
   */
  @Expose()
  @IsBoolean()
  readonly refreshToken: boolean = true;

  /**
   * Time (in seconds) to cache the user's identity
   *  - this can be longer as we need to fetch new data ech time we make an access token
   */
  @Expose()
  @IsNumber()
  readonly refreshTokenExpiration = 7 * 24 * 60 * 60;

  /**
   * Extend the refresh token until it is valid
   */
  @Expose()
  @IsBoolean()
  readonly refreshTokenExtension = true;
}
