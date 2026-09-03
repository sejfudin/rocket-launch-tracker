import { Injectable } from '@nestjs/common';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

import { RegisterEmailTemplate } from '~common/email/email.decorators';
import { EmailCompilerType, IEmailData, IEmailTemplate } from '~common/email/models';

export class UserAuthForgotPasswordRequestTemplateData {
  @Expose()
  @IsString()
  url!: string;

  @Expose()
  @IsString()
  expiresIn!: string;
}

export const UserAuthForgotPasswordRequestTemplate: IEmailTemplate = {
  name: 'user-auth-forgot-password',
  engine: EmailCompilerType.HTML,
  subject: 'Reset your password',
  html: `
    <p>Click <a href="{{url}}">here</a> to change your password.</p>
    <p>This link will expire {{expiresIn}}</p>
  `,
  text: 'Click here to reset your password',
};

@Injectable()
export class UserAuthForgotPasswordEmailTemplates {
  @RegisterEmailTemplate({
    validate: UserAuthForgotPasswordRequestTemplateData,
    template: UserAuthForgotPasswordRequestTemplate,
  })
  async passwordResetTemplate(data: IEmailData<UserAuthForgotPasswordRequestTemplateData>): Promise<IEmailData> {
    return data as unknown as IEmailData;
  }
}
