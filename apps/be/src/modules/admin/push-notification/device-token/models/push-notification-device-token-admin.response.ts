import { Expose, Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

import { IPushNotificationToken } from '~common/push-notifications/models';

export class PushNotificationDeviceTokenAdminResponse {
  @Expose()
  @IsString()
  readonly id!: string;

  @Expose()
  @IsString()
  readonly resourceName!: string;

  @Expose()
  @IsString()
  readonly resourceLabel?: string;

  @Expose()
  @IsString()
  readonly title?: string;

  @Expose()
  @IsString()
  readonly module?: string;

  @Expose()
  @IsString()
  readonly resourceId?: string;

  @Expose()
  @IsString()
  readonly provider!: string;

  @Expose()
  @IsString()
  readonly token!: string;

  @Expose()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readonly expiresAt?: Date;

  @Expose()
  @IsDate()
  @Type(() => Date)
  readonly createdAt!: Date;

  constructor(data: PushNotificationDeviceTokenAdminResponse) {
    Object.assign(this, data);
  }

  static fromDomain(data: IPushNotificationToken): PushNotificationDeviceTokenAdminResponse {
    return new PushNotificationDeviceTokenAdminResponse({
      id: data.id,
      resourceName: data.resourceName,
      resourceLabel: data.resourceLabel,
      module: data.module,
      resourceId: data.resourceId,
      provider: data.provider,
      title: data.title,
      token: data.token,
      expiresAt: data.expiresAt,
      createdAt: data.createdAt,
    });
  }
}
