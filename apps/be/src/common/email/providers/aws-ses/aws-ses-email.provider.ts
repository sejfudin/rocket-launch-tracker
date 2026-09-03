import { GetAccountCommand, SESv2Client, SendEmailCommand, type SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { ISettingsSection, SettingsPopulate, SettingsSettingAction, SettingsStatus } from '~common/settings';
import type { JsonObject } from '~common/types';

import { EmailProviderSendError } from '../../email.exceptions';
import { EmailLoader } from '../../email.loader';
import { EmailProvider } from '../../email-provider.abstract';
import type { IEmailData, IEmailSendResponse } from '../../models';
import { AwsSesEmailConfig } from './aws-ses-email.config';

export const AWS_SES_PROVIDER_NAME = 'aws-ses';

@Injectable()
export class AwsSesEmailProvider implements EmailProvider, OnApplicationBootstrap {
  readonly name = AWS_SES_PROVIDER_NAME;

  constructor(
    private readonly sesConfig: AwsSesEmailConfig,
    private readonly loader: EmailLoader,
  ) {
    if (sesConfig.enabled) {
      this.client = new SESv2Client({
        region: sesConfig.region,
        credentials:
          sesConfig.accessKeyId && sesConfig.secretAccessKey
            ? {
                accessKeyId: sesConfig.accessKeyId,
                secretAccessKey: sesConfig.secretAccessKey,
              }
            : undefined,
        endpoint: sesConfig.apiEndpoint,
      });
    }
  }

  onApplicationBootstrap() {
    this.loader.registerProvider(AWS_SES_PROVIDER_NAME, this);
  }

  private readonly client?: SESv2Client;

  async send(data: IEmailData): Promise<IEmailSendResponse> {
    if (!this.client) {
      throw new EmailProviderSendError('AWS SES is not configured', { code: 'aws-ses-not-configured' });
    }

    /**
     * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-sesv2/Interface/SendEmailCommandInput/
     */
    const params: SendEmailCommandInput = {
      FromEmailAddress: data.from,

      Destination: {
        ToAddresses: Array.isArray(data.to) ? data.to : [data.to],
        CcAddresses: data.cc,
        BccAddresses: data.bcc,
      },

      Content: {
        Simple: {
          Subject: {
            Data: data.subject,
          },
          Body: {
            Html: data.htmlContent
              ? {
                  Data: data.htmlContent,
                }
              : undefined,
            Text: data.textContent
              ? {
                  Data: data.textContent,
                }
              : undefined,
          },
          Attachments: data.attachments?.map((attachment) => {
            const buffer = Buffer.from(attachment.data, 'base64');
            return {
              FileName: attachment.filename,
              ContentId: attachment.contentId,
              ContentType: attachment.contentType,
              ContentDescription: attachment.description,
              ContentDisposition: attachment.contentDisposition,
              RawContent: new Uint8Array(buffer),
              ContentTransferEncoding: 'BASE64',
            };
          }),
        },
      },

      ReplyToAddresses: data.replyTo ? (Array.isArray(data.replyTo) ? data.replyTo : [data.replyTo]) : undefined,

      EmailTags: this.sesConfig.tags?.map((tag) => ({
        Name: tag.name,
        Value: tag.value,
      })),
    };

    const command = new SendEmailCommand(params);
    try {
      const response = await this.client.send(command);
      return {
        messageId: response.MessageId,
        response: response.$metadata as JsonObject,
        status: 'done',
      };
    } catch (error) {
      throw new EmailProviderSendError('Error Sending Email', { cause: error });
    }
  }

  /**
   * Preprocess email before template
   */
  public async preprocess(data: IEmailData): Promise<IEmailData> {
    return data;
  }

  /**
   * Test AWS SES client connection and credentials by attempting to get account information
   */
  private async testConnection(): Promise<{ connected: boolean; error?: string }> {
    if (!this.client) {
      return { connected: false, error: 'AWS SES client is not initialized' };
    }

    try {
      const command = new GetAccountCommand({});
      await this.client.send(command);
      return { connected: true };
    } catch (error) {
      let errorMessage = 'Unknown connection error';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        connected: false,
        error: errorMessage,
      };
    }
  }

  async getSettings(options: { populate?: Array<SettingsPopulate> }): Promise<ISettingsSection> {
    let status = SettingsStatus.Disabled;
    let statusMessage = 'Disabled';

    if (this.sesConfig.enabled) {
      const connectionTest = await this.testConnection();

      if (connectionTest.connected) {
        status = SettingsStatus.Ok;
        statusMessage = 'Emails are sent via AWS SES';
      } else {
        status = SettingsStatus.Error;
        statusMessage = connectionTest.error || 'Not connected';
      }
    }

    const prefix = `email.${AWS_SES_PROVIDER_NAME}`;

    return {
      name: prefix,
      label: 'AWS SES',
      status,
      statusMessage,
      items: options.populate?.includes(SettingsPopulate.Items)
        ? [
            {
              name: `${prefix}.region`,
              label: 'Region',
              value: this.sesConfig.region,
              actions: [SettingsSettingAction.Copy],
            },
          ]
        : undefined,
    };
  }
}
