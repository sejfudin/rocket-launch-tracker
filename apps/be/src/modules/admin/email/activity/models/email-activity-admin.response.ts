import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { IActivity } from '~common/activities/models';
import { EmailLogEvent, IEmailLog, IEmailSendResponse } from '~common/email/models';
import { BaseLogLevelEnum } from '~common/logger/base-logger.config';
import { JsonObject } from '~common/types';
import { IsJsonObject } from '~common/validate';

export class EmailActivityAdminResponse {
  @Expose()
  @IsUUID()
  readonly id!: string;

  @Expose()
  @IsString()
  readonly module!: string;

  @Expose()
  @IsString()
  readonly type!: string;

  @Expose()
  @IsDate()
  readonly timestamp!: Date;

  @Expose()
  @IsUUID()
  @IsOptional()
  readonly userId?: string;

  @Expose()
  @IsUUID()
  @IsOptional()
  readonly resourceId?: string;

  @Expose()
  @IsEnum(EmailLogEvent)
  @IsOptional()
  @ApiPropertyOptional({ enum: EmailLogEvent, enumName: 'EmailLogEvent' })
  readonly event!: EmailLogEvent;

  @Expose()
  @IsEnum(BaseLogLevelEnum)
  @IsOptional()
  @ApiPropertyOptional({ enum: BaseLogLevelEnum, enumName: 'BaseLogLevelEnum' })
  readonly level!: BaseLogLevelEnum;

  @Expose()
  @IsString()
  @IsOptional()
  readonly provider?: string;

  @Expose()
  @IsString({ each: true })
  @IsOptional()
  readonly to?: string[];

  @Expose()
  @IsString({ each: true })
  @IsOptional()
  readonly cc?: string[];

  @Expose()
  @IsString({ each: true })
  @IsOptional()
  readonly bcc?: string[];

  @Expose()
  @IsString()
  @IsOptional()
  readonly from?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly subject?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly htmlContent?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly textContent?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly template?: string;

  @Expose()
  @IsJsonObject()
  @IsOptional()
  readonly templateValues?: JsonObject;

  @Expose()
  @IsJsonObject()
  @IsOptional()
  readonly templateOptions?: JsonObject;

  @Expose()
  @IsJsonObject()
  @IsOptional()
  readonly response?: IEmailSendResponse;

  @Expose()
  @IsString()
  @IsOptional()
  readonly failedMessage?: string;

  constructor(data: IEmailActivityAdminResponse) {
    Object.assign(this, data);
  }

  static fromDomain(activity: IActivity): EmailActivityAdminResponse {
    const payload = activity.payload as unknown as IEmailLog;

    return new EmailActivityAdminResponse({
      id: activity.id,
      module: activity.module,
      type: activity.type,
      timestamp: activity.timestamp,
      userId: activity.userId,
      resourceId: activity.resourceId,

      event: payload.event,
      level: payload.level,
      provider: payload.provider,
      to: payload.to,
      cc: payload.cc,
      bcc: payload.bcc,
      from: payload.from,
      subject: payload.subject,
      htmlContent: payload.htmlContent,
      textContent: payload.textContent,
      template: payload.template,
      templateValues: payload.templateValues,
      templateOptions: payload.templateOptions,
      response: payload.response,
      failedMessage: payload.failedMessage,
    });
  }
}

export interface IEmailActivityAdminResponse extends EmailActivityAdminResponse {}
