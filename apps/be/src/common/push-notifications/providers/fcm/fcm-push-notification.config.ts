import { Expose, Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

import { ConfigDecorator } from '~common/config';

@ConfigDecorator('push-notifications.fcm')
export class FcmPushNotificationConfig {
  @Expose()
  @IsBoolean()
  readonly enabled = false;

  @Expose()
  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: string }) => value.replace(/\\n|\\r\\n|\\r/g, '\n'))
  readonly privateKey?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly clientEmail?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly projectId?: string;
}
