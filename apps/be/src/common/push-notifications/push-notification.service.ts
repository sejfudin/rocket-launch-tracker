import { Injectable, Optional } from '@nestjs/common';

import { ActivityService } from '~common/activities/activity.service';
import { BaseLogLevel, BaseLogLevelEnum, LogLevelOrder, LoggerService } from '~common/logger';
import { PushNotificationTokenPersistor } from '~common/push-notifications/push-notification-token-persistor.abstract';
import type { JsonObject } from '~common/types';
import { plainToValidatedInstance } from '~common/validate';

import {
  IPushNotificationData,
  IPushNotificationLog,
  IPushNotificationMessage,
  IPushNotificationMessageResponse,
  IPushNotificationTemplate,
  IPushNotificationTemplateData,
  PushNotificationLogDetail,
  PushNotificationLogEvent,
  PushNotificationMode,
} from './models';
import { PushNotificationConfig } from './push-notification.config';
import { PushNotificationError } from './push-notification.exceptions';
import { PushNotificationLoader } from './push-notification.loader';
import { PushNotificationTemplateProvider } from './push-notification-template-provider.abstract';

export type IPushNotificationSendMessage = IPushNotificationData &
  IPushNotificationTemplateData & {
    /**
     * Resolve the destination via the resource name
     */
    resourceName?: string;

    /**
     * Resolve destination via tokens
     */
    tokens?: string[];

    /**
     * Providers and targets have different interfaces
     *  it is impossible to create a common interface for all of them
     *  use the following object to pass provider specific data
     *
     *  @example
     *   {
     *     fcm: { notification: { body: 'A longer message' } }
     *   }
     */
    providerOptions?: Record<string, JsonObject>;
  };

@Injectable()
export class PushNotificationService {
  constructor(
    private readonly logger: LoggerService,
    private readonly pushNotificationTokenPersistor: PushNotificationTokenPersistor,
    private readonly loader: PushNotificationLoader,
    private readonly config: PushNotificationConfig,
    @Optional()
    private readonly activityService: ActivityService,
    @Optional()
    private readonly pushNotificationTemplateProvider: PushNotificationTemplateProvider,
  ) {
    this.enabledLogLevels = new Set(LogLevelOrder.slice(0, LogLevelOrder.indexOf(this.config.logLevel) + 1));
  }

  /**
   * Send message to a resource
   *  - resolve providers/topics and send potentially many messages
   */
  public async send(message: IPushNotificationSendMessage): Promise<IPushNotificationMessageResponse[]> {
    const messages: Array<IPushNotificationMessage & IPushNotificationTemplateData & { resourceName?: string }> = [];

    const providerTokens: Record<string, string[]> = {};

    if (message.tokens) {
      for (const { token, provider } of await this.pushNotificationTokenPersistor.list({
        where: { token: message.tokens },
        take: message.tokens.length,
      })) {
        if (!providerTokens[provider]) {
          providerTokens[provider] = [];
        }
        providerTokens[provider].push(token);
      }
    }

    if (message.resourceName) {
      let results;
      let i = 0;
      do {
        results = await this.pushNotificationTokenPersistor.list({
          where: { resourceName: message.resourceName },
          take: 50,
          skip: i * 50,
        });
        for (const { token, provider } of results) {
          if (!providerTokens[provider]) {
            providerTokens[provider] = [];
          }
          providerTokens[provider].push(token);
        }
        i++;
      } while (results.length > 49);
    }

    for (const [provider, tokens] of Object.entries(providerTokens)) {
      messages.push({
        token: tokens,
        resourceName: message.resourceName,
        data: message.data,
        title: message.title,
        body: message.body,
        imageUrl: message.imageUrl,
        providerOptions: message.providerOptions?.[provider],
        template: message.template,
        templateValues: message.templateValues,
        provider,
      });
    }

    return await Promise.all(messages.map((m) => this.sendProviderMessage(m))).then((r) => r.flat());
  }

  /**
   * Convenience method to send a template to a resource
   */
  public async sendTemplate<T = JsonObject>(
    message: IPushNotificationData & {
      resourceName?: string;
      tokens?: string[];
      providerOptions?: Record<string, JsonObject>;
    },
    template: string,
    templateValues: T,
  ) {
    return this.send({ ...message, template, templateValues: templateValues as JsonObject });
  }

