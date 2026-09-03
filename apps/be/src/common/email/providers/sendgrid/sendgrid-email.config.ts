import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ConfigDecorator } from '~common/config';

@ConfigDecorator('email.sendgrid')
export class SendgridEmailConfig {
  @Expose()
  @IsBoolean()
  @IsOptional()
  readonly enabled = false;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o: SendgridEmailConfig) => o.enabled)
  readonly apiKey?: string;
}
