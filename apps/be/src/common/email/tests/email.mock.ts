import { mock } from 'node:test';

import { EmailService } from '../email.service';
import { EmailProvider } from '../email-provider.abstract';
import { type IEmailSendResponse } from '../models/email.types';
import { type ProviderMock } from '~test/utils';

/**
 * Mock all calls to EmailService
 */
export const EmailServiceMock: ProviderMock<EmailService> = {
  provide: EmailService,
  useValue: {
    send: mock.fn(async () => {
      return { messageId: 'mock-id', status: 'sent' };
    }),
    sendTemplate: mock.fn(async () => {
      return { messageId: 'mock-id', response: undefined, status: 'sent' } satisfies IEmailSendResponse;
    }),
  },
};

/**
 * Mock calls to Email Providers
 */
export const EmailProviderMock: ProviderMock<EmailProvider> = {
  provide: EmailProvider,
  useValue: {
    send: mock.fn(async () => {
      return { messageId: 'mock-id', response: undefined, status: 'sent' } satisfies IEmailSendResponse;
    }),
    preprocess: mock.fn(async (a) => a),
    name: 'mock-provider',
  },
};
