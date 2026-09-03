import { Injectable } from '@nestjs/common';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

import { IPushNotificationMessage, IPushNotificationTemplate, PushNotificationTemplateType } from '../models';
import { RegisterPushNotificationTemplate } from '../push-notification.decorator';

export class MyPushNotificationTemplateData {
  @Expose()
  @IsString()
  name!: string;
}

export const MyPushNotificationTemplate: IPushNotificationTemplate = {
  name: 'MY_PUSH_NOTIFICATION_TEMPLATE',
  title: 'Hello, {{name}}!',
  body: 'This is a notification for {{name}}',
  data: {
    custom: 10,
  },
  type: PushNotificationTemplateType.SYSTEM,
};

@Injectable()
export class MyPushNotificationTemplateProvider {
  @RegisterPushNotificationTemplate({
    validate: MyPushNotificationTemplateData,
    template: MyPushNotificationTemplate,
  })
  passwordReset(data: IPushNotificationMessage) {
    // This is a preprocessor that can modify the data before sending the email
    return data;
  }
}
