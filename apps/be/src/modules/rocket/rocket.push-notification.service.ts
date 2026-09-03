import { Injectable } from '@nestjs/common';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

import { RegisterPushNotificationTemplate } from '~common/push-notifications';
import {
  IPushNotificationMessage,
  IPushNotificationTemplate,
  PushNotificationTemplateType,
} from '~common/push-notifications/models';

export class RocketLaunchResultTemplateParameters {
  @Expose()
  @IsString()
  name!: string;

  @Expose()
  @IsString()
  result!: string;
}

export const RocketLaunchResultTemplate: IPushNotificationTemplate = {
  name: 'rocket-launch-result',
  title: 'Rocket {{name}} {{result}}',
  body: 'Rocket {{name}} {{result}}',
  type: PushNotificationTemplateType.SYSTEM,
};

@Injectable()
export class RocketPushNotificationService {
  @RegisterPushNotificationTemplate({
    template: RocketLaunchResultTemplate,
    validate: RocketLaunchResultTemplateParameters,
  })
  rocketLaunchResult(message: IPushNotificationMessage) {
    return message;
  }
}
