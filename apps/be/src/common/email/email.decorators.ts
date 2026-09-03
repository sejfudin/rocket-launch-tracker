import { extendArrayMetadata } from '@nestjs/common/utils/extend-metadata.util';

import {
  EMAIL_TEMPLATE_CLASS_MARKER,
  EMAIL_TEMPLATE_METADATA,
  EmailCompilerType,
  type IEmailTemplateMetadata,
} from './models';

/**
 * Mark method as an email template preprocessor
 * @example external template
 *  @RegisterEmailTemplate({ template: 'authn-magic-link' validate: LocalAuthnMagicLinkRequestEmailTemplateData })
 *  async passwordResetTemplate(data: IEmailData): Promise<IEmailData> {
 *    // preprocess data
 *    return data;
 *  }
 *
 * @example static template
 *  export const MyEmailTemplate: IEmailTemplate = {
 *   name: 'authn-magic-link',
 *   engine: 'html',
 *   subject: 'Hello {{name}}',
 *   html: `<p>Hello {{name}}</p>
 *   `,
 *   text: 'Hello {{name}}',
 *  };
 *
 *  export class MyEmailTemplateData {
 *   @Expose()
 *   @IsString()
 *   name!: string;
 *  }
 *
 *  @RegisterEmailTemplate({ template: MyEmailTemplate, validate: MyEmailTemplateData })
 *  async passwordResetTemplate(data: IEmailData<MyEmailTemplateData>): Promise<IEmailData> {
 *    // preprocess data
 *    return data;
 *  }
 */
export function RegisterEmailTemplate(options: IEmailTemplateMetadata | string): MethodDecorator {
  const input: IEmailTemplateMetadata =
    typeof options === 'string' ? { template: { name: options, engine: EmailCompilerType.EXTERNAL } } : options;
  return (target: object, key?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (descriptor && typeof descriptor.value === 'function') {
      extendArrayMetadata(EMAIL_TEMPLATE_METADATA, [input], descriptor.value);
      Reflect.defineMetadata(EMAIL_TEMPLATE_CLASS_MARKER, true, target.constructor);
    }
    return descriptor;
  };
}