  /**
   * Send a message to a known provider with a topic/token
   */
  public async sendProviderMessage(
    message: IPushNotificationMessage & IPushNotificationTemplateData & { resourceName?: string },
  ): Promise<IPushNotificationMessageResponse[]> {
    if (this.config.mode === PushNotificationMode.DISABLED) {
      throw new PushNotificationError('Push notification sending is disabled', {
        code: 'push-notification-sending-disabled',
      });
    }

    if (!this.loader.providers[message.provider]) {
      this.logger.error(`Push notification provider ${message.provider} not found`);
      await this.log(PushNotificationLogEvent.FAILED, BaseLogLevelEnum.error, message, {
        error: new Error(`Push notification provider ${message.provider} not found`),
      });
      return [];
    }

    let _message = message;

    if (_message.template) {
      let templateValues = message.templateValues || {};
      let template: IPushNotificationTemplate | undefined = undefined;

      if (this.loader.staticTemplates[_message.template]) {
        const { templateOptions, templateFunction } = this.loader.staticTemplates[_message.template];
        if (templateOptions.validate) {
          templateValues = plainToValidatedInstance(templateOptions.validate, templateValues) as JsonObject;
        }
        _message = await templateFunction({ ...message, templateValues });
        template = templateOptions.template;
      }

      /**
       * Render template from persistence
       *  - templateFunction can change/disable the template
       */
      if (this.pushNotificationTemplateProvider && _message.template) {
        const persistedTemplate = await this.pushNotificationTemplateProvider.find({ name: _message.template });
        if (persistedTemplate) {
          template = persistedTemplate;
        }
      }

      if (template) {
        for (const field of ['title', 'body', 'imageUrl'] as const) {
          if (template[field] && !_message[field]) {
            _message[field] = this.replaceTemplateValues(template[field], templateValues);
          }
        }
        if (!_message.data && template.data) {
          _message.data = template.data;
        }
      } else {
        throw new PushNotificationError(`Push notification template '${message.template}' not found`);
      }
    }

    if (this.config.mode === PushNotificationMode.SUPPRESSED) {
      await this.log(PushNotificationLogEvent.SUPPRESSED, BaseLogLevelEnum.warn, _message);
      return [];
    }

    let response: IPushNotificationMessageResponse[];
    try {
      response = await this.loader.providers[message.provider].sendMessage(_message);
      await this.log(PushNotificationLogEvent.SENT, BaseLogLevelEnum.log, _message, { response });
    } catch (e) {
      await this.log(PushNotificationLogEvent.FAILED, BaseLogLevelEnum.error, _message, {
        error: e instanceof Error ? e : new Error(String(e)),
      });
      return [
        {
          ...message,
          error: e instanceof Error ? e : String(e),
        },
      ];
    }

    const invalidTokens = response
      .filter((r) => r.invalidToken && typeof r.token === 'string')
      .map((r) => r.token) as string[];
    if (invalidTokens.length > 0) {
      await this.pushNotificationTokenPersistor.delete({ token: invalidTokens });
    }

    return response;
  }

  private replaceTemplateValues(templateString: string, values: JsonObject): string {
    if (values && Object.keys(values).length > 0) {
      for (const [key, value] of Object.entries(values)) {
        const stringValue = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
        templateString = templateString.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), stringValue);
      }
    }
    return templateString;
  }

  private enabledLogLevels: Set<BaseLogLevel>;

  private async log(
    event: PushNotificationLogEvent,
    level: BaseLogLevelEnum,
    data: IPushNotificationMessage & IPushNotificationTemplateData & { resourceName?: string },
    context?: {
      module?: string;
      type?: string;
      userId?: string;
      resourceId?: string;
      error?: Error;
      response?: IPushNotificationMessageResponse[];
    },
  ): Promise<{ id: string } | undefined> {
    if (!this.enabledLogLevels.has(level)) {
      return;
    }

    const deviceTokens = 'token' in data ? (typeof data.token === 'string' ? [data.token] : data.token) : [];

    let payload: IPushNotificationLog = { event, level };

    if (this.config.logDetail === PushNotificationLogDetail.ADDRESS) {
      if (data.template) payload.template = data.template;
      if (data.provider) payload.provider = data.provider;
      if (data.resourceName) payload.resourceName = data.resourceName;
    }

    if ([PushNotificationLogDetail.CONTENT, PushNotificationLogDetail.DETAILS].includes(this.config.logDetail)) {
      if (data.title) payload.title = data.title;
      if (data.body) payload.body = data.body;
      if (data.templateValues) payload.templateValues = data.templateValues;
      if (context?.response) payload.response = context.response;
      if (deviceTokens.length > 0) payload.deviceTokens = deviceTokens;
    }

    if (context?.error) {
      payload.failedMessage = context.error.message;
    }

    this.logger.send({
      level: event === PushNotificationLogEvent.SENT ? 'log' : 'error',
      data: payload as unknown as Record<string, unknown>,
      error: context?.error,
    });

    if (!this.activityService) {
      // activities not enabled
      return;
    }

    if (this.config.logDetail === PushNotificationLogDetail.CONTENT) {
      if (data.data) payload.data = data.data;
      if (context?.response) payload.response = context.response;
    }

    const activity = await this.activityService.create({
      ...context,
      module: context?.module ?? 'push-notification',
      type: context?.type ?? 'push-notification',
      payload: payload as unknown as Record<string, unknown>,
    });

    return activity ? { id: activity.id } : undefined;
  }
}
