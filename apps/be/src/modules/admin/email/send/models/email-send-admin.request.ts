import { Expose, Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

import { IsEmailWithOptionalName } from '~common/email/validators';

const htmlRegex = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;

export class EmailSendAdminRequest {
  @Expose()
  @IsArray()
  @IsEmailWithOptionalName({ each: true })
  readonly to!: string[];

  @Expose()
  @IsString()
  readonly subject!: string;

  @Expose()
  @IsString()
  readonly htmlContent!: string;

  /**
   * Optional text content
   *  defaults to cleaned up htmlContent
   */
  @Expose()
  @IsString()
  @IsOptional()
  @Transform(
    ({ value, obj }: { value: string; obj: EmailSendAdminRequest }) => value ?? obj.htmlContent.replace(htmlRegex, ''),
  )
  readonly textContent!: string;

  @Expose()
  @IsArray()
  @IsEmailWithOptionalName({ each: true })
  @IsOptional()
  readonly cc?: string[];

  @Expose()
  @IsArray()
  @IsEmailWithOptionalName({ each: true })
  @IsOptional()
  readonly bcc?: string[];

  @Expose()
  @IsString()
  @IsOptional()
  readonly provider?: string;
}
