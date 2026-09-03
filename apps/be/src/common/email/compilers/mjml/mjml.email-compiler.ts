import { Injectable, ModuleMetadata, OnApplicationBootstrap } from '@nestjs/common';
import mjml2html from 'mjml';

import { IEmailData, IEmailTemplate } from '~common/email/models';
import { JsonObject } from '~common/types';

import { EmailPreprocessorError } from '../../email.exceptions';
import { EmailLoader } from '../../email.loader';
import { EmailCompiler } from '../../email-compiler.abstract';

@Injectable()
export class MjmlEmailCompiler implements EmailCompiler, OnApplicationBootstrap {
  constructor(private readonly loader: EmailLoader) {}

  async onApplicationBootstrap() {
    this.loader.registerTemplateCompiler('mjml', this);
  }

  private replaceTemplateValues(templateString: string, values: JsonObject | undefined): string {
    if (values && Object.keys(values).length > 0) {
      for (const [key, value] of Object.entries(values)) {
        if (!value || (typeof value !== 'string' && typeof value !== 'number')) continue;
        templateString = templateString.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(value));
      }
    }
    return templateString;
  }

  public async compile(data: IEmailData, template: IEmailTemplate): Promise<IEmailData> {
    if (!template.subject || !template.text || !template.html) {
      const templateName = data.template ?? template.name;
      throw new EmailPreprocessorError(
        `Email template: ${templateName} is not setup correctly for MJML compiling.
         Subject, text and html must be set in the template data`,
        {
          code: 'email-template-not-setup-for-mjml-compilation',
          details: { hint: `Setup subject, text and html in template ${templateName}` },
        },
      );
    }

    data.subject = this.replaceTemplateValues(template.subject, data.templateValues);
    data.textContent = this.replaceTemplateValues(template.text, data.templateValues);

    const html = this.replaceTemplateValues(template.html, data.templateValues);
    try {
      const result = mjml2html(html, {
        keepComments: false,
        minify: false,
        validationLevel: 'soft',

        // do not use includes
        ignoreIncludes: true,
      });
      if (result.errors.length) {
        throw new EmailPreprocessorError('Template Render Failed', {
          details: { errors: result.errors, data, template } as any,
        });
      }
      data.htmlContent = result.html;
    } catch (error) {
      if (error instanceof EmailPreprocessorError) {
        throw error;
      }
      throw new EmailPreprocessorError('Template Failed', { cause: error, details: { data, template } as any });
    }

    return data;
  }
}

export const MjmlEmailCompilerPlugin: ModuleMetadata = {
  providers: [MjmlEmailCompiler],
};
