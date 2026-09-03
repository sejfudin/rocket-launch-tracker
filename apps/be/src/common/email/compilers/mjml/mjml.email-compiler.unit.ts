import { type INestApplication, Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { beforeAll, describe, it } from 'vitest';

import { LoggerModule } from '~common/logger';

import { RegisterEmailTemplate } from '../../email.decorators';
import { EmailModule } from '../../email.module';
import { EmailService } from '../../email.service';
import { EmailCompilerType, type IEmailData, type IEmailTemplate } from '../../models';
import { NoOpEmailProviderPlugin } from '../../providers/no-op';
import { MjmlEmailCompilerPlugin } from './mjml.email-compiler';

export class MyMjmlTemplateData {
  @Expose()
  @IsString()
  code!: string;
}

export const MyMjmlTemplate: IEmailTemplate = {
  name: 'MY_MJML_TEMPLATE',
  subject: 'Forgot Password: {{code}}',
  engine: EmailCompilerType.MJML,
  html: `
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>
          bob:{{bob}}
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
  `,
  text: `
    Click here do the thing: {{code}}
  `,
};

@Injectable()
export class MyTemplateProvider {
  @RegisterEmailTemplate({
    validate: MyMjmlTemplateData,
    template: MyMjmlTemplate,
  })
  passwordReset(data: IEmailData<MyMjmlTemplateData>) {
    return data;
  }
}

describe('Mjml Email Compiler', () => {
  let app: INestApplication;
  let emailService: EmailService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [LoggerModule, EmailModule.forRoot([NoOpEmailProviderPlugin, MjmlEmailCompilerPlugin])],
      providers: [MyTemplateProvider],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    emailService = app.get(EmailService);
  });

  it('should render a template using mjml', async () => {
    try {
      await emailService.sendTemplate({ to: 'info@example.com' }, MyMjmlTemplate.name, {
        code: '123456',
      });
    } catch (e: any) {
      if ('code' in e && e.code === 'mjml-not-installed') {
        return; //  skip(); - webstorm does not handle this skip well
      }
      throw e;
    }
  });
});
