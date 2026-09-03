import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import sgClient from '@sendgrid/client';
import { MailDataRequired, MailService } from '@sendgrid/mail';

import { ISettingsSection, SettingsPopulate, SettingsStatus } from '~common/settings';

import { EmailProviderSendError } from '../../email.exceptions';
import { EmailLoader } from '../../email.loader';
import { EmailProvider } from '../../email-provider.abstract';
import type { IEmailData, IEmailSendResponse } from '../../models';
import { stringToEmailJson } from '../../transformers/email-json.transform';
import { SendgridEmailConfig } from './sendgrid-email.config';

export const SENDGRID_PROVIDER_NAME = 'sendgrid';

@Injectable()
export class SendgridEmailProvider implements EmailProvider, OnApplicationBootstrap {
  readonly name = SENDGRID_PROVIDER_NAME;
  private readonly mailService?: MailService;

  constructor(
    private readonly sendgridEmailConfig: SendgridEmailConfig,
    private readonly loader: EmailLoader,
  ) {
    if (sendgridEmailConfig.enabled) {
      this.mailService = new MailService();
      if (!sendgridEmailConfig.apiKey) {
        throw new EmailProviderSendError('Sendgrid API key not set', { code: 'sendgrid-not-configured' });
      }
      this.mailService.setApiKey(sendgridEmailConfig.apiKey);
      sgClient.setApiKey(sendgridEmailConfig.apiKey);
    }
  }

  onApplicationBootstrap() {
    this.loader.registerProvider(SENDGRID_PROVIDER_NAME, this);
  }

  async send(data: IEmailData): Promise<IEmailSendResponse> {
    if (!this.mailService) {
      throw new EmailProviderSendError('Sendgrid not enabled', { code: 'sendgrid-not-enabled' });
    }

    const message: MailDataRequired = {
      from: data.from,

      to: data.to,
      cc: data.cc,
      bcc: data.bcc,

      subject: data.subject!,
      html: data.htmlContent!,
      text: data.textContent!,

      // send email using sendgrid template
      // templateId
      // dynamicTemplateData

      // attachments
    };

    if (data.template) {
      message.templateId = data.template;
      message.dynamicTemplateData = data.templateValues;
    }

    if (data.replyTo) {
      if (Array.isArray(data.replyTo)) {
        message.replyToList = data.replyTo.map(stringToEmailJson);
      } else {
        message.replyTo = data.replyTo;
      }
    }

    if (Array.isArray(data.to) && data.to.length > 1) {
      // send multiple emails, recipient do not see each other
      message.isMultiple = true;
    }

    try {
      const response = await this.mailService.send(message);
      return {
        // todo, check if this is the correct messageId
        messageId: response[0]?.headers['x-message-id'],
        response,
        status: 'done',
      };
    } catch (error) {
      throw new EmailProviderSendError('Error sending email', {
        details: { data },
        cause: error,
        code: 'error-sending-email',
      });
    }
  }

  /**
   * Preprocess email before template
   */
  public async preprocess(data: IEmailData): Promise<IEmailData> {
    return data;
  }

  /**
   * Test SendGrid API authentication by making a simple API call
   */
  public async testAuthentication(): Promise<{ isAuthenticated: boolean; error?: string }> {
    if (!this.mailService) {
      return {
        isAuthenticated: false,
        error: 'SendGrid not enabled',
      };
    }

    try {
      // Use the scopes endpoint to test authentication
      // This is a lightweight call that requires valid API key
      const request = {
        method: 'GET' as const,
        url: '/v3/scopes',
      };

      await sgClient.request(request);

      return {
        isAuthenticated: true,
      };
    } catch (error) {
      let errorMessage = 'Unknown authentication error';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // SendGrid errors often have a response property
        const sendgridError = error as any;
        if (sendgridError.response?.body?.errors?.[0]?.message) {
          errorMessage = sendgridError.response.body.errors[0].message;
        } else if (sendgridError.message) {
          errorMessage = sendgridError.message;
        }
      }

      return {
        isAuthenticated: false,
        error: errorMessage,
      };
    }
  }

  async getSettings(options: { populate?: Array<SettingsPopulate> }): Promise<ISettingsSection> {
    let status = SettingsStatus.Disabled;
    let statusMessage = 'Sendgrid is disabled';

    if (this.sendgridEmailConfig.enabled) {
      const authResult = await this.testAuthentication();
      if (authResult.isAuthenticated) {
        status = SettingsStatus.Ok;
        statusMessage = 'Emails are sent via Sendgrid';
      } else {
        status = SettingsStatus.Error;
        statusMessage = authResult.error || 'Sendgrid authentication test failed';
      }
    }

    const prefix = `email.${SENDGRID_PROVIDER_NAME}`;

    return {
      name: prefix,
      label: 'Sendgrid',
      description: 'Emails are sent via sendgrid',
      items: undefined,
    };
  }
}
