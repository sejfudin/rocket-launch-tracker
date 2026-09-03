import { Expose } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

import { IPushNotificationToken } from './push-notification-token.types';

export class PushNotificationTokenResponse {
  /**
   * Id
   */
  @Expose()
  @IsString()
  readonly id?: string;

  /**
   * Title
   * @example My Device
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly title?: string;

  /**
   * Token
   * @example My Device
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly token?: string;

  /**
   * Created At
   */
  @Expose()
  @IsDate()
  readonly createdAt!: Date;

  /**
   * Provider
   * @example fcm
   */
  @Expose()
  @IsString()
  readonly provider!: string;

  constructor(data: PushNotificationTokenResponse) {
    Object.assign(this, data);
  }

  static fromDomain(data: IPushNotificationToken): PushNotificationTokenResponse {
    return new PushNotificationTokenResponse(data);
  }
}
