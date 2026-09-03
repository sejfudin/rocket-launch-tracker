import { Expose } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { ConfigDecorator } from '~common/config';

import { PushNotificationLogDetail, PushNotificationLogLevel, PushNotificationMode } from './models';

@ConfigDecorator('push-notifications')
export class PushNotificationConfig {
  @Expose()
  @IsOptional()
  @IsString()
  defaultProvider?: string = 'fcm';

  /**
   * Push notification sending mode
   * - enabled: send push notifications
   * - disabled: throw an error when sending push notifications
   * - suppressed: log push notifications but do not send
   */
  @Expose()
  @IsEnum(PushNotificationMode)
  mode: PushNotificationMode = PushNotificationMode.SUPPRESSED;

  /**
   * Push notification logging level
   * - none: do not log push notifications
   * - error: log only failed push notification sends
   * - debug: log all push notification sends (successful and failed)
   */
  @Expose()
  @IsEnum(PushNotificationLogLevel)
  @IsOptional()
  logLevel: PushNotificationLogLevel = PushNotificationLogLevel.ERROR;

  /**
   * Push notification log detail level - controls how much data is logged
   * - address: store only destination tokens
   * - details: store destination tokens and notification metadata (title, template name, provider)
   * - content: store destination, metadata, and full notification data (additionalData, providerResponse)
   */
  @Expose()
  @IsEnum(PushNotificationLogDetail)
  @IsOptional()
  logDetail: PushNotificationLogDetail = PushNotificationLogDetail.ADDRESS;
}
