import { Injectable } from '@nestjs/common';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

import { RegisterEmailTemplate } from '~common/email/email.decorators';
import { EmailCompilerType, IEmailData, type IEmailTemplate } from '~common/email/models';

export class AdminUserAuthMagicLinkRequestEmailTemplateData {
  @Expose()
  @IsString()
  url!: string;

  @Expose()
  @IsString()
  expiresIn!: string;
}

export const AdminUserAuthMagicLinkRequestEmailTemplate: IEmailTemplate = {
  name: 'admin-user-authn-local-magic-link',
  engine: EmailCompilerType.HTML,
  subject: 'Magic Link',
  html: `
    <p>Click <a href="{{url}}">here</a> to log in.</p>
    <p>This link will expire {{expiresIn}}</p>
  `,
  text: 'Click here to log in',
};

@Injectable()
export class UserAuthMagicLinkEmailTemplates {
  @RegisterEmailTemplate({
    validate: AdminUserAuthMagicLinkRequestEmailTemplateData,
    template: AdminUserAuthMagicLinkRequestEmailTemplate,
  })
  async passwordResetTemplate(data: IEmailData<AdminUserAuthMagicLinkRequestEmailTemplateData>): Promise<IEmailData> {
    return data as unknown as IEmailData;
  }
}
