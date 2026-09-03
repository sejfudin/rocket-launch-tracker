import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, it } from 'vitest';

import { EmailModule, EmailService } from '~common/email';
import { HtmlEmailCompilerPlugin } from '~common/email/compilers/html.email-compiler';
import { EmailProvider } from '~common/email/email-provider.abstract';
import { EmailCompilerType, IEmailData } from '~common/email/models';
import { NoOpEmailProviderPlugin } from '~common/email/providers/no-op';
import { EmailProviderMock } from '~common/email/tests/email.mock';
import { EmailTemplateProviderMock } from '~common/email/tests/email-template-persistor.mock';
import { LoggerModule } from '~common/logger';
import { makeUUID } from '~common/utils/short-uuid';

describe('Email Template Persistor', () => {
  let app: INestApplication;
  let emailService: EmailService;
  let emailProvider = EmailProviderMock.useValue;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        LoggerModule,
        EmailModule.forRoot([
          NoOpEmailProviderPlugin,
          HtmlEmailCompilerPlugin,
          { providers: [EmailTemplateProviderMock, EmailProviderMock] },
        ]),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    emailService = app.get(EmailService);
    emailProvider = app.get(EmailProvider);
  });

  afterAll(async () => {
    emailProvider.send.mock.resetCalls();
  });

  it('should compile the email template using the persisted template', async ({ expect }) => {
    EmailTemplateProviderMock.useValue.find.mock.mockImplementationOnce(async () => ({
      id: makeUUID(),
      name: 'runtime-template',
      engine: EmailCompilerType.HTML,
      html: 'hello bob:{{bob}}',
      text: 'dummy text',
      subject: 'dummy text',
    }));
    emailProvider.send.mock.mockImplementationOnce(async (data: IEmailData) => {
      expect(data.htmlContent).toContain('bob:123456');
      return {
        status: 'success',
      };
    });
    await emailService.sendTemplate({ to: 'info@example.com' }, 'runtime-template', {
      bob: '123456',
    });
  });
});
