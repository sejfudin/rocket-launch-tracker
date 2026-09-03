import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ConfigDecorator } from '~common/config';

@ConfigDecorator('media.awsS3.validationWebhook')
export class AwsS3MediaValidationWebhookConfig {
  @Expose()
  @IsBoolean()
  @IsNotEmpty()
  enabled = false;

  @Expose()
  @IsString()
  @IsOptional()
  secret?: string;
}
