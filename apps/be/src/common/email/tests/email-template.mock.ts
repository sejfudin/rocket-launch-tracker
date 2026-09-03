import { Injectable } from '@nestjs/common';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

import { RegisterEmailTemplate } from '../email.decorators';
import { EmailCompilerType, type IEmailData, type IEmailTemplate } from '../models';

export class MyEmailTemplateData {
  @Expose()
  @IsString()
  code!: string;
}

export const MyEmailTemplate: IEmailTemplate = {
  name: 'MY_EMAIL_TEMPLATE',
  subject: 'Forgot Password: {{code}}',
  engine: EmailCompilerType.HTML,
  html: `
    <p>This is your code: {{code}}.</p>
  `,
  text: `
    Click here do the thing: {{code}}
  `,
};

@Injectable()
export class MyTemplateProvider {
  @RegisterEmailTemplate({
    validate: MyEmailTemplateData,
    template: MyEmailTemplate,
  })
  passwordReset(data: IEmailData<MyEmailTemplateData>) {
    // This is a preprocessor that can modify the data before sending the email
    return data;
  }
}
