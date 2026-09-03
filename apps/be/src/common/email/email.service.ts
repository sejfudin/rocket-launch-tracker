import { Injectable, Optional } from '@nestjs/common';

import { ActivityService } from '~common/activities/activity.service';
import { BadRequestException } from '~common/exceptions';
import { BaseLogLevel, BaseLogLevelEnum, LogLevelOrder, LoggerService } from '~common/logger';
import type { JsonObject } from '~common/types';
import { plainToValidatedInstance } from '~common/validate';

import { EmailConfig } from './email.config';
import { EmailSendError } from './email.exceptions';
import { EmailLoader } from './email.loader';
import { EmailTemplateProvider } from './email-template-provider.abstract';
import {
  EmailLogDetail,
  EmailLogEvent,
  EmailMode,
  IEmailData,
  IEmailLog,
  IEmailPartialData,
  IEmailSendResponse,
  IEmailTemplate,
  IEmailTemplateData,
} from './models';

@Injectable()
export class EmailService {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: EmailConfig,
    private readonly loader: EmailLoader,
    @Optional()
    private readonly templateProvider: EmailTemplateProvider,
    @Optional()
    private readonly activityService: ActivityService,
  ) {
    this.enabledLogLevels = new Set(LogLevelOrder.slice(0, LogLevelOrder.indexOf(this.config.logLevel) + 1));
  }

  /**
   * Send raw email to (multiple) destinations
   * @example
   *   await emailService.send({
   *    to: 'name@email.com'
   *    subject: 'Hello',
   *    textContent: 'Hello world',
   *    htmlContent: 'Hello world',
   *    provider: 'aws-ses',
   *   });
   */
  async send(data: IEmailPartialData & { provider?: string }): Promise<IEmailSendResponse> {
    if (this.config.mode === EmailMode.DISABLED) {
      throw new EmailSendError('Email sending is disabled', { code: 'email-sending-disabled' });
    }

    if ('template' in data && (data as { template?: unknown }).template) {
      throw new BadRequestException('Template not supported in this context');
    }

    const providerName = data.provider || this.config.defaultProvider;
    if (!providerName) {
      throw new BadRequestException('Provider is required', { code: 'provider-required' });
    }

    const provider = this.loader.providers[providerName];
    if (!provider) {
      throw new BadRequestException(`Provider '${providerName}' not found`, { code: 'provider-not-found' });
    }

    if (!data.from) {
      data.from = this.config.defaultFrom;
    }

    if (!data.from) {
      throw new BadRequestException('No from address provided', { code: 'from-address-missing' });
    }

    if (this.config.mode === EmailMode.SUPPRESSED) {
      await this.log(EmailLogEvent.SUPPRESSED, BaseLogLevelEnum.warn, data, { provider: providerName });
      return { status: EmailLogEvent.SUPPRESSED } satisfies IEmailSendResponse;
    }

    try {
      const response = await provider.send(data as IEmailData);
      await this.log(EmailLogEvent.SENT, BaseLogLevelEnum.log, data, { response, provider: providerName });
      return response;
    } catch (e) {
      await this.log(EmailLogEvent.FAILED, BaseLogLevelEnum.error, data, {
        error: e instanceof Error ? e : new Error(String(e)),
        provider: providerName,
      });
      throw e;
    }
  }

  /**
   * Send an email using a template
   * @example
   *   await emailService.sendTemplate({ to: 'name@example.com' }, 'welcome', { name: 'John' });
   */
  async sendTemplate<T = JsonObject>(
    data: Omit<IEmailTemplateData, 'template' | 'templateValues'> & { provider?: string },
    name: string,
    values?: T,
  ): Promise<IEmailSendResponse> {
    if (this.config.mode === EmailMode.DISABLED) {
      throw new EmailSendError('Email sending is disabled', { code: 'email-sending-disabled' });
    }

    const { defaultFrom } = this.config;

    let computed: IEmailData = {
      ...data,
      from: data.from ?? defaultFrom!,
      template: name,
      templateValues: values as JsonObject,
      templateOptions: { provider: 'none' },
    };

    const staticTemplate = this.loader.staticTemplates[name];
    if (staticTemplate) {
      let templateValues = computed.templateValues;
      if (staticTemplate.templateOptions?.validate) {
        templateValues = plainToValidatedInstance(
          staticTemplate.templateOptions?.validate,
          templateValues,
        ) as JsonObject;
      }

      /**
       * Preprocess the email using the EmailTemplateDecorator
       *  the decorator can modify the data or template name, inject data, etc
       */
      computed = await staticTemplate.templateFunction({ ...computed, templateValues });
      computed.templateOptions = { ...computed.templateOptions, provider: 'static' };
    }

    const providerName = data.provider || this.config.defaultProvider;
    if (!providerName) {
      throw new BadRequestException('Provider is required', { code: 'provider-required' });
    }

    const provider = this.loader.providers[providerName];
    if (!provider) {
      throw new BadRequestException(`Provider '${providerName}' not found`, { code: 'provider-not-found' });
    }

    /**
     * Preprocess the email data using the provider service
     *  the provider can decide to modify the data, use an internal template, etc
     */
    computed = await provider.preprocess(computed);

    /**
     * If the templates are enabled and were not disabled by the preprocessors
     */
    if (computed.templateOptions?.provider && ['none', 'static'].includes(computed.templateOptions?.provider)) {
      let template: IEmailTemplate | undefined;

      /**
       * Default to the preprocessor template
       */
      if (staticTemplate?.templateOptions?.template && typeof staticTemplate.templateOptions.template === 'object') {
        template = staticTemplate.templateOptions.template;
      }

      /**
       * Get template from persistence
       */
      if (this.templateProvider) {
        try {
          const persistedTemplate = await this.templateProvider.find({ name });
          if (persistedTemplate) {
            template = persistedTemplate;
          }
        } catch (error) {
          this.logger.warn('Error loading template from persistor', { name, error });
        }
      }

      if (!template) {
        throw new EmailSendError(`Template '${name}' not found`, { code: 'template-not-found' });
      }

      const engine = template.engine || 'html';

      if (!(engine in this.loader.templateCompilers)) {
        throw new EmailSendError(`Template engine '${engine}' not loaded`, { code: 'template-compiler-not-loaded' });
      }

      if (!computed.cc && template.cc) {
        computed.cc = template.cc;
      }
      if (!computed.bcc && template.bcc) {
        computed.bcc = template.bcc;
      }
      if (!data.from && template.from) {
        // override the default if not explicitly provided
        computed.from = template.from;
      }
      if (!computed.attachments && template.attachments) {
        computed.attachments = template.attachments;
      }

      /**
       * Render the template using the selected engine
       */
      computed = await this.loader.templateCompilers[engine].compile(computed, template);
    }

    if (
      !computed.template ||
      (computed.templateOptions?.provider && ['none', 'static'].includes(computed.templateOptions?.provider))
    ) {
      for (const key of ['from', 'subject', 'to'] as Array<keyof IEmailData>) {
        if (!(key in computed) || !computed[key]) {
          throw new EmailSendError(`Email needs the '${key}' value`, { code: `${key}-not-provided` });
        }
      }
    } // else the template was disabled by the preprocessors but a template was provided

    if (this.config.mode === EmailMode.SUPPRESSED) {
      await this.log(EmailLogEvent.SUPPRESSED, BaseLogLevelEnum.warn, computed, { provider: providerName });
      return { response: null, status: EmailLogEvent.SUPPRESSED } as unknown as IEmailSendResponse;
    }

    try {
      const response = await provider.send(computed);
      await this.log(EmailLogEvent.SENT, BaseLogLevelEnum.log, computed, { response, provider: providerName });
      return response;
    } catch (e) {
      await this.log(EmailLogEvent.FAILED, BaseLogLevelEnum.error, computed, {
        error: e instanceof Error ? e : new Error(String(e)),
        provider: providerName,
      });
      throw e;
    }
  }

  private enabledLogLevels: Set<BaseLogLevel>;

  private async log(
    event: EmailLogEvent,
    level: BaseLogLevelEnum,
    data: Partial<IEmailData>,
    context?: {
      module?: string;
      type?: string;
      userId?: string;
      resourceId?: string;
      error?: Error;
      response?: IEmailSendResponse;
      provider?: string;
    },
  ): Promise<{ id: string } | undefined> {
    if (!this.enabledLogLevels.has(level)) {
      return;
    }

    let payload: IEmailLog = { event: event, level };

    if ([EmailLogDetail.CONTENT, EmailLogDetail.DETAILS, EmailLogDetail.ADDRESS].includes(this.config.logDetail)) {
      if (data.template) payload.template = data.template;
      if (data.to) payload.to = Array.isArray(data.to) ? data.to : [data.to];
      if (data.cc) payload.cc = Array.isArray(data.cc) ? data.cc : [data.cc];
      if (data.bcc) payload.bcc = Array.isArray(data.bcc) ? data.bcc : [data.bcc];
      if (context?.provider) payload.provider = context.provider;
      if (data.from) payload.from = data.from;
    }

    if ([EmailLogDetail.CONTENT, EmailLogDetail.DETAILS].includes(this.config.logDetail)) {
      if (data.subject) payload.subject = data.subject;
      if (data.templateOptions) payload.templateOptions = data.templateOptions;
      if (data.templateValues) payload.templateValues = data.templateValues;
      if (context?.response) payload.response = context.response;
    }

    if (context?.error) {
      payload.failedMessage = context.error.message;
    }

    this.logger.send({
      level,
      data: payload as unknown as Record<string, unknown>,
      error: context?.error,
    });

    if (!this.activityService) {
      // activities not enabled
      return;
    }

    if (this.config.logDetail === EmailLogDetail.CONTENT) {
      if (data.htmlContent) payload.htmlContent = data.htmlContent;
      if (data.textContent) payload.textContent = data.textContent;
    }

    const activity = await this.activityService.create({
      ...context,
      module: context?.module ?? 'email',
      type: context?.type ?? 'email',
      payload: payload as unknown as Record<string, unknown>,
    });

    return activity ? { id: activity.id } : undefined;
  }
}
