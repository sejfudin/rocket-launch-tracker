import { Expose, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

import { IsEmailWithOptionalName } from '~common/email';

export class EmailTemplateSendAdminRequestVariable {
  @Expose()
  @IsString()
  readonly param!: string;

  @Expose()
  @IsString()
  readonly value!: string;
}

export class EmailTemplateSendAdminRequest {
  @Expose()
  @IsArray()
  @IsEmailWithOptionalName({ each: true })
  readonly to!: string[];

  /**
   * Optional cc override
   */
  @Expose()
  @IsArray()
  @IsEmailWithOptionalName({ each: true })
  @IsOptional()
  readonly cc?: string[];

  /**
   * Optional bcc override
   */
  @Expose()
  @IsArray()
  @IsEmailWithOptionalName({ each: true })
  @IsOptional()
  readonly bcc?: string[];

  /**
   * Optional subject override
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly subject?: string;

  /**
   * Optional html override
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly html?: string;

  /**
   * Optional text override
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly textContent?: string;

  @Expose()
  @IsString()
  readonly templateName!: string;

  @Expose()
  @Type(() => EmailTemplateSendAdminRequestVariable)
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  readonly templateVariables?: EmailTemplateSendAdminRequestVariable[];

  @Expose()
  @IsString()
  @IsOptional()
  readonly provider?: string;
}
