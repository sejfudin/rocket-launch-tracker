import { Expose } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { ConfigDecorator } from '~common/config';
import { TransformInputToArray } from '~common/validate';

import { EmailLogDetail, EmailLogLevel, EmailMode } from './models';
import { IsEmailWithOptionalName } from './validators/email-with-optional-name.validator';

@ConfigDecorator('email')
export class EmailConfig {
  /**
   * Email sending mode
   * - enabled: send emails
   * - disabled: throw an error when sending emails
   * - suppressed: log emails but do not send
   */
  @Expose()
  @IsEnum(EmailMode)
  mode: EmailMode = EmailMode.SUPPRESSED;

  @Expose()
  @IsOptional()
  @IsString()
  defaultProvider?: string;

  @Expose()
  @IsOptional()
  @IsEmailWithOptionalName()
  defaultFrom?: string;

  @Expose()
  @IsOptional()
  @TransformInputToArray({ transformer: String })
  @IsEmailWithOptionalName({ each: true })
  defaultReplyTo?: string[];

  /**
   * Email logging level
   * - none: do not log emails
   * - error: log only failed email sends
   * - debug: log all email sends (successful and failed)
   */
  @Expose()
  @IsEnum(EmailLogLevel)
  @IsOptional()
  logLevel: EmailLogLevel = EmailLogLevel.ERROR;

  /**
   * Email log detail level - controls how much data is logged
   * - address: store only destination addresses (to, cc, bcc)
   * - details: store destination and email metadata (subject, template name, provider)
   * - content: store destination, metadata, and rendered content (html, text)
   */
  @Expose()
  @IsEnum(EmailLogDetail)
  @IsOptional()
  logDetail: EmailLogDetail = EmailLogDetail.ADDRESS;
}
