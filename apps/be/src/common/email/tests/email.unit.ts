import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, it } from 'vitest';

import { EmailConfig } from '~common/email/email.config';
import { EmailLoader } from '~common/email/email.loader';
import { LoggerModule } from '~common/logger';

import { HtmlEmailCompilerPlugin } from '../compilers/html.email-compiler';
import { EmailModule } from '../email.module';
import { EmailService } from '../email.service';
import { NO_OP_PROVIDER_NAME } from '../providers/no-op';
import { EmailProviderMock } from '../tests/email.mock';
import { MyEmailTemplate, type MyEmailTemplateData, MyTemplateProvider } from './email-template.mock';

describe('EmailService', () => {
  let app: INestApplication;
  let emailService: EmailService;
  let emailLoader: EmailLoader;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [LoggerModule, EmailModule.forRoot([HtmlEmailCompilerPlugin])],
      providers: [
        MyTemplateProvider,
        EmailProviderMock,
        { provide: EmailConfig, useValue: { defaultProvider: EmailProviderMock.useValue.name } },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    emailService = app.get(EmailService);
    emailLoader = app.get(EmailLoader);
    emailLoader.registerProvider(NO_OP_PROVIDER_NAME, EmailProviderMock.useValue);
  });

  afterAll(async () => {
    EmailProviderMock.useValue.send.mock.resetCalls();
  });

  it('should compile the email template', async ({ expect }) => {
    await emailService.sendTemplate<MyEmailTemplateData>({ to: 'info@example.com' }, MyEmailTemplate.name, {
      code: '123456',
    });
    expect(EmailProviderMock.useValue.send.mock.calls[0].arguments[0].htmlContent).toContain(
      'This is your code: 123456.',
    );
  });
});
