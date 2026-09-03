import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { LoggerService } from '~common/logger';
import { JsonUObject } from '~common/types';
import { MetadataService } from '~common/utils/nestjs';

import {
  IPushNotificationMessage,
  IPushNotificationTemplateData,
  IPushNotificationTemplateDecoratorOptions,
  PUSH_NOTIFICATION_TEMPLATE,
  PUSH_NOTIFICATION_TEMPLATE_CLASS_MARKER,
  PushNotificationTemplateType,
} from './models';
import { PushNotificationError } from './push-notification.exceptions';
import { PushNotificationProvider } from './push-notification-provider.abstract';

@Injectable()
export class PushNotificationLoader implements OnApplicationBootstrap {
  constructor(
    private readonly logger: LoggerService,
    private readonly metadataService: MetadataService,
  ) {}

  onApplicationBootstrap() {
    this.loadStaticTemplates();
  }

  private loadStaticTemplates() {
    for (const { metadata, handler } of this.metadataService.getAllHandlers<
      IPushNotificationTemplateDecoratorOptions,
      [IPushNotificationMessage & IPushNotificationTemplateData],
      IPushNotificationMessage & IPushNotificationTemplateData
    >(PUSH_NOTIFICATION_TEMPLATE, {
      provider: true,
      classMarker: PUSH_NOTIFICATION_TEMPLATE_CLASS_MARKER,
    })) {
      metadata.forEach((m) => {
        this.registerStaticTemplate(m, handler);
      });
    }
  }

  /**
   * Templates loaded at start
   */
  public readonly staticTemplates: Record<
    string,
    {
      templateOptions: IPushNotificationTemplateDecoratorOptions;
      templateFunction: (
        data: IPushNotificationMessage & IPushNotificationTemplateData,
      ) => Promise<IPushNotificationMessage & IPushNotificationTemplateData>;
    }
  > = {};

  public registerStaticTemplate(
    templateOptions: IPushNotificationTemplateDecoratorOptions,
    templateFunction: (
      data: IPushNotificationMessage & IPushNotificationTemplateData,
    ) => Promise<IPushNotificationMessage & IPushNotificationTemplateData>,
  ): void {
    const name = templateOptions.template.name;

    if (!templateOptions.template.type) {
      templateOptions.template.type = PushNotificationTemplateType.SYSTEM;
    }
    if (!templateOptions.template.params && templateOptions.validate) {
      templateOptions.template.params = Object.keys(new templateOptions.validate()).map((key) => {
        return {
          name: key,
          required: true,
        };
      });
    }

    if (name in this.staticTemplates) {
      throw new Error(`Template ${name} already registered`);
    }
    this.logger.debug(`Registered static template {${name}}`);
    this.staticTemplates[name] = {
      templateOptions,
      templateFunction: (...args) => {
        try {
          return templateFunction(...args);
        } catch (error) {
          throw new PushNotificationError(`Error processing template {${name}}`, {
            cause: error,
            details: { template: name, data: args[0] as unknown as JsonUObject },
          });
        }
      },
    };
  }

  /**
   * Registered push notification providers
   */
  public providers: Record<string, PushNotificationProvider> = {};

  /**
   * Register a push notification provider by name
   */
  public registerProvider(name: string, provider: PushNotificationProvider): void {
    if (name in this.providers) {
      throw new Error(`Provider ${name} already registered`);
    }
    this.logger.debug(`Registered provider {${name}}`);
    this.providers[name] = provider;
  }
}
