import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeAll, describe, it } from 'vitest';

import { getConfig } from '~common/config';
import { AwsSesEmailConfig } from '~common/email/providers/aws-ses/aws-ses-email.config';
import { LoggerModule } from '~common/logger';

import { EmailModule } from '../../../email.module';
import { EmailService } from '../../../email.service';
import { AwsSesEmailPlugin } from '../aws-ses-email.plugin';

const awsSesEmailConfig = getConfig(AwsSesEmailConfig);

describe.skipIf(!awsSesEmailConfig.apiEndpoint)('AWS SES', () => {
  let app: INestApplication;
  let emailService: EmailService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [LoggerModule, EmailModule.forRoot([AwsSesEmailPlugin])],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    emailService = app.get(EmailService);
  });

  it('should send a test email using aws ses', async ({ expect }) => {
    const { response } = await emailService.send({
      to: 'info@example.com',
      htmlContent: 'test',
      subject: 'test',
      textContent: 'test',
    });
    expect(response).toEqual(expect.objectContaining({ messageId: expect.any(String) }));
  });
});
