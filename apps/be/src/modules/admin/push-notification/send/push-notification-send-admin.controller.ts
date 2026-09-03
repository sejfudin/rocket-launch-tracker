import { Body, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { NotImplementedException } from '~common/exceptions';
import { StatusResponseDto } from '~common/http/dtos';

import { AdminUserAclCheck } from '~modules/admin/admins/auth';
import { AdminController } from '~modules/admin/common';
import { LabelQueryDto } from '~modules/admin/common/models/label.filter.request';
import { LabelResponse } from '~modules/admin/common/models/label.response';

import {
  PUSH_NOTIFICATION_ADMIN_API_TAG,
  PUSH_NOTIFICATION_ADMIN_REST_PREFIX,
} from '../push-notification-admin.constants';
import { PushNotificationSendAdminRequest } from './models/push-notification-send-admin.request';
import { PushNotificationTemplateAdminSendRequest } from './models/push-notification-template-send-admin.request';
import { PushNotificationAdminSendService } from './push-notification-send-admin.service';

@AdminController(`${PUSH_NOTIFICATION_ADMIN_REST_PREFIX}`, { tags: PUSH_NOTIFICATION_ADMIN_API_TAG })
export class PushNotificationAdminSendController {
  constructor(private readonly pushNotificationAdminSendService: PushNotificationAdminSendService) {}

  @Post('send')
  @HttpCode(200)
  @AdminUserAclCheck('push-notification:send')
  @ApiOperation({ summary: 'Send push notification to specific device tokens' })
  async send(@Body() data: PushNotificationSendAdminRequest): Promise<StatusResponseDto> {
    if (data.sendToAll) {
      throw new NotImplementedException('Sending to all is not implemented yet');
    }
    await this.pushNotificationAdminSendService.send(data.toDomain());
    return StatusResponseDto.fromDomain({ code: 'ok', message: 'Push notification sent successfully' });
  }

  @Get('templates/labels')
  @AdminUserAclCheck('push-notification-template:send')
  async listLabels(@Query() query: LabelQueryDto): Promise<LabelResponse[]> {
    const templates = await this.pushNotificationAdminSendService.listLabels(query);
    return templates.map(LabelResponse.fromDomain);
  }

  @Post('templates/send')
  @AdminUserAclCheck('push-notification:send')
  @ApiOperation({ summary: 'Send push notification using a template' })
  async sendTemplate(@Body() data: PushNotificationTemplateAdminSendRequest): Promise<StatusResponseDto> {
    if (data.sendToAll) {
      throw new NotImplementedException('Sending to all is not implemented yet');
    }
    await this.pushNotificationAdminSendService.sendTemplate(data);
    return StatusResponseDto.fromDomain({ code: 'ok', message: 'Push notification sent successfully' });
  }
}
