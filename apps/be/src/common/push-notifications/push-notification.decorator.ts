// oxlint-disable no-unsafe-member-access
// oxlint-disable @typescript-eslint/no-explicit-any

import { extendArrayMetadata } from '@nestjs/common/utils/extend-metadata.util';

import {
  type IPushNotificationTemplateDecoratorOptions,
  PUSH_NOTIFICATION_TEMPLATE,
  PUSH_NOTIFICATION_TEMPLATE_CLASS_MARKER,
  PushNotificationTemplateType,
} from './models';

/**
 * Mark method as an email template preprocessor
 */
export function RegisterPushNotificationTemplate(
  options: Omit<IPushNotificationTemplateDecoratorOptions, 'type'> & { type?: PushNotificationTemplateType },
): MethodDecorator {
  const decoratorFactory = (target: object, key?: any, descriptor?: any) => {
    if (descriptor && typeof descriptor.value === 'function') {
      extendArrayMetadata(PUSH_NOTIFICATION_TEMPLATE, [options], descriptor.value);
      Reflect.defineMetadata(PUSH_NOTIFICATION_TEMPLATE_CLASS_MARKER, true, target.constructor);
    }
    return descriptor;
  };
  decoratorFactory.KEY = PUSH_NOTIFICATION_TEMPLATE;
  return decoratorFactory;
}
